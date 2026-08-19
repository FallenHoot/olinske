# Blog Bot: What Changed (and Why)

## The Problem with blog-orchestrator (v1)

The old blog orchestrator mode had critical gaps:

### 1. **No Error Learning**
- When a post failed to publish, the failure was logged but never analyzed
- The same error would happen again next month
- No "prevention rule" — just reactive fixes
- **Result:** Toil and repeated mistakes

### 2. **No Incident Tracking**
- Failures lived only in console output
- No structured log to query: "How often does stale-api-call happen?"
- No way to find related past incidents
- **Result:** No visibility into patterns

### 3. **Validation Was Upstream of Draft**
- Template-optimizer ran AFTER draft was already approved
- If it found stale API calls, the draft was already locked
- Required re-drafting and re-gating (expensive rework)
- **Result:** Late-stage failures cost more to fix

### 4. **Confidentiality Relied on Human Spot-Check**
- Confidentiality review happened manually after draft
- Easy to miss red flags (customer names, roadmaps)
- No automated keyword scanning
- **Result:** Risk of confidential leakage

### 5. **Artifact Contract Was Loosely Enforced**
- The 7 required artifacts were "nice to have"
- Posts could publish with missing/empty files
- No strict validation script
- **Result:** Incomplete artifacts → deploy surprises

### 6. **Deploy Success Was Assumed**
- Script assumed: public repo push = live site
- No verification that Azure deploy succeeded
- No check that canonical URL returned 200 OK
- No OG preview validation
- **Result:** Posts published but not actually live

### 7. **No Rollback Procedure**
- If something went wrong post-publish, no clear recovery path
- Rolling back required manual git operations
- High risk of data loss or further corruption
- **Result:** Panic when things broke

### 8. **Mode Instructions Were Static**
- The blog-orchestrator mode had 14-stage workflow baked in
- If workflow changed, mode instructions had to be manually edited
- No way for agents to reference or update the workflow
- **Result:** Drift between intended + actual workflow

---

## How Blog Bot Fixes These Issues

### 1. **Error Learning Built In**
✅ **Solution:** Structured incident log at `.artifacts/incident-log.jsonl`
- Every failure captured: timestamp, slug, stage, error, root cause, resolution, **prevention rule**
- Blog Bot queries the log before each workflow step
- If similar past failure found, prevention rule is applied automatically
- Pattern analysis quarterly (which errors happen most? why?)
- **Benefit:** Zero repeated mistakes

### 2. **Incident Tracking & Querying**
✅ **Solution:** JSONL incident log with queryable schema
```bash
grep "stale-api-call" .artifacts/incident-log.jsonl  # All API failures
grep "\"severity\": \"high\"" .artifacts/incident-log.jsonl  # High-risk only
jq 'select(.category == "confidential-leak")' .artifacts/incident-log.jsonl  # All leaks
```
- Structured, machine-readable format
- Queryable by stage, category, severity, timestamp, slug
- Monthly dashboard: top failure categories
- **Benefit:** Visibility into patterns + data-driven process improvement

### 3. **Validation Moved Earlier**
✅ **Solution:** template-optimizer runs BEFORE draft approval, not after
- Code examples validated against current APIs DURING drafting
- Stale API calls caught early → cheap fix (edit snippet)
- No expensive re-drafting required
- Pipeline order: outline → template-validate → draft → gates (not: draft → template-validate)
- **Benefit:** Fast feedback loop, low rework

### 4. **Automated Confidentiality Scanning**
✅ **Solution:** confidentiality gate runs as early automated check
- Keyword scanning: customer names, "roadmap", "confidential", etc.
- Happens before draft approval
- Easy to generalize or remove problematic content
- Prevents leakage before it happens
- **Benefit:** Zero confidential posts published (confidence)

### 5. **Strict Artifact Validation**
✅ **Solution:** Non-negotiable artifact contract + validation script
- All 7 artifacts MUST exist and be non-empty
- Script `validate-agent-artifacts.mjs` enforces this
- Publish fails if any artifact is missing
- Clear error message: "Expected file not found: fact-risk-report.json"
- **Benefit:** Completeness guaranteed before deploy

### 6. **Deploy Verification**
✅ **Solution:** Post-publish verification steps
- Monitor Azure deployment status (poll pipeline)
- Verify canonical URL returns HTTP 200
- Check OG preview metadata
- Compare against prior git commit (detect unexpected changes)
- **Benefit:** Confidence that post is actually live

### 7. **Rollback Procedures Documented**
✅ **Solution:** Step-by-step runbook for every failure scenario
- Specific recovery for each category (stale-api, confidential-leak, deploy-failure, etc.)
- Clear rollback procedure: revert public repo commit
- Post-mortem template: why did it happen? how do we prevent it?
- **Benefit:** No panic; clear path from failure → recovery

### 8. **Workflow Ownership Decoupled**
✅ **Solution:** Blog Bot workflow lives in SKILL.md + runbook, not mode instructions
- Workflow is documented, not hard-coded
- Agents reference SKILL.md for current procedures
- Blog Bot mode is lightweight: just invoke the skill
- Workflow updates happen in SKILL.md (with version history)
- **Benefit:** Workflow can evolve without touching mode instructions

---

## Side-by-Side: blog-orchestrator vs. Blog Bot

| Aspect | blog-orchestrator (v1) | Blog Bot (v2) |
|--------|------------------------|--------------|
| **Error tracking** | Console logs (ephemeral) | Structured JSONL incident log |
| **Learning** | None; same errors repeat | Incident log → prevention rules → auto-apply |
| **Validation order** | Outline → draft → template-validate | Outline → template-validate → draft → gates |
| **Confidentiality** | Manual review after draft | Automated scan BEFORE draft approval |
| **Artifact enforcement** | "Nice to have" | Strict contract; publish fails if missing |
| **Deploy verification** | Assume success | Poll status, verify URL, check OG preview |
| **Rollback path** | Manual; risky | Step-by-step runbook for each scenario |
| **Workflow maintenance** | Hard-coded in mode | Documented in SKILL.md; versioned |
| **Debugging failed posts** | "Did it work?" | Incident log + runbook → root cause + fix |
| **Pattern detection** | Not possible | Queryable log → monthly dashboard |
| **Prevention rules** | Informal | Structured; checked before each gate |
| **Recovery time** | Hours (manual diagnosis) | Minutes (check log, follow runbook) |

---

## Impact: What Changes for You

### Before (blog-orchestrator)
```
1. Write post
2. Run through 14-stage workflow
3. Hit gate failure (e.g., "stale-api-call")
4. "Hmm, didn't we just fix this last month?"
5. Manually search email/Slack history
6. Remember: "Oh yes, we changed Astro.glob() to import.meta.glob()"
7. Fix the post
8. Rerun gates (expensive)
9. Publish (hope it works)
10. If deploy fails: "What went wrong? Let me check Azure logs..."
```

### After (Blog Bot)
```
1. Write post
2. Blog Bot automatically checks incident log for similar past issues
3. Blog Bot applies learned prevention rules proactively
4. Post passes gates faster (because we learned from past mistakes)
5. Publish succeeds
6. If something breaks: incident log immediately identifies root cause + solution
7. Follow runbook, fix in minutes
8. New incident logged → Blog Bot learns from this too
```

---

## Migration Path: How to Use Blog Bot

### Step 1: Don't Remove blog-orchestrator Yet
- It's still available if you want it
- Blog Bot and blog-orchestrator can coexist
- Your choice which to use per post

### Step 2: Start Using Blog Bot for the Next Post
```
@blog-bot
I want to write a post about X for audience Y.
Help me through the workflow.
```

### Step 3: When Something Breaks (Anytime)
```
@blog-bot
Debug this failure: [error message]
```

Blog Bot will:
1. Check incident log for related past failures
2. Suggest the prevention rule
3. Guide recovery steps
4. Help you log the incident (so it learns)

### Step 4: Monthly Review
```
@blog-bot
Show me recent incidents. Any patterns?
What prevention rules should we update?
```

### Step 5: Quarterly Deep Dive
```
@blog-bot
Analyze all incidents this quarter.
Which categories are most common?
Should we change the workflow?
```

---

## Key Principles

### Blog Bot Is
- ✅ Your co-pilot (automates validation, routing, recovery)
- ✅ Learning system (incident log → prevention rules → smarter workflows)
- ✅ Safety net (clear recovery path for every failure)
- ✅ Transparent (queryable incident log, documented runbooks)

### Blog Bot Is NOT
- ❌ Auto-publisher (you must explicitly approve)
- ❌ Magic bullet (still needs quality drafts, research, review)
- ❌ Replacement for judgment (you own the editorial decisions)
- ❌ Fire-and-forget (requires engagement with the workflow)

---

## FAQ

### Q: Will Blog Bot write my posts?
**A:** No. Blog Bot orchestrates the workflow: routing to specialist agents, running gates, validating quality. Specialist agents do the writing (draft-writer, etc.). You provide the direction and approve.

### Q: What if I disagree with a prevention rule?
**A:** Log a note in the incident explaining why. Quarterly review discussion with Zach. Workflow is yours to own and improve.

### Q: If a post fails to publish, how long to recover?
**A:** Depends on root cause. Check runbook (5-30 min typically). Previous version: hours of manual diagnosis.

### Q: Can I use Blog Bot for posts outside my blog?
**A:** Skill is project-specific. Blog Bot is designed for `c:\zachsBlog`. If you want to use it elsewhere, fork the SKILL.md + setup `.artifacts/incident-log.jsonl` in that project.

### Q: Who decides whether to roll back a published post?
**A:** You (Zach) decide. Blog Bot provides the procedure and impact assessment. No auto-rollback.

### Q: How often should I review the incident log?
**A:** Recommended: weekly (5 min scan), monthly (detailed analysis), quarterly (trend analysis + workflow updates).

---

## Next Steps

1. **Review this document** — understand the philosophy
2. **Read SKILL.md** — understand the workflow
3. **Read runbook** — understand error recovery
4. **Try Blog Bot on your next post** — get familiar with it
5. **When something breaks, use Blog Bot to debug** — see learning in action
6. **Monthly review of incident log** — spot trends
7. **Quarterly refinement** — adjust workflow based on data

Blog Bot gets smarter the more you use it.

**Welcome to the future of your blog.**

