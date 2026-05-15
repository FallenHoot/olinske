#!/usr/bin/env node
/**
 * post-to-linkedin.mjs — Post a blog article share to LinkedIn
 *
 * Uses the LinkedIn API (v2) to create an ARTICLE share with a link preview card.
 * Reads the LinkedIn post markdown for commentary text and the distribution JSON
 * for canonical URL and hashtags.
 *
 * Usage:
 *   node scripts/post-to-linkedin.mjs --post content/published/000003-*.md --variant medium
 *   node scripts/post-to-linkedin.mjs --post content/published/000003-*.md --variant medium --dry-run
 *
 * Environment variables:
 *   LINKEDIN_ACCESS_TOKEN  - OAuth2 access token with w_member_social scope
 *   LINKEDIN_PERSON_URN    - LinkedIn person URN (e.g., urn:li:person:abc123)
 *
 * The script:
 *   1. Finds the matching LinkedIn post in content/linkedin/posts/ or content/linkedin/published/
 *   2. Reads the distribution JSON from .artifacts/blog/<slug>/
 *   3. Posts an ARTICLE share via the LinkedIn API
 *   4. Updates linkedinPostId in the LinkedIn post frontmatter
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE_BASE_URL = (process.env.BLOG_BASE_URL || 'https://zach.olinske.com').replace(/\/$/, '');

// ── Args ──────────────────────────────────────────────────────
function argValue(flag, defaultValue = '') {
  const idx = process.argv.findIndex(a => a === flag);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : defaultValue;
}

const postArg = argValue('--post', '');
const variant = argValue('--variant', 'medium');
const dryRun = process.argv.includes('--dry-run');

if (!postArg) {
  console.error('Usage: node scripts/post-to-linkedin.mjs --post <published-post-path> [--variant short|medium|long] [--dry-run]');
  process.exit(1);
}

// ── Resolve paths ─────────────────────────────────────────────
// Find the published post file (supports glob-like patterns)
function resolveGlob(pattern) {
  if (existsSync(pattern)) return pattern;
  const dir = dirname(pattern);
  const base = basename(pattern).replace('*', '');
  if (!existsSync(dir)) return null;
  const match = readdirSync(dir).find(f => f.includes(base) || base.includes(f.split('.')[0]));
  return match ? join(dir, match) : null;
}

const postPath = resolveGlob(postArg);
if (!postPath) {
  console.error(`Post not found: ${postArg}`);
  process.exit(1);
}

// Extract slug from filename
const postFilename = basename(postPath, '.md');
const slug = postFilename;

// Find the LinkedIn post markdown
function findLinkedInPost(slug) {
  for (const dir of ['content/linkedin/published', 'content/linkedin/posts']) {
    const fullDir = join(ROOT, dir);
    if (!existsSync(fullDir)) continue;
    const match = readdirSync(fullDir).find(f => f.startsWith(slug));
    if (match) return join(fullDir, match);
  }
  return null;
}

const linkedinPostPath = findLinkedInPost(slug);
if (!linkedinPostPath) {
  console.error(`No LinkedIn post found for slug: ${slug}`);
  console.error('Expected in content/linkedin/posts/ or content/linkedin/published/');
  process.exit(1);
}

// Find the distribution JSON
const distPath = join(ROOT, '.artifacts', 'blog', slug, 'linkedin-distribution.json');

// ── Parse frontmatter ─────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (kv) {
      let val = kv[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      meta[kv[1]] = val;
    }
  }
  return { meta, body: match[2].trim() };
}

// ── Read LinkedIn post content ────────────────────────────────
const linkedinRaw = readFileSync(linkedinPostPath, 'utf-8');
const { meta: linkedinMeta, body: linkedinBody } = parseFrontmatter(linkedinRaw);

// Read distribution JSON for canonical URL if available
let canonicalUrl = linkedinMeta.canonicalUrl || '';
let hashtags = [];
let distCanonicalUrl = '';

if (existsSync(distPath)) {
  const dist = JSON.parse(readFileSync(distPath, 'utf-8'));
  distCanonicalUrl = dist.canonicalUrl || '';
  canonicalUrl = canonicalUrl || dist.canonicalUrl || '';
  hashtags = dist.hashtags || [];
} else {
  // Parse hashtags from frontmatter
  const hashtagMatch = linkedinRaw.match(/hashtags:\n((?:\s+-\s+.+\n?)*)/);
  if (hashtagMatch) {
    hashtags = hashtagMatch[1].match(/- (\S+)/g)?.map(h => h.replace('- ', '')) || [];
  }
}

// ── Governance guardrails (block unsafe posts) ───────────────
if (!linkedinMeta.sourcePost) {
  console.error('LinkedIn post is missing sourcePost in frontmatter.');
  process.exit(1);
}

const sourcePostPath = join(ROOT, linkedinMeta.sourcePost);
const sourceFileName = basename(sourcePostPath);
const fallbackPublishedSourcePath = join(ROOT, 'content', 'published', sourceFileName);

let effectiveSourcePostPath = sourcePostPath;
const normalizedSourcePostPath = sourcePostPath.replace(/\\/g, '/');

if (!existsSync(sourcePostPath)) {
  if (existsSync(fallbackPublishedSourcePath)) {
    effectiveSourcePostPath = fallbackPublishedSourcePath;
  } else {
    console.error(`LinkedIn sourcePost does not exist: ${linkedinMeta.sourcePost}`);
    process.exit(1);
  }
}

if (!normalizedSourcePostPath.includes('/content/published/')) {
  if (!existsSync(fallbackPublishedSourcePath)) {
    console.error(`LinkedIn sourcePost must point to content/published/, got: ${linkedinMeta.sourcePost}`);
    process.exit(1);
  }
  effectiveSourcePostPath = fallbackPublishedSourcePath;
}

const sourceRaw = readFileSync(effectiveSourcePostPath, 'utf-8');
const { meta: sourceMeta } = parseFrontmatter(sourceRaw);
if ((sourceMeta.status || '').toLowerCase() !== 'published') {
  console.error(`LinkedIn source post is not published (status=${sourceMeta.status || 'missing'}): ${effectiveSourcePostPath}`);
  process.exit(1);
}

if (!canonicalUrl) {
  console.error('Missing canonicalUrl. Refusing to post to LinkedIn.');
  process.exit(1);
}

const sourceSlug = basename(effectiveSourcePostPath, '.md');
const expectedCanonicalUrl = `${SITE_BASE_URL}/posts/${sourceSlug}`;
const normalized = (url) => url.replace(/\/$/, '');

if (normalized(canonicalUrl) !== normalized(expectedCanonicalUrl)) {
  console.error(`Canonical URL mismatch. expected=${expectedCanonicalUrl} actual=${canonicalUrl}`);
  process.exit(1);
}

if (distCanonicalUrl && normalized(distCanonicalUrl) !== normalized(expectedCanonicalUrl)) {
  console.error(`Artifact canonical URL mismatch. expected=${expectedCanonicalUrl} dist=${distCanonicalUrl}`);
  process.exit(1);
}

if (/https?:\/\//i.test(linkedinBody)) {
  console.error('LinkedIn body must not contain a hardcoded URL. URL must come from canonicalUrl only.');
  process.exit(1);
}

// Build the commentary text (the LinkedIn post body + hashtags)
const hashtagText = hashtags.slice(0, 3).map(h => `#${h}`).join(' ');
const commentary = `${linkedinBody}${hashtagText ? '\n\n' + hashtagText : ''}`;

// ── Validate ──────────────────────────────────────────────────
const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
const personUrn = process.env.LINKEDIN_PERSON_URN;

if (!dryRun && (!accessToken || !personUrn)) {
  console.error('Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN environment variables.');
  process.exit(1);
}

// ── Display ───────────────────────────────────────────────────
console.log('LinkedIn Post');
console.log('=============');
console.log(`Slug: ${slug}`);
console.log(`Source: ${linkedinPostPath}`);
console.log(`Canonical URL: ${canonicalUrl}`);
console.log(`Hashtags: ${hashtags.slice(0, 3).join(', ')}`);
console.log(`Variant: ${variant}`);
console.log(`Commentary length: ${commentary.length} chars`);
console.log('');
console.log('--- Commentary ---');
console.log(commentary);
console.log('--- End ---');
console.log('');

if (dryRun) {
  console.log('[DRY RUN] No post made. Exiting.');
  process.exit(0);
}

// ── Post to LinkedIn API ──────────────────────────────────────
// Using the UGC Post API for ARTICLE shares
// https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin

const postBody = {
  author: personUrn,
  lifecycleState: 'PUBLISHED',
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: commentary
      },
      shareMediaCategory: 'ARTICLE',
      media: [
        {
          status: 'READY',
          originalUrl: canonicalUrl
        }
      ]
    }
  },
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
  }
};

console.log('Posting to LinkedIn...');

try {
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify(postBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    console.error(errorText);
    process.exit(1);
  }

  const postId = response.headers.get('x-restli-id') || response.headers.get('X-RestLi-Id') || 'unknown';

  console.log(`Posted successfully. LinkedIn Post ID: ${postId}`);

  // Update the frontmatter with the actual post ID
  const updatedContent = linkedinRaw.replace(
    /linkedinPostId:\s*"[^"]*"/,
    `linkedinPostId: "${postId}"`
  );
  writeFileSync(linkedinPostPath, updatedContent, 'utf-8');
  console.log(`Updated linkedinPostId in ${linkedinPostPath}`);

} catch (err) {
  console.error('Failed to post to LinkedIn:', err.message);
  process.exit(1);
}
