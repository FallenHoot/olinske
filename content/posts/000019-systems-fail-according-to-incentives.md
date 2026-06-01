---
title: "Chapter 2: Systems Fail According to Incentives"
description: "Shows why many outages begin in planning cycles, team goals, and ownership splits rather than in infrastructure itself."
publishDate: 2026-06-05
tags:
  - cloud-architecture
  - reliability
  - engineering-culture
  - governance
status: draft
---

Systems fail according to incentives.

That sentence sounds harsh until you spend enough time around real organizations. Then it starts to feel obvious.

Teams ship what the system rewards. If product leadership is measured on feature velocity, finance on cost takeout, platform on standardization, and engineering management on roadmap throughput, then reliability work becomes background labor unless someone with real authority protects it.

This is not usually malice. It is design.

![Incentive conflict matrix](/images/reliability/incentive-conflict-matrix.svg)

## Why outages often start in the org chart

The infrastructure trigger may be a timeout, a zone impairment, or a bad deployment. The earlier failure is usually one of these:

- the service was more critical than the funding model admitted
- the platform default ignored business criticality
- the product team never defined acceptable degraded modes
- the operations team inherited risk they did not have authority to reduce

The deepest outage root causes often sound organizational rather than technical for this reason.

## Reliability work loses in normal quarters

Roadmap work is visible. Reliability prevention is often invisible.

Shipping a feature produces immediate evidence of progress. Preventing an outage produces a non-event, which is much harder to defend in a quarterly review.

The trap is clear. The system rewards visible throughput until a failure forces everyone to remember the invisible work they deferred.

## Shared ownership without authority

Many organizations divide responsibility like this:

- product owns the customer journey
- platform owns the shared infrastructure
- engineering owns the service code
- operations owns the incident response

Each piece sounds reasonable. The problem is that nobody owns the full trade-off when cost, speed, and resilience collide.

At that point, the organization gets the worst of all worlds: distributed accountability and concentrated consequences.

## Promotion systems matter more than slogans

A leadership team can say reliability matters all year and still build a machine that rewards the opposite behavior.

The question is not what the organization says in architecture standards. The question is what gets recognized, promoted, and funded.

If the people who defer drills, shorten retention, and keep shipping still outperform the people who slow work to reduce risk, the organization has already chosen its reliability posture whether it admits it or not.

## How reliability programs fail politically

Reliability programs usually fail through predictable organizational behavior rather than explicit disagreement.

Common failure modes include:

- Tier inflation where every team argues Tier 1 criticality
- hidden telemetry cuts that reduce forensic value
- simulation theater where exercises run without measurable criteria
- ADR avoidance where consequential trade-offs are never recorded

A resilient program assumes these behaviors will appear and designs controls to detect them early.

## Practical model

| Function | Typical success metric | Reliability consequence when unbalanced |
|---|---|---|
| Product | features shipped | degraded modes undefined |
| Finance | spend reduced | resilience headroom removed |
| Platform | standardization | critical workloads flattened into one model |
| Engineering management | delivery velocity | preventive work deferred |
| Operations | incident response | asked to absorb risk too late |

## What to do this quarter

1. Pick one Tier 1 service and map the incentives around it.
2. Identify one decision where cost, speed, and reliability are clearly misaligned.
3. Ask who can actually veto a cheaper but riskier path.
4. Add one reliability question to every architecture or roadmap review.

## Bottom line

If the incentives reward speed more clearly than they reward survivability, the system will eventually tell the truth in production.

## Chapter bridge

Chapter 3 moves from incentives to ownership boundaries, where shared responsibility often creates accountability gaps.