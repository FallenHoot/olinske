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
 *   node scripts/post-to-linkedin.mjs --post content/posts/000006-*.md --variant medium
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
 *   4. Posts a first comment with the canonical link
 *   5. Updates linkedinPostId in the LinkedIn post frontmatter
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE_BASE_URL = (process.env.BLOG_BASE_URL || 'https://zach.olinske.com').replace(/\/$/, '');
const SCORECARD_PATH = join(ROOT, 'data', 'linkedin-weekly-scorecard.csv');

// ── Args ──────────────────────────────────────────────────────
function argValue(flag, defaultValue = '') {
  const idx = process.argv.findIndex((a) => a === flag);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : defaultValue;
}

const postArg = argValue('--post', '');
const variant = argValue('--variant', 'medium');
const dryRun = process.argv.includes('--dry-run');

if (!postArg) {
  console.error('Usage: node scripts/post-to-linkedin.mjs --post <post-path> [--variant short|medium|long] [--dry-run]');
  process.exit(1);
}

// ── Resolve paths ─────────────────────────────────────────────
function resolveGlob(pattern) {
  if (existsSync(pattern)) return pattern;
  const dir = dirname(pattern);
  const base = basename(pattern).replace('*', '');
  if (!existsSync(dir)) return null;
  const match = readdirSync(dir).find((f) => f.includes(base) || base.includes(f.split('.')[0]));
  return match ? join(dir, match) : null;
}

const postPath = resolveGlob(postArg);
if (!postPath) {
  console.error(`Post not found: ${postArg}`);
  process.exit(1);
}

const postFilename = basename(postPath, '.md');
const slug = postFilename;

function findLinkedInPost(sourceSlug) {
  for (const dir of ['content/linkedin/published', 'content/linkedin/posts']) {
    const fullDir = join(ROOT, dir);
    if (!existsSync(fullDir)) continue;
    const match = readdirSync(fullDir).find((f) => f.startsWith(sourceSlug));
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

const distPath = join(ROOT, '.artifacts', 'blog', slug, 'linkedin-distribution.json');

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

function parseHashtagsFromFrontmatter(rawContent) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return [];
  const fm = match[1];
  const lines = fm.split(/\r?\n/);
  const tags = [];
  let inHashtags = false;

  for (const line of lines) {
    if (!inHashtags) {
      if (/^hashtags:\s*$/.test(line.trim())) {
        inHashtags = true;
      }
      continue;
    }

    if (!/^\s+/.test(line)) break;
    const item = line.match(/^\s*-\s*(.+)\s*$/);
    if (item) {
      tags.push(item[1].replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
    }
  }

  return tags;
}

function toUgcUrn(postId) {
  if (!postId) return '';
  if (postId.startsWith('urn:li:ugcPost:')) return postId;
  if (/^\d+$/.test(postId)) return `urn:li:ugcPost:${postId}`;
  return '';
}

function buildTrackedUrl(url, sourceSlug, postVariant) {
  const parsed = new URL(url);
  parsed.searchParams.set('utm_source', 'linkedin');
  parsed.searchParams.set('utm_medium', 'social');
  parsed.searchParams.set('utm_campaign', sourceSlug);
  parsed.searchParams.set('utm_content', postVariant || 'medium');
  return parsed.toString();
}

function weekStartIso(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d.toISOString().slice(0, 10);
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function appendScorecardRow(row) {
  const header = 'weekStart,postedAt,slug,variant,canonicalUrl,trackedUrl,linkedinPostId,firstCommentPosted,impressions,comments,profileVisits,blogSessions,notes\n';
  if (!existsSync(SCORECARD_PATH)) {
    writeFileSync(SCORECARD_PATH, header, 'utf-8');
  }

  const line = [
    row.weekStart,
    row.postedAt,
    row.slug,
    row.variant,
    row.canonicalUrl,
    row.trackedUrl,
    row.linkedinPostId,
    row.firstCommentPosted,
    '',
    '',
    '',
    '',
    ''
  ].map(escapeCsv).join(',') + '\n';

  appendFileSync(SCORECARD_PATH, line, 'utf-8');
}

const linkedinRaw = readFileSync(linkedinPostPath, 'utf-8');
const { meta: linkedinMeta, body: linkedinBody } = parseFrontmatter(linkedinRaw);

let canonicalUrl = linkedinMeta.canonicalUrl || '';
let hashtags = [];
let distCanonicalUrl = '';

if (existsSync(distPath)) {
  const dist = JSON.parse(readFileSync(distPath, 'utf-8'));
  distCanonicalUrl = dist.canonicalUrl || '';
  canonicalUrl = canonicalUrl || dist.canonicalUrl || '';
  hashtags = dist.hashtags || [];
} else {
  hashtags = parseHashtagsFromFrontmatter(linkedinRaw);
}

if (!linkedinMeta.sourcePost) {
  console.error('LinkedIn post is missing sourcePost in frontmatter.');
  process.exit(1);
}

const sourcePostPath = join(ROOT, linkedinMeta.sourcePost);
const sourceFileName = basename(sourcePostPath);
const fallbackPublishedSourcePath = join(ROOT, 'content', 'published', sourceFileName);

let effectiveSourcePostPath = sourcePostPath;
if (!existsSync(effectiveSourcePostPath)) {
  if (existsSync(fallbackPublishedSourcePath)) {
    effectiveSourcePostPath = fallbackPublishedSourcePath;
  } else {
    console.error(`LinkedIn sourcePost does not exist: ${linkedinMeta.sourcePost}`);
    process.exit(1);
  }
}

let sourceRaw = readFileSync(effectiveSourcePostPath, 'utf-8');
let { meta: sourceMeta } = parseFrontmatter(sourceRaw);
if ((sourceMeta.status || '').toLowerCase() !== 'published') {
  if (!effectiveSourcePostPath.endsWith(`${join('content', 'published', sourceFileName)}`) && existsSync(fallbackPublishedSourcePath)) {
    effectiveSourcePostPath = fallbackPublishedSourcePath;
    sourceRaw = readFileSync(effectiveSourcePostPath, 'utf-8');
    ({ meta: sourceMeta } = parseFrontmatter(sourceRaw));
  }

  if ((sourceMeta.status || '').toLowerCase() !== 'published') {
    console.error(`LinkedIn source post is not published (status=${sourceMeta.status || 'missing'}): ${effectiveSourcePostPath}`);
    process.exit(1);
  }
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

const hashtagText = hashtags.slice(0, 3).map((h) => `#${h}`).join(' ');
const commentary = `${linkedinBody}${hashtagText ? '\n\n' + hashtagText : ''}`;
const trackedUrl = buildTrackedUrl(canonicalUrl, slug, variant);
let firstCommentText = (linkedinMeta.firstComment && String(linkedinMeta.firstComment).trim())
  || `Full write-up here: ${trackedUrl}`;

// Enforce tracked-link usage when firstComment references canonicalUrl directly.
if (firstCommentText.includes(canonicalUrl)) {
  firstCommentText = firstCommentText.replace(canonicalUrl, trackedUrl);
}

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
const personUrn = process.env.LINKEDIN_PERSON_URN;

if (!dryRun && (!accessToken || !personUrn)) {
  console.error('Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN environment variables.');
  process.exit(1);
}

console.log('LinkedIn Post');
console.log('=============');
console.log(`Slug: ${slug}`);
console.log(`Source: ${linkedinPostPath}`);
console.log(`Canonical URL: ${canonicalUrl}`);
console.log(`Tracked URL: ${trackedUrl}`);
console.log(`Hashtags: ${hashtags.slice(0, 3).join(', ')}`);
console.log(`Variant: ${variant}`);
console.log(`Commentary length: ${commentary.length} chars`);
console.log(`First comment length: ${firstCommentText.length} chars`);
console.log('');
console.log('--- Commentary ---');
console.log(commentary);
console.log('--- End ---');
console.log('');

if (dryRun) {
  console.log('[DRY RUN] No post made. Exiting.');
  process.exit(0);
}

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
      Authorization: `Bearer ${accessToken}`,
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
  const postUrn = toUgcUrn(postId);
  console.log(`Posted successfully. LinkedIn Post ID: ${postId}`);

  let firstCommentPosted = false;
  if (postUrn) {
    console.log('Posting first comment...');
    const commentResponse = await fetch(`https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        actor: personUrn,
        object: postUrn,
        message: {
          text: firstCommentText
        }
      })
    });

    if (!commentResponse.ok) {
      const commentError = await commentResponse.text();
      console.warn(`First comment failed: ${commentResponse.status} ${commentResponse.statusText}`);
      if (commentError) console.warn(commentError);
    } else {
      console.log('First comment posted successfully.');
      firstCommentPosted = true;
    }
  } else {
    console.warn(`Could not derive UGC URN from postId "${postId}". Skipping first comment.`);
  }

  appendScorecardRow({
    weekStart: weekStartIso(),
    postedAt: new Date().toISOString(),
    slug,
    variant,
    canonicalUrl,
    trackedUrl,
    linkedinPostId: postId,
    firstCommentPosted: firstCommentPosted ? 'yes' : 'no'
  });
  console.log(`Scorecard updated: ${SCORECARD_PATH}`);

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
