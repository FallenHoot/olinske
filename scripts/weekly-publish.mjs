#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const PUBLISHED_DIR = path.join(ROOT, 'content', 'published');
const QUEUE_PATH = path.join(ROOT, 'data', 'publish-queue.json');

const dryRun = process.argv.includes('--dry-run');
const slugIndex = process.argv.findIndex(arg => arg === '--slug');
const slugArg = slugIndex > -1 ? process.argv[slugIndex + 1] || '' : '';
const minInternalLinks = Number.parseInt(process.env.MIN_INTERNAL_POST_LINKS || '2', 10);

function todayInOsloISO() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function weekdayInOsloShort() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Oslo',
    weekday: 'short'
  }).format(new Date());
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function findFileBySlug(dirPath, slug) {
  if (!fs.existsSync(dirPath)) return '';
  const file = fs.readdirSync(dirPath).find(name => name.startsWith(slug));
  return file ? path.join(dirPath, file) : '';
}

function readPublishDate(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const value = parsed.data?.publishDate;
  if (!value) return '';

  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }

  const stringValue = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    return stringValue.slice(0, 10);
  }

  const parsedDate = new Date(stringValue);
  if (Number.isNaN(parsedDate.valueOf())) return '';
  return parsedDate.toISOString().slice(0, 10);
}

function isDue(dueDate, today) {
  if (!dueDate) return true;
  return dueDate <= today;
}

function selectNext(queue, today, isCadenceDay) {
  if (slugArg) {
    const fromQueue = queue.find(item => item.slug === slugArg) || { slug: slugArg, approved: true };
    return { item: fromQueue, postPath: findFileBySlug(POSTS_DIR, slugArg) };
  }

  for (const item of queue) {
    if (!item?.slug) continue;

    const postPath = findFileBySlug(POSTS_DIR, item.slug);
    if (!postPath) continue;

    const postDate = readPublishDate(postPath);
    const dueDate = item.scheduledDate || postDate;
    if (!item.approved && !dueDate) continue;
    if (!isDue(dueDate, today)) continue;

    // Default cadence is Wed/Sat. Off-cadence publishes require exact date match.
    if (!isCadenceDay) {
      if (!dueDate || dueDate !== today) continue;
    }

    return { item, postPath };
  }

  return null;
}

function main() {
  const today = todayInOsloISO();
  const weekday = weekdayInOsloShort();
  const isCadenceDay = weekday === 'Wed' || weekday === 'Sat';
  const queueData = readJson(QUEUE_PATH, { queue: [] });
  const queue = Array.isArray(queueData.queue) ? queueData.queue : [];

  const selected = selectNext(queue, today, isCadenceDay);
  if (!selected || !selected.item || !selected.postPath) {
    console.log('No approved due post found in content/posts.');
    process.exit(0);
  }

  const slug = selected.item.slug;
  const fileName = path.basename(selected.postPath);
  const targetPath = path.join(PUBLISHED_DIR, fileName);

  const raw = fs.readFileSync(selected.postPath, 'utf8');

  // Gate: require a minimum number of internal /posts links before publishing.
  const internalPostLinks = raw.match(/\]\(\/posts\/[A-Za-z0-9\-_/]+\)/g) || [];
  if (internalPostLinks.length < minInternalLinks) {
    console.error(
      `Publish blocked for ${slug}: found ${internalPostLinks.length} internal /posts links, minimum required is ${minInternalLinks}.`
    );
    console.error('Add more related-post links to improve on-site discoverability before publishing.');
    process.exit(1);
  }

  const parsed = matter(raw);
  parsed.data.status = 'published';
  parsed.data.publishDate = today;
  const updated = matter.stringify(parsed.content, parsed.data);

  console.log(`Selected slug: ${slug}`);
  console.log(`Oslo weekday: ${weekday} (cadence day: ${isCadenceDay ? 'yes' : 'no'})`);
  console.log(`Source: ${path.relative(ROOT, selected.postPath).replace(/\\/g, '/')}`);
  console.log(`Target: ${path.relative(ROOT, targetPath).replace(/\\/g, '/')}`);
  console.log(`Publish date: ${today}`);

  if (dryRun) {
    console.log('[dry-run] No files modified.');
    process.exit(0);
  }

  fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
  fs.writeFileSync(targetPath, updated, 'utf8');
  fs.rmSync(selected.postPath);

  queueData.queue = queue.filter(item => item.slug !== slug);
  fs.writeFileSync(QUEUE_PATH, `${JSON.stringify(queueData, null, 2)}\n`, 'utf8');

  console.log(`Published ${slug} and updated queue.`);
}

main();
