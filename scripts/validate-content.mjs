#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();

function argValue(flag, defaultValue = '') {
  const inline = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = process.argv.findIndex((arg) => arg === flag);
  return index > -1 && process.argv[index + 1] ? process.argv[index + 1] : defaultValue;
}

const gate = argValue('--gate', 'draft');
const errors = [];
const warnings = [];
const SITE_BASE_URL = (process.env.BLOG_BASE_URL || 'https://zach.olinske.com').replace(/\/$/, '');
const STRICT_VOICE_GATE = process.env.STRICT_VOICE_GATE === '1';
const STRICT_QUESTION_GATE = process.env.STRICT_QUESTION_GATE === '1';
const STRICT_CATEGORY_GATE = process.env.STRICT_CATEGORY_GATE === '1';
const PRIMARY_CATEGORIES = new Set([
  'cloud-architecture',
  'legacy-systems',
  'geospatial',
  'engineering-culture',
  'family-legacy',
  'ai-strategy'
]);
const REPETITIVE_OPENERS = [
  'this is',
  'that is',
  'the real',
  'the key',
  'for many',
  'in practice',
  'the problem'
];
const AI_FILLER_PHRASES = [
  'leveraging cross-functional synergies',
  "in today's fast-paced",
  'paradigm shift',
  'robust and scalable'
];

function walkMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

function readMatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return { raw, parsed: matter(raw) };
}

function addError(filePath, message) {
  errors.push(`${path.relative(ROOT, filePath)}: ${message}`);
}

function addWarning(filePath, message) {
  warnings.push(`${path.relative(ROOT, filePath)}: ${message}`);
}

function validateArticle(filePath) {
  const { parsed } = readMatter(filePath);
  const data = parsed.data || {};
  const body = parsed.content || '';
  const isQueuedPost = filePath.includes(`${path.sep}content${path.sep}posts${path.sep}`);

  if (!data.title) addError(filePath, 'missing required frontmatter field "title"');
  if (!data.publishDate) addError(filePath, 'missing required frontmatter field "publishDate"');
  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    addError(filePath, 'missing required frontmatter array "tags"');
  }

  if (gate !== 'draft' && !data.description) {
    addError(filePath, 'missing required frontmatter field "description"');
  }

  if (filePath.includes(`${path.sep}content${path.sep}published${path.sep}`) && data.status !== 'published') {
    addWarning(filePath, 'published content is expected to use status: published');
  }

  const isPublished = data.status === 'published' || filePath.includes(`${path.sep}content${path.sep}published${path.sep}`);
  if (gate === 'publish' && isPublished && hasReferencesSection(body)) {
    addError(filePath, 'published posts must not include a "## References" section');
  }

  validatePrimaryCategory(filePath, data.tags || [], isQueuedPost);
  validateBlufQuality(filePath, data, isQueuedPost, isPublished);
  validateQuestionFocus(filePath, data, body, isQueuedPost, isPublished);

  validateVoiceQuality(filePath, body, isPublished);
}

function validatePrimaryCategory(filePath, tags, isQueuedPost) {
  if (!Array.isArray(tags) || tags.length === 0) return;

  const primaryTagsInList = tags.filter((tag) => PRIMARY_CATEGORIES.has(tag));
  const firstTag = tags[0];
  const firstTagIsPrimary = PRIMARY_CATEGORIES.has(firstTag);

  if (!firstTagIsPrimary) {
    const message = `first tag must be a primary category (${[...PRIMARY_CATEGORIES].join(', ')})`;
    if (gate === 'publish' && isQueuedPost && STRICT_CATEGORY_GATE) addError(filePath, message);
    else addWarning(filePath, message);
  }

  if (primaryTagsInList.length > 1) {
    const message = `contains multiple primary categories (${primaryTagsInList.join(', ')}); keep exactly one`;
    if (gate === 'publish' && isQueuedPost && STRICT_CATEGORY_GATE) addError(filePath, message);
    else addWarning(filePath, message);
  }
}

function validateBlufQuality(filePath, data, isQueuedPost, isPublished) {
  if (!Array.isArray(data.bluf)) return;

  if (data.bluf.length < 2 || data.bluf.length > 5) {
    const message = 'frontmatter "bluf" should contain 2 to 5 bullets';
    if (gate === 'publish' && isQueuedPost) addError(filePath, message);
    else addWarning(filePath, message);
  }

  for (const item of data.bluf) {
    if (typeof item !== 'string' || item.trim().length < 12) {
      const message = 'frontmatter "bluf" items must be descriptive sentences';
      if (gate === 'publish' && isQueuedPost) addError(filePath, message);
      else addWarning(filePath, message);
      break;
    }
  }

  if (gate === 'publish' && isPublished && isQueuedPost && !data.bluf) {
    addWarning(filePath, 'consider adding frontmatter "bluf" bullets for search/AI readability');
  }
}

function validateQuestionFocus(filePath, data, body, isQueuedPost, isPublished) {
  const coreQuestion = typeof data.coreQuestion === 'string' ? data.coreQuestion.trim() : '';
  const questionMarksInHeadings = (body.match(/^##\s+.*\?/gim) || []).length;
  const headingCount = (body.match(/^##\s+/gim) || []).length;

  if (!coreQuestion) {
    const message = 'missing frontmatter "coreQuestion"; define one driving question for this post';
    if (gate === 'publish' && isQueuedPost && STRICT_QUESTION_GATE) addError(filePath, message);
    else if (gate !== 'draft' || isPublished) addWarning(filePath, message);
  } else {
    if (!coreQuestion.endsWith('?')) {
      const message = 'frontmatter "coreQuestion" should end with a question mark';
      if (gate === 'publish' && isQueuedPost && STRICT_QUESTION_GATE) addError(filePath, message);
      else addWarning(filePath, message);
    }
    if (coreQuestion.length < 20) {
      const message = 'frontmatter "coreQuestion" is too short; make it specific';
      if (gate === 'publish' && isQueuedPost && STRICT_QUESTION_GATE) addError(filePath, message);
      else addWarning(filePath, message);
    }
  }

  if (questionMarksInHeadings > 1) {
    const message = `contains ${questionMarksInHeadings} question-form H2 headings; keep one primary question and convert others to statements`;
    if (gate === 'publish' && isQueuedPost && STRICT_QUESTION_GATE) addError(filePath, message);
    else addWarning(filePath, message);
  }

  if (headingCount >= 10 && !coreQuestion) {
    addWarning(filePath, 'high section count without coreQuestion can indicate a broad multi-topic post');
  }
}

function extractNarrativeParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .filter((block) => !block.startsWith('#'))
    .filter((block) => !block.startsWith('|'))
    .filter((block) => !block.startsWith('```'))
    .filter((block) => !block.startsWith('>'))
    .filter((block) => !/^\d+\.\s+/.test(block))
    .filter((block) => !block.startsWith('- '));
}

function normalizeForDuplicateCheck(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function validateVoiceQuality(filePath, body, isPublished) {
  const paragraphs = extractNarrativeParagraphs(body);
  if (paragraphs.length === 0) return;

  const duplicateMap = new Map();
  for (const paragraph of paragraphs) {
    if (paragraph.length < 80) continue;
    const normalized = normalizeForDuplicateCheck(paragraph);
    duplicateMap.set(normalized, (duplicateMap.get(normalized) || 0) + 1);
  }

  const duplicateParagraphs = [...duplicateMap.values()].filter((count) => count > 1).length;
  if (duplicateParagraphs > 0) {
    const message = `contains ${duplicateParagraphs} near-duplicate narrative paragraph(s); tighten repetition`;
    if (gate === 'publish' && isPublished && STRICT_VOICE_GATE) addError(filePath, message);
    else addWarning(filePath, message);
  }

  const openerCounts = new Map();
  for (const paragraph of paragraphs) {
    const sentenceStart = paragraph
      .replace(/[\r\n]+/g, ' ')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    for (const opener of REPETITIVE_OPENERS) {
      if (sentenceStart.startsWith(opener)) {
        openerCounts.set(opener, (openerCounts.get(opener) || 0) + 1);
      }
    }
  }

  for (const [opener, count] of openerCounts.entries()) {
    if (count >= 3) {
      const message = `repetitive paragraph opener "${opener}" appears ${count} times`;
      if (gate === 'publish' && isPublished && STRICT_VOICE_GATE && count >= 4) addError(filePath, message);
      else addWarning(filePath, message);
    }
  }

  const lowerBody = body.toLowerCase();
  for (const phrase of AI_FILLER_PHRASES) {
    if (lowerBody.includes(phrase)) {
      const message = `contains AI-filler phrase "${phrase}"; rewrite with concrete language`;
      if (gate === 'publish' && isPublished && STRICT_VOICE_GATE) addError(filePath, message);
      else addWarning(filePath, message);
    }
  }
}

function hasReferencesSection(text) {
  return /(^|\n)##\s+References\s*(\n|$)/i.test(text);
}

function extractNumericClaims(text) {
  const matches = text.match(/\b\d+(?:\.\d+)?%?|\$~?\d[\d,]*(?:\.\d+)?(?:\/month)?|\b\d+(?:x)?\b/g);
  return [...new Set(matches || [])];
}

function validateLinkedIn(filePath) {
  const { parsed } = readMatter(filePath);
  const data = parsed.data || {};
  const body = parsed.content.trim();

  const isStandalone = data.type === 'standalone';
  const requiredFields = isStandalone
    ? ['title', 'publishDate', 'type', 'linkedinPostId', 'variant']
    : ['title', 'publishDate', 'type', 'linkedinPostId', 'variant', 'sourcePost', 'canonicalUrl'];
  for (const field of requiredFields) {
    if (!data[field]) addError(filePath, `missing required frontmatter field "${field}"`);
  }

  if (data.type && data.type !== 'blog-linkedin-share' && data.type !== 'standalone') {
    addError(filePath, 'type must be "blog-linkedin-share" or "standalone"');
  }

  if (Array.isArray(data.hashtags) && data.hashtags.length > 3) {
    addError(filePath, 'hashtags must contain at most 3 items');
  }

  if (data.canonicalUrl && body.includes(data.canonicalUrl)) {
    addError(filePath, 'body must not include the canonical URL directly');
  }

  if (/https?:\/\//i.test(body)) {
    addError(filePath, 'body must not include hardcoded URLs');
  }

  if (isStandalone) {
    if (data.sourcePost) addWarning(filePath, 'standalone LinkedIn entries should not include sourcePost');
    if (data.canonicalUrl) addWarning(filePath, 'standalone LinkedIn entries should not include canonicalUrl');
    return;
  }

  if (!data.sourcePost) return;

  let sourcePath = path.resolve(ROOT, data.sourcePost);
  if (!fs.existsSync(sourcePath)) {
    const publishedFallback = data.sourcePost.replace(/content\/posts\//, 'content/published/');
    const fallbackPath = path.resolve(ROOT, publishedFallback);
    if (publishedFallback !== data.sourcePost && fs.existsSync(fallbackPath)) {
      sourcePath = fallbackPath;
      addWarning(filePath, `sourcePost points to content/posts; using fallback ${publishedFallback}`);
    } else {
      addError(filePath, `sourcePost does not exist: ${data.sourcePost}`);
      return;
    }
  }

  if (!fs.existsSync(sourcePath)) {
    addError(filePath, `sourcePost does not exist: ${data.sourcePost}`);
    return;
  }

  const source = readMatter(sourcePath);
  const sourceBody = source.parsed.content;
  const sourceTitle = source.parsed.data?.title;
  const sourceSlug = path.basename(sourcePath, '.md');
  const expectedCanonicalUrl = `${SITE_BASE_URL}/posts/${sourceSlug}`;

  if (data.canonicalUrl && data.canonicalUrl.replace(/\/$/, '') !== expectedCanonicalUrl) {
    addError(filePath, `canonicalUrl must match source post slug (${expectedCanonicalUrl})`);
  }

  if (sourceTitle && data.title && sourceTitle !== data.title) {
    addWarning(filePath, 'title differs from source article title');
  }

  const bodyClaims = extractNumericClaims(body);
  for (const claim of bodyClaims) {
    if (!source.raw.includes(claim)) {
      addError(filePath, `numeric claim "${claim}" does not appear in source article`);
    }
  }

  if (!sourceBody.includes('PTU') && body.includes('PTU')) {
    addWarning(filePath, 'LinkedIn body references PTU but source body does not');
  }
}

const articleFiles = [
  ...walkMarkdownFiles(path.join(ROOT, 'content', 'posts'))
];

const linkedinFiles = [
  ...walkMarkdownFiles(path.join(ROOT, 'content', 'linkedin', 'posts'))
];

if (gate === 'publish') {
  articleFiles.push(...walkMarkdownFiles(path.join(ROOT, 'content', 'published')));
}

for (const filePath of articleFiles) validateArticle(filePath);
for (const filePath of linkedinFiles) validateLinkedIn(filePath);

if (warnings.length > 0) {
  console.warn(`validate-content (${gate}) warnings:`);
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length > 0) {
  console.error(`validate-content (${gate}) failed:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`validate-content (${gate}) passed for ${articleFiles.length} article files and ${linkedinFiles.length} LinkedIn files.`);
