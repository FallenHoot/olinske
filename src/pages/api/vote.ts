import type { APIRoute } from 'astro';
import { TableClient } from '@azure/data-tables';
import { DefaultAzureCredential } from '@azure/identity';
import crypto from 'crypto';

// ============================================================================
// POST /api/vote — Submit a vote (thumbs up or down)
// GET /api/vote?slug=<post-slug> — Read current vote counts
// ============================================================================

const VOTES_TABLE = 'votes';
const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT_NAME || '';
const VOTE_TIMEOUT_MINUTES = 60; // Rate limit: one vote per IP per post per hour

if (!STORAGE_ACCOUNT) {
  console.warn('AZURE_STORAGE_ACCOUNT_NAME not set — votes will not persist.');
}

interface VoteEntity {
  partitionKey: string;
  rowKey: string;
  up?: number;
  down?: number;
  lastVotedIps?: string; // JSON stringified Map of ip -> timestamp
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

async function getTableClient(): Promise<TableClient | null> {
  if (!STORAGE_ACCOUNT) return null;

  const tableUrl = `https://${STORAGE_ACCOUNT}.table.core.windows.net`;
  try {
    // Use DefaultAzureCredential (managed identity in App Service, local Azure CLI auth in dev)
    const credential = new DefaultAzureCredential();
    return new TableClient(tableUrl, VOTES_TABLE, credential);
  } catch (err) {
    console.error('Failed to initialize Table Storage client:', err);
    return null;
  }
}

async function getVoteCounts(slug: string, client: TableClient): Promise<{ up: number; down: number }> {
  try {
    const entity = await client.getEntity<VoteEntity>(slug, 'totals');
    return { up: entity.up || 0, down: entity.down || 0 };
  } catch (err: any) {
    // 404 is expected for new posts
    if (err.status === 404) {
      return { up: 0, down: 0 };
    }
    console.error('Error reading vote counts:', err);
    return { up: 0, down: 0 };
  }
}

async function recordVote(
  slug: string,
  direction: 'up' | 'down',
  ipHash: string,
  client: TableClient
): Promise<boolean> {
  try {
    let entity = await getVoteCounts(slug, client).then(() => undefined);

    // Get current state (or create new)
    let currentUp = 0,
      currentDown = 0,
      lastVotedIps: Record<string, number> = {};

    try {
      const existing = await client.getEntity<VoteEntity>(slug, 'totals');
      currentUp = existing.up || 0;
      currentDown = existing.down || 0;
      if (existing.lastVotedIps) {
        lastVotedIps = JSON.parse(existing.lastVotedIps);
      }
    } catch (err: any) {
      if (err.status !== 404) throw err;
    }

    // Check rate limit: has this IP already voted in the last VOTE_TIMEOUT_MINUTES?
    const now = Date.now();
    const lastVoteTime = lastVotedIps[ipHash];
    if (lastVoteTime && now - lastVoteTime < VOTE_TIMEOUT_MINUTES * 60 * 1000) {
      return false; // Rate limited
    }

    // Increment vote count
    if (direction === 'up') {
      currentUp++;
    } else {
      currentDown++;
    }

    // Update rate limit
    lastVotedIps[ipHash] = now;

    // Clean up old entries (older than 24 hours)
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    for (const ip in lastVotedIps) {
      if (lastVotedIps[ip] < oneDayAgo) {
        delete lastVotedIps[ip];
      }
    }

    // Upsert vote entity
    await client.upsertEntity<VoteEntity>({
      partitionKey: slug,
      rowKey: 'totals',
      up: currentUp,
      down: currentDown,
      lastVotedIps: JSON.stringify(lastVotedIps)
    });

    return true;
  } catch (err) {
    console.error('Error recording vote:', err);
    return false;
  }
}

// ============================================================================
// GET /api/vote?slug=<slug> — Read vote counts
// ============================================================================

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');

  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return new Response(JSON.stringify({ error: 'slug parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const client = await getTableClient();
  if (!client) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const counts = await getVoteCounts(slug, client);

  return new Response(JSON.stringify(counts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache' // Votes are real-time
    }
  });
};

// ============================================================================
// POST /api/vote — Submit a vote
// ============================================================================

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { slug, direction } = body;

  // Validate slug
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    return new Response(JSON.stringify({ error: 'slug required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate direction
  if (direction !== 'up' && direction !== 'down') {
    return new Response(JSON.stringify({ error: 'direction must be "up" or "down"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const client = await getTableClient();
  if (!client) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get client IP and hash it
  const ip = getClientIp(request);
  const ipHash = hashIp(ip);

  // Record the vote
  const success = await recordVote(slug, direction, ipHash, client);

  if (!success) {
    return new Response(JSON.stringify({ error: 'Rate limited. Please wait before voting again.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Return updated counts
  const counts = await getVoteCounts(slug, client);

  return new Response(JSON.stringify(counts), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
