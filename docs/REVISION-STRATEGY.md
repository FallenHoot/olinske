# Revision Strategy: Keeping the Guide Current

This document outlines how the Reliability Survival Guide will be maintained and revised as reliability practices, technology, and economic realities evolve.

---

## Philosophy

The book is **living documentation**, not a frozen artifact. Reliability evolves. Our frameworks should evolve with it.

**Principle:** Each chapter can be revised independently without cascading renumbering. Internal links always point to current version.

---

## Versioning Scheme

### Major Versions (Rare)
- `v1.0` → `v2.0`: Fundamental restructuring or complete rewrite of a chapter
- Triggers: Framework invalidation, major industry shift, significant new evidence
- Change: Chapter IDs may shift; canonical URLs maintained

### Minor Versions (Annual)
- `v1.0` → `v1.1`: Updates, corrections, clarifications within existing framework
- Triggers: New data, outdated statistics, clarifications needed, link corrections
- Change: No URL changes; content updates only

### Patch Versions (As-needed)
- `v1.1` → `v1.1.1`: Typos, formatting, broken links
- Triggers: Community feedback, discovered errors
- Change: Transparent updates with no URL impact

---

## Revision Cadence

### Immediate (Within 1 week)
- **Typos, broken links, formatting issues**
- **Critical factual errors**
- **Security/sensitive information exposure**

**Process:**
1. Fix in source markdown
2. Rebuild and deploy
3. Add note to CHANGELOG.md with date and fix description
4. No version bump for typos

### Monthly
- **Check for broken links (automated)**
- **Review comments/feedback from readers**
- **Verify statistics haven't been contradicted by new data**

**Process:**
1. Automated link checker runs
2. Open issues for broken references
3. Batch fixes into monthly update

### Quarterly
- **Deep review of each chapter's currency**
- **Check if frameworks still reflect reality**
- **Verify citations/references are still accurate**
- **Assess if new industry developments invalidate guidance**

**Process:**
1. Read each chapter in full
2. Compare against recent incident analyses (SRECon talks, O'Reilly publications)
3. Decide: Keep as-is, update data, or restructure
4. Release quarterly update with clear change log

### Annually (June)
- **Comprehensive audit before next major season**
- **Assess if full chapter rewrites needed**
- **Decide on new chapters vs. updates to existing**
- **Major version bump if frameworks changed significantly**

---

## What Gets Revised

### ✅ Update Immediately
- Broken links
- Incorrect statistics (if new data available)
- Factual errors (verified by multiple sources)
- Outdated tool references (if major version changes)
- Typos and grammar

### ✅ Update Quarterly
- Statistics that are trending (e.g., "60–80% of outages caused by change")
- References to time-bound events ("the 2024 GitHub outage" → "the incident showed...")
- Technology examples that became obsolete
- Clarifications on concepts readers struggled with

### ⚠️ Rarely Touch
- Core frameworks (incentive layer, reliability negotiation principle)
- Chapter narrative flow (unless fundamentally broken)
- Anchor principle and threading
- Historical examples that illustrate timeless truths

### ❌ Don't Change
- Chapter numbers (breaks all cross-references)
- Post slugs (breaks all external links)
- Fundamental principles (if they change, write new chapter instead)

---

## Change Management

### Before Making Changes

1. **Check dependencies:** Does this chapter feed into other chapters?
2. **Check citations:** Is this chapter cited elsewhere in the book?
3. **Check external links:** Are other sites linking to this?
4. **Assess scope:** Is this an update (v1.0 → v1.1) or rewrite (v1.0 → v2.0)?

### Implementing Changes

**For typos/links:**
- Direct fix
- Update CHANGELOG.md
- Rebuild and deploy

**For data/statistics:**
1. Note the change in chapter frontmatter: `lastUpdated: 2026-06-15`
2. Add revision note at top of chapter (or in CHANGELOG)
3. Link to source of new data
4. Rebuild and deploy

**For framework updates:**
1. Create new chapter instead (don't overwrite)
2. Link old chapter to new one with "See also: Updated Framework"
3. Maintain backward compatibility

### Communicating Changes

Every chapter should display:
```
Last updated: June 15, 2026
Changes: Updated 2024 outage statistics, added reference to X framework
```

Add to CHANGELOG.md:
```
## June 15, 2026 - v1.1.3
- Ch 4: Updated RTO/RPO statistics with 2025 incident data
- Ch 7: Added reference to new observability cost studies
- Ch 10: Fixed broken link to SRE metrics guide
```

---

## Framework Stability

### Principles That Don't Change
- "Reliability is continuously negotiated..." (anchor principle)
- Incentive layer analysis (why systems fail)
- Time as a governing dimension
- Economic trade-offs are unavoidable

If these become invalid, the entire book is wrong. In that case:
- Write a new book or major version
- Don't patch the current one

### Frameworks That Can Evolve
- Specific maturity phases (may compress/expand)
- Observability cost models (change as tech changes)
- Examples of failure modes (new types emerge)
- Operational practices (shift with industry)

---

## Community Feedback Integration

### Where Feedback Comes From
1. **Comments on blog posts** (if enabled)
2. **GitHub issues** (if repo is public)
3. **Email feedback** (hello@olinske.com)
4. **SRE community discussions** (Reddit, SRECon, etc.)
5. **Pull requests** (suggested improvements)

### How Feedback Is Processed

**Review cycle:** Monthly
1. Collect feedback
2. Validate factual accuracy
3. Assess scope (typo vs. framework issue)
4. Decide: Ignore / Fix now / Queue for quarterly review
5. Communicate decision to community

---

## Handling Corrections

### If We Were Wrong

1. **Acknowledge it immediately**
2. **Identify the error:** Was it factual, conceptual, or both?
3. **Correct the record:** Update the post
4. **Document it:** Note in CHANGELOG and in the post itself
5. **Learn from it:** Prevent similar errors

### Example Correction Note

> **Correction (June 2026):** An earlier version of this chapter stated that 
> "75% of outages are deployment-related." New data from 2025 suggests this 
> range is 60–80%. Updated to reflect broader evidence base.
> See: [Correction details](changelog#2026-06-15)

---

## Long-term Maintenance Plan

### Year 1 (2026)
- Monthly maintenance (broken links, typos)
- Quarterly reviews (data currency)
- Collect community feedback
- Establish patterns in what needs updating

### Year 2 (2027)
- Identify chapters that need significant updates
- Decide if major version bump needed
- Plan structural improvements

### Year 3+ (2028+)
- Assess whether book still reflects industry reality
- Decide: Continue maintenance, create v2.0, or archive

---

## Technical Implementation

### Version Control
- Every change commits to git with message explaining why
- CHANGELOG.md is source of truth for changes
- Post frontmatter includes `lastUpdated` date

### Automated Checks
- Link checker runs monthly
- Markdown linter runs on every commit
- Build verification (npm run build) passes

### Staging Workflow
- Draft changes in branch
- Review changes locally
- Rebuild and verify no breakage
- Merge to main
- Deploy

---

## Decision Flowchart

```
Change needed?
├── Typo/broken link?
│   └── Fix immediately, update CHANGELOG
│
├── Data/statistics outdated?
│   ├── More recent data available?
│   │   └── Update with source, queue for v1.1 release
│   └── No better data?
│       └── Leave as-is with caveat
│
├── Framework no longer works?
│   ├── Can update existing chapter?
│   │   └── Major version bump (v1.0 → v2.0)
│   └── Need new chapter?
│       └── Create new chapter, link from old one
│
└── Clarification needed?
    └── Add note/example without changing structure
```

---

## Success Metrics

The guide is maintained well if:
- ✅ No broken links persist for >1 month
- ✅ Statistics are updated within 6 months of becoming outdated
- ✅ Community feedback is acknowledged within 2 weeks
- ✅ Major frameworks remain stable (changes are rare)
- ✅ Readers trust the information as current

---

## Future Caretakers

If someone else takes over maintenance:

1. Read this document first
2. Understand that frameworks are sacred; data is not
3. Engage with community feedback respectfully
4. Err on the side of updating too much rather than too little
5. When in doubt, ask: "Would a reader in 2027 find this useful?"

---

**Last updated:** June 2026  
**Maintained by:** Zach Olinske  
**Community:** Open to feedback and corrections
