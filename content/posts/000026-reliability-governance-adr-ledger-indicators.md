---
title: "Chapter 9: Reliability Governance, ADRs, Debt, and Leading Indicators"
description: "Turns reliability from an aspiration into a governed system using tiering, ADRs, debt ledgers, review triggers, and leading indicators."
publishDate: 2026-06-19
tags:
  - cloud-architecture
  - reliability
  - governance
  - architecture
status: draft
---

If reliability is real, it has to be governable.

Good intentions are not enough. Teams need artifacts that preserve trade-offs, expose deferred risk, and make leadership confront the consequences of what was funded and what was not.

This chapter is the operating system chapter of the book.

![Reliability governance loop](/images/reliability/governance-system-loop.svg)

## Tiering is where governance starts

Every service should not receive the same reliability posture.

What matters is whether the business importance, resilience controls, and funding model match.

Tiering does that work. It forces the company to ask which products protect revenue, trust, operations, or only convenience, and then fund them accordingly.

## ADRs make the trade-off durable

Reliability-significant decisions should not live only in planning memory.

The practical rule is simple: extend the existing ADR system with reliability fields rather than inventing a parallel process.

If a service is 99.9% instead of 99.99%, someone should be able to explain:

- why that target was chosen
- what higher or lower targets were rejected
- what resilience premium was accepted
- what conditions should trigger a review later

If the team cannot do that in one page, the target is probably aspirational rather than governed.

## Reliability debt deserves its own ledger

Feature debt and security debt are often tracked explicitly. Reliability debt is usually remembered informally until an outage turns it into a board topic.

That is too late.

Deferred resilience work should be recorded with:

- description
- service tier
- amplified failure mode
- estimated outage cost if triggered
- estimated remediation cost
- named owner
- committed review quarter

Each debt item should also include:

- likelihood score from 1 to 5
- impact score from 1 to 5
- severity score = likelihood x impact
- escalation tier based on severity

That is how cost reduction stops looking risk-neutral when it is not.

When total Tier 1 debt severity rises for two consecutive monthly reviews, escalate funding and remediation decisions to the executive reliability forum.

## Leading indicators matter more than incident summaries

Lagging indicators describe what already happened. Leading indicators improve the odds that the next incident is smaller or avoided.

The most useful ones are usually:

- error budget burn rate
- change failure rate
- mean time to detect
- mean time to mitigate
- runbook freshness
- alert noise ratio
- simulation pass rate
- backup operator coverage

## Practical model

| Artifact | What it does |
|---|---|
| tiering table | connects business importance to funded controls |
| reliability ADR | records why the target exists |
| debt ledger | makes deferred risk visible |
| leading-indicator dashboard | surfaces drift before incidents compound |

## What to do this quarter

1. Refresh the service tier list.
2. Write one reliability ADR for the most consequential target in the estate.
3. Create the first five entries in a reliability debt ledger.
4. Review leading indicators monthly, not only incident summaries quarterly.

## Bottom line

Reliability becomes a system only when the organization can fund it, record it, revisit it, and measure whether it is drifting before production tells the truth.

## Chapter bridge

Chapter 10 closes the guide with a practical quarterly execution rhythm.