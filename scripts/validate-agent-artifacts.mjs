import fs from 'node:fs';
import path from 'node:path';

const postArgIndex = process.argv.findIndex((arg) => arg === '--post');
const postArg = postArgIndex > -1 ? process.argv[postArgIndex + 1] : '';

const requiredFiles = [
  'audience-signals.md',
  'research-evidence.json',
  'outline.md',
  'draft.md',
  'fact-risk-report.json',
  'contrarian-review.md',
  'framework-pack.md'
];

if (!postArg) {
  console.log('Skipping agent artifact validation: no --post argument provided.');
  process.exit(0);
}

const postPath = path.resolve(postArg);
if (!fs.existsSync(postPath)) {
  console.error(`Agent artifact validation failed: post file does not exist: ${postArg}`);
  process.exit(1);
}

const slug = path.basename(postPath, path.extname(postPath));
const artifactRoot = path.resolve('.artifacts', 'blog', slug);

if (!fs.existsSync(artifactRoot)) {
  console.error(`Agent artifact validation failed: expected artifact directory not found: ${path.relative(process.cwd(), artifactRoot)}`);
  process.exit(1);
}

const missing = [];
for (const fileName of requiredFiles) {
  const filePath = path.join(artifactRoot, fileName);
  if (!fs.existsSync(filePath)) {
    missing.push(path.relative(process.cwd(), filePath));
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (content.length === 0) {
    missing.push(`${path.relative(process.cwd(), filePath)} (empty)`);
  }
}

if (missing.length > 0) {
  console.error('Agent artifact validation failed. Missing or empty files:');
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log(`Agent artifact validation passed for slug: ${slug}`);
