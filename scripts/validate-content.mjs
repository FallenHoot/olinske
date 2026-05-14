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

  validateVoiceQuality(filePath, body, isPublished);
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

  const requiredFields = ['title', 'publishDate', 'type', 'linkedinPostId', 'variant', 'sourcePost', 'canonicalUrl'];
  for (const field of requiredFields) {
    if (!data[field]) addError(filePath, `missing required frontmatter field "${field}"`);
  }

  if (data.type && data.type !== 'blog-linkedin-share') {
    addError(filePath, 'type must be "blog-linkedin-share"');
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

  if (!data.sourcePost) return;

  const sourcePath = path.resolve(ROOT, data.sourcePost);
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
