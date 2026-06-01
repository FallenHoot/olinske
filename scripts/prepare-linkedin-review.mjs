#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

function argValue(flag, defaultValue = '') {
  const index = process.argv.findIndex((arg) => arg === flag);
  return index > -1 ? process.argv[index + 1] : defaultValue;
}

const postArg = argValue('--post');
const variantArg = argValue('--variant', 'medium');

if (!postArg) {
  console.error('Usage: node scripts/prepare-linkedin-review.mjs --post <path-to-post.md> [--variant short|medium|long]');
  process.exit(1);
}

const validVariants = new Set(['short', 'medium', 'long']);
if (!validVariants.has(variantArg)) {
  console.error(`Invalid variant "${variantArg}". Must be one of: short, medium, long`);
  process.exit(1);
}

const postPath = path.resolve(postArg);
if (!fs.existsSync(postPath)) {
  console.error(`Post file not found: ${postArg}`);
  process.exit(1);
}

const articleRaw = fs.readFileSync(postPath, 'utf8');
const article = matter(articleRaw);
const articleFileName = path.basename(postPath);
const articleSlug = path.basename(postPath, path.extname(postPath));
const articleTitle = article.data.title || articleSlug;
const articleTags = Array.isArray(article.data.tags) ? article.data.tags : [];
const articlePublishDate = article.data.publishDate || new Date().toISOString().slice(0, 10);

function resolveArtifactDir(fileSlug, articleData) {
  const direct = path.resolve('.artifacts', 'blog', fileSlug);
  if (fs.existsSync(path.join(direct, 'linkedin-distribution.json'))) return direct;

  const artifactRoot = path.resolve('.artifacts', 'blog');
  if (!fs.existsSync(artifactRoot)) return direct;

  for (const entry of fs.readdirSync(artifactRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const distPath = path.join(artifactRoot, entry.name, 'linkedin-distribution.json');
    if (!fs.existsSync(distPath)) continue;
    try {
      const dist = JSON.parse(fs.readFileSync(distPath, 'utf8'));
      if (articleData.slug && dist.canonicalUrl && dist.canonicalUrl.includes(articleData.slug)) {
        return path.join(artifactRoot, entry.name);
      }
    } catch {
      // skip invalid artifact
    }
  }

  return direct;
}

const artifactDir = resolveArtifactDir(articleSlug, article.data);
const distributionPath = path.join(artifactDir, 'linkedin-distribution.json');
if (!fs.existsSync(distributionPath)) {
  console.error(`LinkedIn distribution artifact not found: ${path.relative(process.cwd(), distributionPath)}`);
  console.error('Run the seo-distribution-editor step first.');
  process.exit(1);
}

const distribution = JSON.parse(fs.readFileSync(distributionPath, 'utf8'));
const variant = distribution.variants?.[variantArg];
if (!variant?.text) {
  console.error(`Variant "${variantArg}" not found in ${path.relative(process.cwd(), distributionPath)}`);
  process.exit(1);
}

const linkedinDir = path.resolve('content', 'linkedin', 'posts');
const linkedinPath = path.join(linkedinDir, articleFileName);
const canonicalUrl = distribution.canonicalUrl || '';
const hashtags = Array.isArray(distribution.hashtags) ? distribution.hashtags : [];
const variantText = canonicalUrl
  ? variant.text.replace(new RegExp(`\n*${canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\n*`, 'g'), '\n').trim()
  : variant.text.trim();

const linkedinDoc = [
  '---',
  `title: ${JSON.stringify(articleTitle)}`,
  `publishDate: ${articlePublishDate}`,
  'tags:',
  ...(articleTags.length > 0 ? articleTags.map((tag) => `  - ${tag}`) : ['  - linkedin']),
  'type: blog-linkedin-share',
  'linkedinPostId: "pending-review"',
  `variant: ${variantArg}`,
  `sourcePost: ${JSON.stringify(postArg.replace(/\\/g, '/'))}`,
  `canonicalUrl: ${JSON.stringify(canonicalUrl)}`,
  'hashtags:',
  ...(hashtags.length > 0 ? hashtags.map((tag) => `  - ${tag}`) : []),
  '---',
  '',
  variantText,
  ''
].join('\n');

fs.mkdirSync(linkedinDir, { recursive: true });
fs.writeFileSync(linkedinPath, linkedinDoc, 'utf8');

console.log(`LinkedIn review draft written: ${path.relative(process.cwd(), linkedinPath)}`);
console.log(`Source article: ${path.relative(process.cwd(), postPath)}`);
console.log(`Variant: ${variantArg}`);
