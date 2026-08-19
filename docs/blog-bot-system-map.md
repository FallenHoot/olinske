# Blog Bot System Map

**How Blog Bot works, where files live, and how it learns from mistakes.**

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      BLOG BOT SYSTEM                             │
└─────────────────────────────────────────────────────────────────┘

INPUT: User Request
  │
  ├─→ "Publish BL-001 now"
  ├─→ "Why did BL-007 fail?"
  └─→ "Write a post about X for audience Y"
  │
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ BLOG BOT ORCHESTRATOR (@blog-bot)                               │
│ Location: .github/agents/blog-bot.agent.md                      │
│ Workflow: .github/skills/blog-bot/SKILL.md                      │
│ - Routes to correct workflow                                    │
│ - Checks incident log for related past failures                │
│ - Applies learned prevention rules                              │
└─────────────────────────────────────────────────────────────────┘
  │
  ├─ NEW POST WORKFLOW
  │  ├─→ @microsoft-signals-scout
  │  ├─→ @watchlist-signals-scout
  │  ├─→ @audience-problem-miner
  │  ├─→ @topic-strategist
  │  ├─→ @research-analyst
  │  │   → .artifacts/blog/<slug>/audience-signals.md
  │  │   → .artifacts/blog/<slug>/research-evidence.json
  │  │
  │  ├─→ @outline-architect
  │  │   → .artifacts/blog/<slug>/outline.md
  │  │
  │  ├─→ @template-optimizer (validate APIs EARLY!)
  │  │
  │  ├─→ @draft-writer
  │  │   → .artifacts/blog/<slug>/draft.md
  │  │
  │  ├─→ QUALITY GATES (all must pass)
  │  │   ├─ confidentiality-check (automated keyword scan)
  │  │   ├─ @fact-risk-reviewer → fact-risk-report.json
  │  │   ├─ @contrarian-reviewer → contrarian-review.md
  │  │   └─ @framework-distiller → framework-pack.md
  │  │
  │  ├─→ POLISH
  │  │   ├─ @voice-editor
  │  │   ├─ @seo-distribution-editor
  │  │   ├─ @design-ux-director
  │  │   └─ @image-director
  │  │
  │  └─→ HUMAN APPROVAL (required: type "APPROVED")
  │      └─ @publisher-agent → publish!
  │
  ├─ FIX EXISTING POST WORKFLOW
  │  ├─→ Validate artifacts exist
  │  ├─→ Run gates
  │  ├─→ Human approval
  │  └─→ Publish
  │
  └─ DEBUG FAILURE WORKFLOW
     ├─→ Query incident log for related past failures
     ├─→ Identify root cause + category
     ├─→ Follow runbook (docs/blog-bot-runbook.md)
     ├─→ Suggest fix
     ├─→ Guide recovery steps
     └─→ Log new incident (Blog Bot learns!)

OUTPUT: Published Post OR Recovery Procedure
  │
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SUCCESS PATH                                                     │
│ ├─ content/published/<slug>.md (markdown)                       │
│ ├─ .artifacts/blog/<slug>/ (7 required artifact files)          │
│ ├─ public-repo/ (exported for deployment)                       │
│ ├─ Azure deployment succeeds                                    │
│ └─ https://zach.olinske.com/posts/<slug>/ (live!)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FAILURE → RECOVERY LOOP                                          │
│ ├─ Failure detected at stage X                                  │
│ ├─ Query incident log for similar past failures                │
│ ├─ Apply learned prevention rule                                │
│ ├─ Follow runbook section for this error category              │
│ ├─ Fix the issue                                                │
│ ├─ Retry the gate                                               │
│ ├─ Success!                                                      │
│ └─ New incident logged (.artifacts/incident-log.jsonl)         │
│    → Blog Bot learns from this failure too                      │
└─────────────────────────────────────────────────────────────────┘

LEARNING SYSTEM
  │
  ├─ Incident Log (.artifacts/incident-log.jsonl)
  │  ├─ Every failure: timestamp, slug, stage, error
  │  ├─ Root cause analysis
  │  ├─ Resolution steps
  │  └─ PREVENTION RULE (the learning!)
  │
  ├─ Queryable by:
  │  ├─ Category (stale-api-call, confidential-leak, etc.)
  │  ├─ Stage (intake, draft, gates, deploy)
  │  ├─ Severity (low, medium, high, critical)
  │  ├─ Timestamp (recent vs. historical)
  │  └─ Slug (which post caused it?)
  │
  └─ Monthly Review
     ├─ Which categories most common?
     ├─ Trends emerging?
     └─ Should we change the workflow?
```

---

## File Locations

### Core Blog Bot Files
```
.github/
├─ skills/
│  └─ blog-bot/
│     └─ SKILL.md                    ← Full workflow definition
│
└─ agents/
   └─ blog-bot.agent.md               ← VS Code integration
```

### Documentation
```
docs/
├─ blog-bot-quick-start.md            ← One-page reference (START HERE)
├─ blog-bot-runbook.md                ← Error recovery procedures
├─ blog-bot-migration-guide.md         ← Philosophy & changes from v1
├─ blog-bot-system-map.md              ← This file
├─ agent-artifact-contract.md          ← Required artifact files
├─ publish-preflight-checklist.md      ← Pre-publish validation
├─ editorial-policy.md                 ← Writing principles
├─ confidentiality-rules.md            ← What can't be published
└─ old-blog-orchestrator-mode.md       ← Legacy (if keeping reference)
```

### Artifacts & Learning
```
.artifacts/
├─ incident-log.jsonl                 ← Learning log (one JSON/line)
│
└─ blog/
   ├─ BL-001/
   │  ├─ audience-signals.md           ✅ Required
   │  ├─ research-evidence.json        ✅ Required
   │  ├─ outline.md                    ✅ Required
   │  ├─ draft.md                      ✅ Required
   │  ├─ fact-risk-report.json         ✅ Required
   │  ├─ contrarian-review.md          ✅ Required
   │  └─ framework-pack.md             ✅ Required
   │
   └─ BL-002/
      └─ (same 7 files)
```

### Publishing & Scripts
```
scripts/
├─ validate-agent-artifacts.mjs        ← Validates all 7 artifacts
├─ publish-now.mjs                     ← Full publish pipeline
├─ weekly-publish.mjs                  ← Move backlog → published
├─ export-public-repo.mjs              ← Sync to public repo
└─ post-to-linkedin.mjs                ← LinkedIn distribution

content/
├─ backlog/
│  ├─ BL-001-*
│  ├─ BL-002-*
│  └─ ... (queue of unpublished posts)
│
└─ published/
   ├─ *-*.md                          (already published)
   └─ (canonical URL: zach.olinske.com/posts/*)
```

---

## How Blog Bot Learns

### Step 1: Incident Occurs
```
User tries to publish post XYZ.
Error: "Code uses deprecated Astro.glob() API"
```

### Step 2: User Follows Runbook
```
User reads: docs/blog-bot-runbook.md → API/Code Issues section
Fixes the code snippet.
Reruns template-optimizer gate.
Success!
```

### Step 3: Blog Bot Logs the Incident
```json
{
  "timestamp": "2026-08-18T14:30:00Z",
  "slug": "XYZ",
  "stage": "template-validation",
  "error": "Astro.glob() is deprecated in Astro 4.0+",
  "rootCause": "Draft written against Astro 3.x docs",
  "resolution": "Updated to import.meta.glob(); tested",
  "preventionRule": "Run template-optimizer BEFORE draft approval. Always validate imports against current framework version.",
  "category": "stale-api-call",
  "severity": "medium"
}
```

### Step 4: Blog Bot Uses the Learning
```
Next month, user publishes post ABC.
Blog Bot checks incident log.
Finds: "stale-api-call" has happened 3 times this quarter.
Prevention rule: "Run template-optimizer BEFORE draft approval"
Blog Bot automatically applies this rule earlier in workflow.
User gets better, faster feedback.
```

### Step 5: Quarterly Analysis
```
Blog Bot queries incident log:
  - stale-api-call: 3 occurrences (most common)
  - confidential-leak: 1 occurrence
  - deploy-failure: 1 occurrence
  
Recommendation: "Consider integrating Astro migration guide into template-optimizer context to catch this proactively."

Zach updates template-optimizer instructions.
Problem is prevented before it happens.
```

---

## Prevention Rules Learned So Far

(This list grows as you publish more posts)

### stale-api-call
- **Rule:** Always run template-optimizer BEFORE draft approval
- **Why:** Early feedback is cheaper than fixing code after review
- **Check:** Validate all imports/exports against current framework docs

### confidential-leak
- **Rule:** Automated keyword scan BEFORE draft approval
- **Why:** Prevent leakage before it happens
- **Check:** customer names, "roadmap", "internal", "confidential"

### missing-artifact
- **Rule:** Require explicit confirmation: all 7 artifact files exist
- **Why:** Artifact validation will catch missing files anyway (fail fast)
- **Check:** `ls -la .artifacts/blog/<slug>/` returns 7 files, none empty

### deploy-failure
- **Rule:** Verify npm ci + npm run build succeeds in public-repo/ BEFORE pushing
- **Why:** Catch build errors before Azure deploy
- **Check:** Post-export validation script runs build test

### metadata-mismatch
- **Rule:** Automate frontmatter updates in publish script
- **Why:** Manual edits prone to errors
- **Check:** status = published, publishDate = set

---

## Monthly Checklist (Using Blog Bot)

```bash
# 1. Check recent incidents
jq 'select(.timestamp > "2026-08-11")' .artifacts/incident-log.jsonl

# 2. Group by category
grep "\"category\"" .artifacts/incident-log.jsonl | \
  cut -d: -f2 | sort | uniq -c | sort -rn

# 3. Any critical items?
grep "\"severity\": \"critical\"" .artifacts/incident-log.jsonl

# 4. Verify published posts are live
curl -I https://zach.olinske.com/posts/<slug>/ # expect 200

# 5. Update prevention rules if patterns emerge
# (Edit .github/skills/blog-bot/SKILL.md)
```

---

## Quarterly Deep Dive

```
Analyze incident log for:
1. Which category is most common? (watch for trends)
2. Have we fixed the root cause, or just the symptom?
3. Are prevention rules working?
4. Should we restructure the workflow?
5. Any critical incidents we should prevent going forward?

Run @platform-enhancement-scout:
- Check for Astro updates
- Verify API examples still current
- Update code snippets if needed

Update Blog Bot instructions if workflow changed.
Commit changes to .github/skills/blog-bot/SKILL.md.
```

---

## Success Indicators

Blog Bot is working well when:

| Indicator | Target | How to Measure |
|-----------|--------|---|
| Posts published per month | 1–2 | Count published/ files |
| Time from backlog → live | < 1 week | Check git timestamps |
| Recurring errors | 0 | Query incident log by category |
| Recovery time | < 30 min | Measure time from error → rerun success |
| Artifact completeness | 100% | Run validate-agent-artifacts.mjs |
| Deployment success rate | 100% | Check Azure logs |

---

## Relationship to Old System

| Old blog-orchestrator | Blog Bot |
|---|---|
| ❌ No error tracking | ✅ Structured incident log |
| ❌ Same mistakes repeat | ✅ Prevention rules prevent repeats |
| ❌ Late validation | ✅ Early validation (API check before draft) |
| ❌ Manual recovery | ✅ Runbook-guided recovery |
| ❌ Deploy assumed | ✅ Deploy verified (URL, OG preview) |
| ❌ No pattern detection | ✅ Queryable log + trend analysis |

Blog Bot is a strict superset: everything old did, plus learning + recovery.

---

## Next Steps

1. **Read this file** (done!)
2. **Read quick-start** (`docs/blog-bot-quick-start.md`) — commands & workflows
3. **Read runbook** (`docs/blog-bot-runbook.md`) — error recovery procedures
4. **Try Blog Bot on next post** — `@blog-bot Publish BL-001`
5. **When errors occur, use Blog Bot to debug** — learn the system
6. **Monthly review** — check incident log for patterns
7. **Quarterly improvement** — adjust workflow based on data

---

## Key Insight

**Blog Bot doesn't write your blog. It ensures your blog publishes reliably.**

The specialist agents (@draft-writer, @fact-risk-reviewer, etc.) do the creative work.

Blog Bot does the orchestration, validation, and learning.

Together: **high-quality posts, reliably published, with zero toil.**

