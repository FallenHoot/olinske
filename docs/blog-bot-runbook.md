# Blog Bot Runbook — Troubleshooting & Recovery

**Purpose:** Step-by-step procedures for debugging and recovering from common Blog Bot publishing failures.

**Always read the incident log first:** `.artifacts/incident-log.jsonl` — check if this problem has happened before.

---

## Table of Contents

1. [General Troubleshooting](#general-troubleshooting)
2. [Artifact Failures](#artifact-failures)
3. [Confidentiality Issues](#confidentiality-issues)
4. [API/Code Issues](#apicode-issues)
5. [Deploy Failures](#deploy-failures)
6. [Metadata Mismatches](#metadata-mismatches)
7. [Social Preview (OG) Broken](#social-preview-og-broken)
8. [Rolling Back a Published Post](#rolling-back-a-published-post)

---

## General Troubleshooting

### "Blog Bot failed at stage X. What now?"

**Step 1:** Check the error message
```
Example: "Agent artifact validation failed: expected file not found: fact-risk-report.json"
```

**Step 2:** Identify the category
- **stale-api-call** → Code example is outdated
- **unverified-claim** → Missing source/citation
- **confidential-leak** → Customer info or internal details exposed
- **missing-artifact** → A required file wasn't created
- **metadata-mismatch** → YAML frontmatter is wrong
- **deploy-failure** → Publish succeeded, but Azure deploy failed
- **og-preview-broken** → Social media preview is wrong or missing
- **audience-mismatch** → Post doesn't solve stated problem

**Step 3:** Consult the appropriate section below based on category.

**Step 4:** Check incident log
```bash
# View recent incidents
grep "\"category\": \"$CATEGORY\"" .artifacts/incident-log.jsonl | tail -5

# Example: find all stale-api-call incidents
grep "stale-api-call" .artifacts/incident-log.jsonl
```

**Step 5:** Apply the prevention rule from the most recent similar incident, or follow the runbook below.

---

## Artifact Failures

### Symptom: "Agent artifact validation failed: expected file not found: X"

**Root cause:** A required artifact file is missing or empty.

**Required files:**
- `audience-signals.md`
- `research-evidence.json`
- `outline.md`
- `draft.md`
- `fact-risk-report.json`
- `contrarian-review.md`
- `framework-pack.md`

### Recovery Steps

#### 1. Identify which file is missing
```bash
# Check the artifact directory
ls -la .artifacts/blog/<slug>/

# Example
ls -la .artifacts/blog/bpf-ml-inference-gateway/
```

#### 2. If the file is completely missing
- **Example:** `fact-risk-report.json` doesn't exist
- **Reason:** fact-risk-reviewer agent wasn't invoked or failed
- **Fix:** Re-run the missing gate manually
  ```
  @fact-risk-reviewer Evaluate this draft: .artifacts/blog/<slug>/draft.md
  → Produces fact-risk-report.json
  ```

#### 3. If the file is empty or only whitespace
- **Example:** `framework-pack.md` exists but is blank
- **Reason:** Agent ran but produced no output (bug or context issue)
- **Fix:** Re-run the agent with more context
  ```
  @framework-distiller
  Here's the core insight from this post:
  [paste the main thesis from draft.md]
  
  Distill the ONE big idea into a crisp, defensible statement.
  Output to: .artifacts/blog/<slug>/framework-pack.md
  ```

#### 4. Rerun artifact validation
```bash
node scripts/validate-agent-artifacts.mjs --post content/published/<slug>.md
```

**Expected output:**
```
Agent artifact validation passed for slug: <slug>
```

#### 5. Log the incident (for Blog Bot learning)
```json
{
  "timestamp": "2026-08-18T15:00:00Z",
  "slug": "your-slug-here",
  "stage": "artifact-validation",
  "error": "Missing fact-risk-report.json",
  "rootCause": "fact-risk-reviewer agent was not invoked for this post",
  "resolution": "Manually re-ran fact-risk-reviewer, generated missing file, reran validation",
  "preventionRule": "Add explicit confirmation in publish gate: require user to verify all 7 artifact files exist before submit",
  "category": "missing-artifact",
  "severity": "medium"
}
```

---

## Confidentiality Issues

### Symptom: "Confidentiality gate FAILED: Keyword detected"

**Red-flag keywords Blog Bot watches for:**
- Customer names (unless already public + approved)
- "FY2027 roadmap", "unreleased", "confidential"
- Internal product codenames (e.g., "Project Titan")
- Incident timelines from internal postmortems
- Meeting attendee lists or private discussion notes
- Exact budget/revenue figures for customers or deals

### Recovery Steps

#### 1. Identify what triggered the flag
```
Example: "Keyword 'internal roadmap' found in paragraph 3 of draft"
```

#### 2. Review the flagged content
```bash
# Open the draft
cat .artifacts/blog/<slug>/draft.md | grep -A 2 -B 2 "internal roadmap"
```

#### 3. Decide: remove or generalize?

**Option A: Remove it entirely**
- If it's not essential to the point, delete the sentence/paragraph
- Rerun confidentiality gate

**Option B: Generalize it**
- Replace specifics with broader statements
- Example:
  - ❌ "Azure Cosmos DB added feature X in March 2026"
  - ✅ "Azure Cosmos DB recently added feature X"
  
- Replace exact numbers with ranges
  - ❌ "$4.2M customer impact"
  - ✅ "Multi-million dollar customer impact"

#### 4. Rerun confidentiality gate
```
@blog-bot confidentiality-check
Here's the revised paragraph:
[paste the edited text]

Does this pass confidentiality review?
```

#### 5. If gate passes, update draft.md
```bash
# Edit .artifacts/blog/<slug>/draft.md with your approved changes
# Then rerun publish
```

#### 6. Log the incident
```json
{
  "timestamp": "2026-08-18T15:15:00Z",
  "slug": "your-slug",
  "stage": "confidentiality-review",
  "error": "Keyword 'internal roadmap' detected in draft",
  "rootCause": "Content copied from internal Slack discussion; not reviewed for public audience",
  "resolution": "Generalized statement from 'internal roadmap' to 'recent platform direction'; removed exact dates",
  "preventionRule": "When drafting from internal sources, explicitly flag to draft-writer: 'This is based on internal materials; please generalize all specifics for public audience'",
  "category": "confidential-leak",
  "severity": "high"
}
```

---

## API/Code Issues

### Symptom: "Code snippet uses deprecated Astro.glob() API"

**Root cause:** Example code was written for an older version of a framework (Astro, Node, etc.).

### Recovery Steps

#### 1. Identify all code snippets in the draft
```bash
# Count code blocks
grep -c '```' .artifacts/blog/<slug>/draft.md
```

#### 2. Check each snippet against current API docs
- **Astro:** https://docs.astro.build
- **Node.js:** https://nodejs.org/docs
- **Azure SDK:** https://learn.microsoft.com/en-us/javascript/api/overview/azure

#### 3. Update the snippet
```bash
# Edit .artifacts/blog/<slug>/draft.md
# Replace deprecated calls with current API
```

**Example:**
```javascript
// ❌ OLD (Astro 3.x)
const posts = import.meta.glob('./posts/*.md');

// ✅ NEW (Astro 4.x+)
const posts = import.meta.glob('./posts/*.md', { eager: true });
```

#### 4. Test the snippet (if possible)
```bash
# If the code is executable, run it locally to verify it works
node <snippet.js>
```

#### 5. Rerun template-optimizer
```
@template-optimizer
Here's a code snippet from my post. Is it valid for the current version?
[paste the snippet]
Verify against: Astro 4.x, Node.js 20.x
```

#### 6. Log the incident
```json
{
  "timestamp": "2026-08-18T15:30:00Z",
  "slug": "your-slug",
  "stage": "template-validation",
  "error": "Astro.glob() is deprecated in Astro 4.0+",
  "rootCause": "Draft was written when Astro 3.x was current; didn't check release notes",
  "resolution": "Updated import.meta.glob() call; tested locally; reran template-optimizer",
  "preventionRule": "Run template-optimizer BEFORE fact-risk gate. Template-optimizer must check all import/export statements against the framework's latest migration guide.",
  "category": "stale-api-call",
  "severity": "medium"
}
```

---

## Deploy Failures

### Symptom: "Publish succeeded locally, but Azure deploy failed"

**Timeline:**
1. Editorial repo: commit pushed ✅
2. Public repo: export succeeded ✅
3. Public repo: deploy GitHub Action triggered ✅
4. Azure: build or deployment pipeline failed ❌

### Recovery Steps

#### 1. Check the Azure deploy logs
```bash
# Link is provided in the publish confirmation message
# Example: https://portal.azure.com/...
```

**Common Azure errors:**
- **Build failed:** Missing dependency, syntax error, config issue
- **Deploy failed:** Storage account offline, managed identity permission missing
- **Runtime error:** Function crash, invalid configuration

#### 2. Check public repo for build errors
```bash
# Go to public-repo/
cd public-repo

# Check package.json and dependencies
npm ci
npm run build

# Example error:
# Error: Cannot find module 'old-library'
# Fix: Update to 'new-library' in package.json, re-export
```

#### 3. Decide: fix or rollback?

**If fixable (e.g., missing dependency):**
- Fix the issue in the editorial repo (or public repo directly)
- Commit and push public repo
- Re-trigger deploy
- Verify canonical URL returns 200 OK

**If not fixable or risky:**
- See section "Rolling Back a Published Post" below

#### 4. Verify the fix
```bash
# Once deploy succeeds:
curl -I https://zach.olinske.com/posts/<slug>/

# Expected: HTTP 200
```

#### 5. Log the incident
```json
{
  "timestamp": "2026-08-18T16:00:00Z",
  "slug": "your-slug",
  "stage": "deploy",
  "error": "Azure deploy failed: Missing npm dependency 'astro-component-library'",
  "rootCause": "export-public-repo.mjs didn't copy package.json from editorial repo; public repo had stale dependency list",
  "resolution": "Manually synced package.json from editorial to public repo; re-ran npm ci; deploy succeeded",
  "preventionRule": "Add post-export validation: verify package.json timestamps match and npm ci succeeds in public repo before triggering deploy",
  "category": "deploy-failure",
  "severity": "high"
}
```

---

## Metadata Mismatches

### Symptom: "Frontmatter status is 'draft' but file is in content/published/"

**Problem:** YAML frontmatter doesn't match the file's actual state.

### Recovery Steps

#### 1. Check the file's frontmatter
```bash
head -20 content/published/<slug>.md
```

**Look for:**
```yaml
---
status: published  # Must be "published" for published files
publishDate: 2026-08-18  # Must be set
draft: false  # Optional but should be false
---
```

#### 2. If status is wrong
```bash
# Edit the file:
# Change: status: draft
# To: status: published

# Add publishDate if missing:
# publishDate: 2026-08-18
```

#### 3. Rerun preflight
```bash
node scripts/validate-agent-artifacts.mjs --post content/published/<slug>.md
```

#### 4. If still failing, check publish queue
```bash
# View the queue
cat data/publish-queue.json | jq '.queue[] | select(.slug == "<slug>")'

# Fix the queue entry if needed
```

#### 5. Log the incident
```json
{
  "timestamp": "2026-08-18T16:15:00Z",
  "slug": "your-slug",
  "stage": "artifact-validation",
  "error": "Frontmatter status is 'draft' but file is in content/published/",
  "rootCause": "weekly-publish.mjs moved file but didn't update YAML frontmatter",
  "resolution": "Manually edited frontmatter: status → published, added publishDate",
  "preventionRule": "Make weekly-publish.mjs responsible for updating frontmatter status and publishDate when moving file",
  "category": "metadata-mismatch",
  "severity": "medium"
}
```

---

## Social Preview (OG) Broken

### Symptom: "LinkedIn preview looks wrong (missing image, bad title)"

**Problem:** Open Graph metadata is missing or incorrect in the HTML head.

### Recovery Steps

#### 1. Check the published file's frontmatter
```bash
head -30 content/published/<slug>.md
```

**Required OG fields:**
```yaml
title: "The Real Title of the Post"
description: "2-3 sentence summary for social preview"
publishDate: 2026-08-18
image: /images/hero-image.png
---
```

#### 2. If image path is wrong
```bash
# Check if the image exists
ls -la public/images/hero-image.png

# If missing, add the image to public/images/
# Then update the frontmatter: image: /images/hero-image.png
```

#### 3. If image exists locally but not in public/
```bash
# Copy the image
cp local/path/to/image.png public/images/image.png

# Update frontmatter
image: /images/image.png
```

#### 4. Re-export to public repo
```bash
node scripts/export-public-repo.mjs --output public-repo
```

#### 5. Verify OG preview
```bash
# Check the rendered HTML
curl https://zach.olinske.com/posts/<slug>/ | grep -A 5 'og:image'

# Use a preview tool
# Example: https://www.opengraphcheck.com/
```

#### 6. Log the incident
```json
{
  "timestamp": "2026-08-18T16:30:00Z",
  "slug": "your-slug",
  "stage": "deploy",
  "error": "OG image path /images/old-hero.png returns 404; social preview broken",
  "rootCause": "Image was deleted before publish but frontmatter wasn't updated",
  "resolution": "Added correct image to public/images/; updated frontmatter; re-exported; verified OG preview",
  "preventionRule": "Pre-publish gate: verify all referenced images exist in public/images/ before deploy",
  "category": "og-preview-broken",
  "severity": "low"
}
```

---

## Rolling Back a Published Post

### Scenario: "We published something we shouldn't have. Roll it back."

### Step-by-Step Rollback

#### 1. Stop further distribution
```bash
# Immediately:
# - Don't share the post on social media
# - Unpublish from LinkedIn if already posted
# - Consider a "correction coming" post if it's already widely shared
```

#### 2. Revert the public repo commit
```bash
cd public-repo

# Find the commit hash of the offending post
git log --oneline | head -10

# Example output:
# a1b2c3d publish: your-slug — 2026-08-18
# f4e5d6c publish: previous-slug — 2026-08-10

# Revert the most recent commit
git revert a1b2c3d

# Or, if you want to keep history cleaner:
# git reset --hard f4e5d6c
# git push --force

git push
```

**Note:** `git revert` is safer than `git reset --force` because it preserves the history that we made a correction.

#### 3. Monitor the rollback deploy
```bash
# Azure should auto-trigger deploy
# Check the pipeline: https://portal.azure.com/...
# Verify: canonical URL returns the corrected version or 404
```

#### 4. Update editorial repo
```bash
cd ../

# Option A: Delete the problematic post from editorial repo
rm content/published/<slug>.md

# Option B: Move it back to backlog with "DO NOT PUBLISH" note
mv content/published/<slug>.md content/backlog/<slug>.md
# Edit frontmatter: status: backlog, add note: "REJECTED — [reason]"

# Commit and push
git add -A
git commit -m "rollback: <slug> — [reason]"
git push
```

#### 5. Log the incident (critical!)
```json
{
  "timestamp": "2026-08-18T17:00:00Z",
  "slug": "your-slug",
  "stage": "post-publish-rollback",
  "error": "Published post contained confidential customer info",
  "rootCause": "Confidentiality gate was skipped; post went straight to deploy",
  "resolution": "Reverted public repo commit; deleted post from editorial repo; notified any users who saw it",
  "preventionRule": "CRITICAL: Never skip confidentiality gate. Make it non-negotiable before publish.",
  "category": "confidential-leak",
  "severity": "critical"
}
```

#### 6. Post-Mortem
- Write a brief analysis: Why did this get through?
- Update the prevention rules in Blog Bot
- If it's a systemic issue, consider adding an extra human review step

---

## Quick Reference: Common Prevention Rules

| Issue | Prevention Rule |
|-------|-----------------|
| Stale API calls | Always run template-optimizer BEFORE fact-risk gate |
| Confidential leaks | Require confidentiality gate BEFORE draft approval |
| Missing artifacts | Add explicit artifact file checklist to publish gate |
| Deploy failures | Add post-export validation: verify npm ci succeeds in public repo |
| OG preview broken | Pre-publish: verify all image paths exist and resolve |
| Metadata mismatch | Automate frontmatter updates in publish script |
| Audience mismatch | Require audience-signals.md to define the problem + audience BEFORE drafting |

---

## When All Else Fails

**Escalation path:**
1. Check incident log for similar past failures
2. Run Blog Bot debug: `@blog-bot debug --slug <slug>`
3. Ask for help: `@blog-bot I'm stuck. Can you walk me through fixing this?`

Blog Bot learns from your answers. The more you use it, the better it gets.

