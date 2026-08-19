# Blog Bot Quick Start

**One-page reference for using Blog Bot to publish your blog posts.**

---

## TL;DR

Blog Bot is your publishing co-pilot. It learns from mistakes, enforces quality gates, and guides you through error recovery.

**Publish a post:**
```
@blog-bot
Publish BL-001 now.
```

**Fix a failure:**
```
@blog-bot
Why did BL-007 fail? Help me fix it.
```

**Write a new post:**
```
@blog-bot
I want to write about [topic] for [audience].
Walk me through the process.
```

---

## The 7-Step Workflow

| Step | What Blog Bot Does | What You Do |
|------|------------------|-----------|
| 1. Intake | Confirms topic, audience, outcome. Checks incident log for related past failures. | Describe what you want to write |
| 2. Signals | Runs Microsoft signals + watchlist + audience analysis | Review the signals. Approve the angle. |
| 3. Outline | Builds the narrative structure | Confirm the structure makes sense |
| 4. Draft | Writes the post | Read the draft, suggest edits |
| 5. Gates | Runs fact-risk, confidentiality, code validation, metadata | Review gate results. Flag any concerns. |
| 6. Review | Presents final post for approval | Type "APPROVED" or ask for revisions |
| 7. Publish | Moves to published/, exports to public repo, triggers deploy | Monitor the deployment. Verify live. |

---

## Incident Log: Your Learning System

When a post fails, Blog Bot logs why:
- **What broke** (error message)
- **Why it broke** (root cause)
- **How we fixed it** (resolution)
- **How to prevent it next time** (prevention rule)

**Files:**
- Location: `.artifacts/incident-log.jsonl`
- One JSON object per line
- Queryable by category, severity, stage, timestamp

**Query examples:**
```bash
# All stale API call incidents
grep "stale-api-call" .artifacts/incident-log.jsonl

# High-severity only
grep "\"severity\": \"high\"" .artifacts/incident-log.jsonl

# Recent incidents (last 7 days)
jq 'select(.timestamp > "2026-08-11")' .artifacts/incident-log.jsonl
```

---

## Required Artifacts (Publish Will Fail Without These)

Every published post needs 7 files in `.artifacts/blog/<slug>/`:

1. ✅ **audience-signals.md** — Who we're writing for + their problem
2. ✅ **research-evidence.json** — Sources, quotes, proof
3. ✅ **outline.md** — The narrative structure
4. ✅ **draft.md** — Final post (polished)
5. ✅ **fact-risk-report.json** — Claims validated, risks identified
6. ✅ **contrarian-review.md** — Devil's advocate challenge
7. ✅ **framework-pack.md** — The ONE big idea, distilled

**Validation:**
```bash
node scripts/validate-agent-artifacts.mjs --post content/published/<slug>.md
```

Expected output:
```
Agent artifact validation passed for slug: <slug>
```

---

## Common Issues & Quick Fixes

| Issue | Solution | Runbook Link |
|-------|----------|-------------|
| "Missing artifact file" | Re-run the gate that should have created it. Check incident log. | [Artifact Failures](docs/blog-bot-runbook.md#artifact-failures) |
| "Confidential content detected" | Generalize or remove the statement. Rerun gate. | [Confidentiality Issues](docs/blog-bot-runbook.md#confidentiality-issues) |
| "Code uses deprecated API" | Update the snippet. Test. Rerun gate. | [API/Code Issues](docs/blog-bot-runbook.md#apicode-issues) |
| "Azure deploy failed" | Check Azure logs. Fix build issue. Re-push. | [Deploy Failures](docs/blog-bot-runbook.md#deploy-failures) |
| "Frontmatter is wrong" | Edit YAML frontmatter. Verify status & publishDate. | [Metadata Mismatches](docs/blog-bot-runbook.md#metadata-mismatches) |
| "Social preview is broken" | Check image path. Verify OG metadata in HTML. | [Social Preview](docs/blog-bot-runbook.md#social-preview-og-broken) |
| "Need to roll back" | Revert public repo commit. Monitor deploy. | [Rolling Back](docs/blog-bot-runbook.md#rolling-back-a-published-post) |

**Full runbook:** `docs/blog-bot-runbook.md`

---

## Chat Commands

### Publish Workflow
```
@blog-bot
Publish BL-001 now. Guide me through the gates.
```
Blog Bot will:
- Validate all 7 artifacts
- Run confidentiality check
- Run fact-risk review
- Validate code snippets
- Verify metadata
- Present for approval

### Debug a Failure
```
@blog-bot
Why didn't BL-007 publish? Help me understand what went wrong.
```
Blog Bot will:
- Check incident log for related failures
- Identify root cause
- Suggest the fix
- Guide you through recovery steps
- Log the new incident

### New Post Workflow
```
@blog-bot
I want to write about [topic] for [audience: engineers, architects, CTOs, etc.].

Help me build this post from scratch.
```
Blog Bot will:
- Confirm topic + audience + outcome
- Run signals (Microsoft + watchlist + audience)
- Build outline
- Draft the post
- Run gates
- Present for approval

### Monitor & Improve
```
@blog-bot
Show me incidents from the last 30 days.
Which categories are most common?
What patterns do you see?
```
Blog Bot will:
- Query incident log
- Group by category
- Show trends
- Suggest workflow improvements

### View Artifacts
```
@blog-bot
Show me the artifacts for BL-001.
Are all 7 files present and non-empty?
```
Blog Bot will:
- List all artifacts
- Report status (present/missing/empty)
- Identify what needs fixing

---

## Monthly Checklist

- [ ] Review incident log (5 min)
  ```bash
  jq 'select(.timestamp > "2026-08-11")' .artifacts/incident-log.jsonl
  ```
- [ ] Check top failure categories
  ```bash
  grep "\"category\"" .artifacts/incident-log.jsonl | cut -d: -f2 | sort | uniq -c | sort -rn
  ```
- [ ] Update prevention rules if patterns emerge
- [ ] Verify all published posts are live and OG previews correct

---

## Quarterly Review

- [ ] Analyze incident trends (which category most common this quarter?)
- [ ] Run `@platform-enhancement-scout` (Astro updates, new APIs)
- [ ] Refresh code snippet examples if APIs have changed
- [ ] Adjust workflow if new patterns detected
- [ ] Update Blog Bot instructions if needed

---

## Key Principles

### ✅ DO

- Use Blog Bot for every post (new, fix, publish)
- Log incidents thoroughly (the better the notes, the smarter Blog Bot gets)
- Review incident log monthly (spot patterns)
- Follow the runbook when things break (it's been tested)
- Type "APPROVED" explicitly before publish (no auto-publish)
- Query the incident log when debugging (learn from past mistakes)

### ❌ DON'T

- Skip gates (they're there for a reason)
- Auto-publish (always require human approval)
- Ignore the incident log (it's your learning system)
- Assume deploy succeeded (always verify)
- Publish without all 7 artifacts (validation will catch it)

---

## Files & Locations

| File | Purpose |
|------|---------|
| `.github/skills/blog-bot/SKILL.md` | Blog Bot skill (full workflow definition) |
| `.github/agents/blog-bot.agent.md` | Blog Bot agent (VS Code integration) |
| `docs/blog-bot-runbook.md` | Recovery procedures (step-by-step for every failure type) |
| `docs/blog-bot-migration-guide.md` | Philosophy & comparison to old system |
| `.artifacts/incident-log.jsonl` | Learning log (one JSON per line) |
| `.artifacts/blog/<slug>/` | Artifact directory (7 required files per post) |
| `docs/publish-preflight-checklist.md` | Pre-publish validation checklist |
| `scripts/validate-agent-artifacts.mjs` | Artifact validation script |
| `scripts/publish-now.mjs` | Full publish pipeline |

---

## When You're Stuck

**Step 1:** Check the incident log
```bash
grep "<slug>" .artifacts/incident-log.jsonl
```

**Step 2:** Open the runbook
- `docs/blog-bot-runbook.md`
- Find your error category
- Follow the recovery steps

**Step 3:** If not in the runbook, ask Blog Bot
```
@blog-bot
I'm stuck. Here's the error:
[paste error message]

What do I do?
```

Blog Bot will:
1. Check the incident log
2. Identify similar past incidents
3. Suggest the fix
4. Guide recovery
5. Help you log the new incident

---

## Success Metrics

Track these over time:

- **Posts published per month** (target: 1–2)
- **Average time from backlog → live** (target: < 1 week)
- **Incidents per month** (goal: decreasing over time)
- **Most common error category** (goal: zero repeats)
- **Recovery time when errors occur** (target: < 30 min)

---

## More Information

- **Deep workflow:** `.github/skills/blog-bot/SKILL.md`
- **Error recovery:** `docs/blog-bot-runbook.md`
- **Philosophy & changes:** `docs/blog-bot-migration-guide.md`
- **Artifact contract:** `docs/agent-artifact-contract.md`
- **Editorial policy:** `docs/editorial-policy.md`
- **Confidentiality rules:** `docs/confidentiality-rules.md`

---

**TL;DR: Use Blog Bot. It learns. It gets better. You publish more, with less toil.**

