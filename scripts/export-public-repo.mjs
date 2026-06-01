#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function argValue(flag, defaultValue = '') {
  const index = process.argv.findIndex(arg => arg === flag);
  return index > -1 && process.argv[index + 1] ? process.argv[index + 1] : defaultValue;
}

const ROOT = process.cwd();
const OUTPUT = path.resolve(argValue('--output', 'public-repo'));
const META_PATH = path.join(OUTPUT, 'EXPORT-METADATA.json');

function exists(p) {
  return fs.existsSync(p);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeManagedPath(base, relPath) {
  const abs = path.join(base, relPath);
  if (exists(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
  }
}

function copyFileOrDir(src, dest) {
  if (!exists(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyFileOrDir(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyPublishedContent(srcRoot, destRoot) {
  const srcPublished = path.join(srcRoot, 'content', 'published');
  const destPublished = path.join(destRoot, 'content', 'published');
  ensureDir(destPublished);
  copyFileOrDir(srcPublished, destPublished);
}

function listPublishedFiles(dirPath, prefix = '') {
  if (!exists(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listPublishedFiles(full, rel));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(`content/published/${rel}`);
    }
  }

  return files;
}

function main() {
  const managedPaths = [
    'astro.config.mjs',
    'package.json',
    'tsconfig.json',
    'three.d.ts',
    'README.md',
    'public',
    'src',
    'docs',
    'content',
    'EXPORT-METADATA.json'
  ];

  ensureDir(OUTPUT);

  for (const relPath of managedPaths) {
    removeManagedPath(OUTPUT, relPath);
  }

  const baseCopyPaths = [
    'astro.config.mjs',
    'package.json',
    'tsconfig.json',
    'three.d.ts',
    'README.md',
    'public',
    'src',
    'docs'
  ];

  for (const relPath of baseCopyPaths) {
    copyFileOrDir(path.join(ROOT, relPath), path.join(OUTPUT, relPath));
  }

  copyPublishedContent(ROOT, OUTPUT);

  const publishedFiles = listPublishedFiles(path.join(OUTPUT, 'content', 'published'));
  const metadata = {
    generatedAt: new Date().toISOString(),
    output: path.relative(ROOT, OUTPUT).replace(/\\/g, '/'),
    publishedCount: publishedFiles.length,
    publishedFiles
  };

  ensureDir(path.dirname(META_PATH));
  fs.writeFileSync(META_PATH, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

  console.log(`Exported public repo content to ${OUTPUT}`);
  console.log(`Published posts exported: ${publishedFiles.length}`);
}

main();
