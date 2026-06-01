#!/usr/bin/env node
/**
 * publish-now.mjs — Full end-to-end publish pipeline
 *
 * Does everything needed to take the next approved post from staged to live:
 *   1. Runs weekly-publish.mjs (move from posts/ to published/, update queue)
 *   2. Commits and pushes the editorial repo
 *   3. Runs export-public-repo.mjs (rebuild public-repo/)
 *   4. Commits and pushes the public repo (triggers Azure deploy)
 *
 * Usage:
 *   node scripts/publish-now.mjs              # full publish
 *   node scripts/publish-now.mjs --dry-run    # preview without publishing
 *
 * Requires:
 *   - git configured with push access to both repos
 *   - public-repo/ remote set to the public repo (FallenHoot/olinske)
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_REPO_DIR = join(ROOT, 'public-repo');
const QUEUE_PATH = join(ROOT, 'data', 'publish-queue.json');

const dryRun = process.argv.includes('--dry-run');

function run(cmd, opts = {}) {
  const cwd = opts.cwd || ROOT;
  console.log(`  $ ${cmd}`);
  if (dryRun && opts.skipInDryRun) {
    console.log('  [dry-run] skipped');
    return '';
  }
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (err) {
    console.error(`  Command failed: ${err.message}`);
    if (err.stderr) console.error(`  stderr: ${err.stderr.trim()}`);
    throw err;
  }
}

function hasGitChanges(cwd) {
  const status = run('git status --porcelain', { cwd });
  return status.length > 0;
}

async function main() {
  console.log('');
  console.log('=========================================');
  console.log(' PUBLISH NOW — Full End-to-End Pipeline');
  console.log('=========================================');
  if (dryRun) console.log(' MODE: DRY RUN\n');
  else console.log('');

  // Pre-flight: check the queue has an approved post
  const queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'));
  const next = Array.isArray(queue.queue)
    ? queue.queue.find(item => item.approved && item.slug)
    : null;

  if (!next) {
    console.log('No approved post in queue. Nothing to publish.');
    process.exit(0);
  }

  console.log(`Next approved post: ${next.slug}`);
  if (next.scheduledDate) console.log(`Scheduled for: ${next.scheduledDate}`);
  console.log('');

  // ── Step 1: Run weekly-publish.mjs ──────────────────────────
  console.log('── Step 1: Publish (move to published/) ──');
  const publishArgs = dryRun ? '--dry-run' : '';
  run(`node scripts/weekly-publish.mjs ${publishArgs}`.trim());
  console.log('');

  if (dryRun) {
    console.log('── Dry run complete. No changes made. ──');
    process.exit(0);
  }

  // ── Step 2: Commit & push editorial repo ────────────────────
  console.log('── Step 2: Commit & push editorial repo ──');
  if (hasGitChanges(ROOT)) {
    run('git add -A');
    run(`git commit -m "publish: ${next.slug} — ${new Date().toISOString().split('T')[0]}"`);
    run('git push');
    console.log('  Editorial repo pushed.\n');
  } else {
    console.log('  No changes to commit in editorial repo.\n');
  }

  // ── Step 3: Export to public repo ───────────────────────────
  console.log('── Step 3: Export to public repo ──');
  run('node scripts/export-public-repo.mjs --output public-repo');
  console.log('');

  // ── Step 4: Commit & push public repo ───────────────────────
  console.log('── Step 4: Commit & push public repo ──');
  if (!existsSync(join(PUBLIC_REPO_DIR, '.git'))) {
    console.error('  public-repo/ is not a git repository. Cannot push.');
    console.error('  Run: cd public-repo && git init && git remote add origin https://github.com/FallenHoot/olinske.git');
    process.exit(1);
  }

  if (hasGitChanges(PUBLIC_REPO_DIR)) {
    run('git add -A', { cwd: PUBLIC_REPO_DIR });
    run(`git commit -m "publish: ${next.slug}"`, { cwd: PUBLIC_REPO_DIR });
    run('git push', { cwd: PUBLIC_REPO_DIR });
    console.log('  Public repo pushed. Azure deploy will trigger.\n');
  } else {
    console.log('  No changes to push to public repo.\n');
  }

  // ── Done ────────────────────────────────────────────────────
  console.log('=========================================');
  console.log(` PUBLISHED: ${next.slug}`);
  console.log(' Blog: deploying via Azure (check GitHub Actions)');
  console.log(' LinkedIn: fires 1 hour after publish');
  console.log('=========================================');
}

main().catch(err => {
  console.error('\nPublish failed:', err.message);
  process.exit(1);
});
