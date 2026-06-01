---
title: "Why Cloud Teams Should Shift to a Product-Centric Model"
description: "Function-centric cloud teams (database teams, network teams) create silos. Product-centric teams (delivery teams owning infrastructure) scale better and move faster."
publishDate: 2026-05-24
tags:
  - governance
  - operating-model
  - teams
  - leadership
status: draft
---

Most organizations structure cloud teams by function:

- Database team owns all databases.
- Network team owns all networking.
- Security team owns all security.

This is how traditional IT worked for 30 years.

Cloud breaks this model.

Functional silos slow delivery.

## Why this matters

Product-centric model:

- A delivery team owns end-to-end infrastructure for a service (database, API, security).
- The team makes decisions fast because they own consequences.
- Cross-functional knowledge grows (DevOps engineer knows networking, security, databases).
- Accountability is clear.

Functional model:

- Fast locally (the database team is very good at databases).
- Slow globally (every cross-function requires coordination).
- Blame passes between teams ("Database team is slow," "Network team is broken").

## Framework or model

Shift:

From: Database Team + Network Team + Security Team + DevOps Team

To: Product Team A (owns its infra) + Product Team B (owns its infra) + Shared Platform Team (enables all)

## Practical implementation

1. Start with one product team; give it full ownership of infrastructure.
2. Let it own its decisions for 6 months.
3. Measure: deployment velocity, incident response time, team velocity.
4. Compare to traditional function-centric team.
5. If better (and it usually is), expand the model.

## What to do this week

1. Audit your current organizational structure (function vs product centric).
2. Identify one product team that could own end-to-end infrastructure.
3. Draft an experiment: give them ownership for 6 months.

Product-centric scales.

Function-centric does not, at scale.

I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
