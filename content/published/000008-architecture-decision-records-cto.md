---
title: "Why CTOs Need to Mandate Architecture Decision Records"
description: "Architecture Decision Records (ADRs) are not bureaucracy. They are the only scalable way to preserve context and prevent repeated mistakes as teams grow."
publishDate: 2026-04-12
tags:
  - engineering-culture
  - architecture
  - leadership
  - documentation
status: published
---

Every CTO has lived this:

"Why did we choose this database?"
"I don't know. Ask whoever built it. They left two years ago."

Or:

"Why can't we just use the new framework?"
"Because we decided not to last quarter. It was in the architecture AMA thread. Somewhere."

Architecture decisions are easy to make and hard to preserve.

Most teams do not preserve them at all. They keep them in meetings, in Slack threads, in the minds of people who eventually leave.

Then turnover happens. Context evaporates. The next team either blindly accepts a decision they do not understand, or blindly reverses it without knowing what it was protecting.

Michael Nygard described this problem back in 2011. His solution was simple: write it down in a structured format, keep it in source control, and never delete the old records. He called them Architecture Decision Records.

Fourteen years later, ADRs are endorsed by Microsoft's Well-Architected Framework, recommended in the Google Cloud Architecture Center, documented in AWS Prescriptive Guidance, and placed in ThoughtWorks' Adopt ring on the Technology Radar since 2017.

And most enterprise teams still do not use them.

## The real cost of undocumented decisions

Architecture decisions are not pure technical choices. Every significant decision contains business context.

Why we chose serverless over containers. That was a cost-versus-ops trade-off, made under a budget model that changed six months later. Why we used one database over another. That was a performance-versus-licensing decision at the time. Why we picked this auth pattern. That was a compliance requirement that may no longer apply.

That context is worth preserving because without it, teams make decisions in a vacuum.

They tend to either repeat the same decision (wasting weeks of analysis time) or reverse the decision without understanding the original constraints (introducing problems the original decision was designed to prevent).

I have watched both happen. The repeat-analysis pattern is more common and more insidious because nobody recognizes it as waste. A team spends three weeks evaluating a database choice that was already evaluated 18 months ago, under identical constraints, by people who are now on a different team.

## What the major cloud providers recommend

Each of the three major cloud providers has published guidance on ADRs. They agree on the fundamentals but emphasize different things.

**Microsoft's Well-Architected Framework** positions the ADR as "one of the most important deliverables of a solution architect." Their guidance emphasizes that an ADR should be an append-only log. You never go back and edit accepted records. If a decision changes, you write a new record that supersedes the original and link the two together. They also recommend recording your confidence level in each decision. Sometimes an architecturally significant decision is made with relatively low confidence, and documenting that status is useful for future reconsideration.

**Google Cloud's Architecture Center** frames ADRs around operational reliability. Their angle: ADRs help you troubleshoot when something breaks. If you understand why a regional GKE cluster was chosen over a zonal one, you can reason about failure modes during an incident instead of guessing. They recommend storing ADRs close to the codebase, either in the same repo or mirrored to an accessible wiki.

**ThoughtWorks' Technology Radar** placed "Lightweight Architecture Decision Records" in their Adopt ring in 2017 and kept it there through 2018. Their assessment: "For most projects, we see no reason why you wouldn't want to use this technique." They emphasize lightweight over comprehensive. ADRs should be short, stored in source control, and written in simple markup.

The common thread: keep it short, keep it close to the code, keep it immutable, and make sure future team members can find it.

## The format that actually works

Michael Nygard's original template has four sections and fits on one page. It has survived fourteen years because it is the right amount of structure.

**Title:** A short noun phrase. "ADR-001: PostgreSQL over Cosmos DB for transaction history."

**Context:** The forces at play. What was the problem? What constraints existed? Written in value-neutral language, facts not opinions.

**Decision:** What we chose. Written in active voice with full sentences. "We will use PostgreSQL Flexible Server with zone-redundant HA."

**Status:** Proposed, Accepted, Deprecated, or Superseded (with a link to the replacement).

**Consequences:** What became true after this decision. All consequences, positive, negative, and neutral. A decision that "has no downsides" was not analyzed carefully enough.

Microsoft's guidance adds two useful extensions:

First, **confidence level**. Sometimes you make a decision with high confidence (strong data, clear constraints). Sometimes you make it with low confidence (ambiguous requirements, incomplete data). Recording that distinction signals to future teams whether this decision was carefully validated or made under uncertainty and may deserve re-evaluation.

Second, **break multi-phase decisions into separate records**. If an architecture decision results in a short-term approach and a planned long-term migration, log each phase as its own ADR. This prevents the common failure where a "temporary" decision quietly becomes permanent because the long-term plan was never written down.

## Where ADR adoption fails

I have seen ADR initiatives fail in three ways.

**Failure 1: The ADR becomes a design document.** The record grows to five pages with diagrams, trade-off matrices, and benchmark results. Nobody reads it. Nobody updates it. It dies in a wiki. Microsoft's guidance is explicit here: "Avoid making decision records design guides. If more justification is available, provide a link to supplemental material, but the decision must be clear and stand alone."

**Failure 2: ADRs are written retroactively as compliance artifacts.** Someone decides the team needs ADRs for an audit. A junior engineer spends two weeks writing 40 ADRs for past decisions based on guesswork and git blame. The records have no real context because nobody remembers the actual forces that drove the decisions. Retroactive ADRs are still better than nothing, but they must be treated as approximations and labeled as such.

**Failure 3: No enforcement mechanism.** The CTO announces ADRs in an all-hands. Three teams adopt them. The rest ignore them. Six months later, the three teams stop because leadership never enforced the practice. ADRs require a gate. A PR review rule, a checklist item, a standing question in architecture review. Without a gate, they decay.

## Practical implementation

Start this week:

1. Create a `/docs/adr/` directory in your repo (or a dedicated `adr/` repo if you have many services).
2. Write ADR-001 for your most consequential recent architecture choice. The one that would be hardest to explain to a new hire.
3. Use the four-part template. Keep it to one page.
4. Add a PR review gate: any architecture change must include an ADR or reference an existing one.
5. Number sequentially. Never reuse numbers. Never delete old records.

Example:

```
# ADR-001: PostgreSQL Flexible Server over Cosmos DB

## Status
Accepted (2026-02-15)
Confidence: High

## Context
We need a database for customer transaction history.
Volume: 10M rows/month, growing 20% annually.
Consistency: strong required (financial data, regulatory).
Budget: $50k/month for data tier.
Team skill: strong SQL experience, limited NoSQL experience.

## Decision
We will use Azure PostgreSQL Flexible Server with zone-redundant HA
in the primary region and a read replica in the paired region.

## Consequences
+ Simpler tooling, mature ORM support, team already productive
+ ACID guarantees satisfy SOX compliance without additional engineering
+ Zone-redundant HA meets 99.99% SLA requirement
- Less horizontal write scaling than Cosmos DB
- Requires schema migrations (slower iteration than schemaless)
- Cross-region failover is manual (RPO up to 5 minutes)
```

That took three minutes to write. It will save hours the next time someone asks why we did not use Cosmos DB.

## Using AI to enforce ADR quality

The hardest part of ADRs is not writing the first five. It is keeping the standard consistent after that. Records drift. Engineers skip sections. Context shrinks to one sentence. Consequences disappear entirely.

AI can fix this at the PR gate.

When an engineer submits a new ADR or modifies an existing one, an AI review step can validate structure and completeness before the PR merges. The rules are simple and deterministic, which makes them a good fit for automated enforcement.

What the AI gate checks:

1. **Structure compliance.** Does the record have all four required sections (Context, Decision, Status, Consequences)? If someone submits a record with no Consequences section, the PR gets flagged.
2. **Context quality.** Is the Context section substantive? A single sentence like "We needed a database" is not context. The gate checks for minimum depth: constraints, requirements, and forces should be present.
3. **Consequence completeness.** Are there both positive and negative consequences? A record that lists only benefits is incomplete. The gate flags records with no trade-offs documented.
4. **Status validity.** Is the Status field one of the allowed values (Proposed, Accepted, Deprecated, Superseded)? If Superseded, does it link to the replacement record?
5. **Immutability.** Is someone editing an Accepted record instead of creating a new Superseded one? The gate can detect modifications to accepted records and redirect the author to create a new record instead.

When a check fails, the AI responds with the specific violation and a link to the team's ADR template and the Microsoft Well-Architected Framework ADR guidance. No guessing about what went wrong or what "good" looks like.

This is not theoretical. GitHub Actions, Azure DevOps pipelines, and Copilot-powered PR reviewers can all implement these checks today. The validation logic is straightforward because ADRs are structured text with predictable sections.

The result: every ADR that merges meets a minimum quality bar. New engineers learn the format from the feedback itself. The CTO does not have to personally review every record to keep the practice alive.

## The CTO's role

ADRs are a leadership practice, not an engineering chore.

The CTO decides that decisions must be recorded. The CTO enforces the gate. The CTO reads ADRs in architecture reviews and asks questions when they are missing.

The work of writing the ADR belongs to the engineer or architect making the decision. The accountability for the practice existing at all belongs to the CTO.

If your architecture is the accumulation of its decisions, then the ADR is the institutional memory of your engineering organization. Without it, every re-org, every acquisition, every wave of hiring resets the clock to zero.

Small effort. Lasting value.

---

**Disclaimer:** I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
