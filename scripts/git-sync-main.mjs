#!/usr/bin/env node

import { execSync } from 'node:child_process';

function run(command, options = {}) {
  execSync(command, { stdio: 'inherit', ...options });
}

function output(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

const message = process.argv.slice(2).join(' ').trim();
if (!message) {
  console.error('Usage: npm run git:sync -- "your commit message"');
  process.exit(1);
}

const branch = output('git branch --show-current');
if (branch !== 'main') {
  console.error(`git:sync only runs on main. Current branch: ${branch}`);
  process.exit(1);
}

run('git add -A');

const status = output('git status --porcelain');
if (!status) {
  console.log('No changes to commit.');
  process.exit(0);
}

run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
run('git push origin main');

console.log('Sync complete: committed and pushed to origin/main.');
