#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, 'content');
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function readMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...readMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed.toISOString().slice(0, 10);
}

function toDate(value) {
  const normalized = normalizeDate(value);
  if (!normalized) return null;
  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function collectPosts() {
  const folders = ['drafts', 'posts', 'published'];
  const items = [];

  for (const folder of folders) {
    const folderPath = path.join(CONTENT_ROOT, folder);
    const files = readMarkdownFiles(folderPath);

    for (const filePath of files) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(raw);
      const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
      const fileName = path.basename(filePath);
      const slugMatch = fileName.match(/^(\d{6})-/);
      const slug = slugMatch ? slugMatch[1] : '';
      const dateStr = normalizeDate(parsed.data.publishDate);

      items.push({
        slug,
        title: parsed.data.title || '(untitled)',
        status: parsed.data.status || '(missing)',
        folder,
        path: relPath,
        publishDate: dateStr,
        publishDateObj: toDate(parsed.data.publishDate)
      });
    }
  }

  return items;
}

function loadQueue() {
  const queuePath = path.join(ROOT, 'data', 'publish-queue.json');
  if (!fs.existsSync(queuePath)) return { schedule: null, queue: [] };

  try {
    const parsed = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    return {
      schedule: parsed.schedule || null,
      queue: Array.isArray(parsed.queue) ? parsed.queue : []
    };
  } catch {
    return { schedule: null, queue: [] };
  }
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

function printTable(rows, columns) {
  const widths = columns.map((col) => {
    const maxRow = rows.reduce((max, row) => Math.max(max, String(row[col.key] ?? '').length), col.label.length);
    return maxRow;
  });

  const header = columns
    .map((col, index) => col.label.padEnd(widths[index]))
    .join(' | ');

  const divider = columns
    .map((_, index) => '-'.repeat(widths[index]))
    .join('-|-');

  console.log(header);
  console.log(divider);

  for (const row of rows) {
    const line = columns
      .map((col, index) => String(row[col.key] ?? '').padEnd(widths[index]))
      .join(' | ');
    console.log(line);
  }
}

function main() {
  const posts = collectPosts();
  const queueInfo = loadQueue();

  const upcomingDrafts = posts
    .filter((p) => p.folder === 'drafts' && p.publishDateObj && p.publishDateObj >= TODAY && p.status !== 'published')
    .sort((a, b) => a.publishDateObj - b.publishDateObj)
    .map((p) => ({
      date: p.publishDate,
      status: p.status,
      slug: p.slug || '-',
      title: p.title,
      path: p.path
    }));

  const readyToPublish = posts
    .filter((p) => p.folder === 'posts' && p.status !== 'published')
    .sort((a, b) => a.publishDateObj - b.publishDateObj)
    .map((p) => ({
      date: p.publishDate,
      status: p.status,
      slug: p.slug || '-',
      title: p.title,
      path: p.path
    }));

  const publishedInPosts = posts
    .filter((p) => p.folder === 'posts' && p.status === 'published')
    .sort((a, b) => (a.publishDate || '').localeCompare(b.publishDate || ''))
    .map((p) => ({
      date: p.publishDate || '-',
      slug: p.slug || '-',
      title: p.title,
      path: p.path
    }));

  const canonicalPublished = posts
    .filter((p) => p.folder === 'published')
    .sort((a, b) => (a.publishDate || '').localeCompare(b.publishDate || ''));

  const undated = posts
    .filter((p) => !p.publishDate && p.folder === 'drafts')
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((p) => ({
      status: p.status,
      slug: p.slug || '-',
      title: p.title,
      path: p.path
    }));

  const queueRows = queueInfo.queue.map((item, index) => ({
    order: index + 1,
    slug: item.slug || '-',
    approved: item.approved ? 'yes' : 'no',
    linkedinVariant: item.linkedinVariant || '-',
    notes: item.notes || ''
  }));

  console.log('Publishing Schedule View');
  console.log('=======================');
  console.log(`Today: ${TODAY.toISOString().slice(0, 10)}`);
  console.log('Model: backlog=ideas, drafts=drafts, posts=ready, published=published');

  printSection('Upcoming Draft Schedule');
  if (upcomingDrafts.length === 0) {
    console.log('No upcoming draft dates found.');
  } else {
    printTable(upcomingDrafts, [
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status' },
      { key: 'slug', label: 'Slug' },
      { key: 'title', label: 'Title' }
    ]);
  }

  printSection('Ready To Publish (content/posts)');
  if (readyToPublish.length === 0) {
    console.log('No staged posts ready to publish.');
  } else {
    printTable(readyToPublish, [
      { key: 'date', label: 'Date' },
      { key: 'status', label: 'Status' },
      { key: 'slug', label: 'Slug' },
      { key: 'title', label: 'Title' }
    ]);
  }

  printSection('Published Posts (content/published)');
  console.log(`Count: ${canonicalPublished.length}`);

  if (publishedInPosts.length > 0) {
    printSection('Needs Cleanup: Published Files In content/posts');
    printTable(publishedInPosts, [
      { key: 'date', label: 'Date' },
      { key: 'slug', label: 'Slug' },
      { key: 'title', label: 'Title' }
    ]);
  }

  printSection('Publish Queue');
  if (queueInfo.schedule) {
    console.log(`Cadence: ${queueInfo.schedule}`);
  }

  if (queueRows.length === 0) {
    console.log('No queue items found.');
  } else {
    printTable(queueRows, [
      { key: 'order', label: '#' },
      { key: 'slug', label: 'Slug' },
      { key: 'approved', label: 'Approved' },
      { key: 'linkedinVariant', label: 'LinkedIn Variant' },
      { key: 'notes', label: 'Notes' }
    ]);
  }

  printSection('Undated Drafts');
  if (undated.length === 0) {
    console.log('No undated drafts.');
  } else {
    printTable(undated, [
      { key: 'status', label: 'Status' },
      { key: 'slug', label: 'Slug' },
      { key: 'title', label: 'Title' }
    ]);
  }
}

main();
