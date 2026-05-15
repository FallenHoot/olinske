#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function argValue(flag) {
  const inline = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = process.argv.findIndex((arg) => arg === flag);
  return index > -1 && process.argv[index + 1] ? process.argv[index + 1] : '';
}

const postArg = argValue('--post');
const dryRun = process.argv.includes('--dry-run');

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

function stripReferencesSection(content) {
  const lines = content.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => /^##\s+References\s*$/i.test(line.trim()));
  if (startIndex === -1) {
    return { changed: false, content };
  }

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i].trim())) {
      endIndex = i;
      break;
    }
  }

  const next = [...lines.slice(0, startIndex), ...lines.slice(endIndex)].join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';

  return { changed: true, content: next };
}

function resolveTargets() {
  if (postArg) {
    const target = path.resolve(ROOT, postArg);
    if (!fs.existsSync(target)) {
      console.error(`Post file not found: ${postArg}`);
      process.exit(1);
    }
    return [target];
  }

  return walkMarkdownFiles(path.join(ROOT, 'content', 'published'));
}

function main() {
  const targets = resolveTargets();
  let changedCount = 0;

  for (const filePath of targets) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { changed, content } = stripReferencesSection(raw);
    if (!changed) continue;

    changedCount += 1;
    const relative = path.relative(ROOT, filePath).replace(/\\/g, '/');
    if (dryRun) {
      console.log(`[dry-run] would sanitize: ${relative}`);
      continue;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`sanitized: ${relative}`);
  }

  if (changedCount === 0) {
    console.log('No published files contained a References section.');
  } else if (dryRun) {
    console.log(`Would sanitize ${changedCount} file(s).`);
  } else {
    console.log(`Sanitized ${changedCount} file(s).`);
  }
}

main();
