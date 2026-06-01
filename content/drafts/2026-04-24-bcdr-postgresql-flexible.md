---
title: "BCDR for Azure PostgreSQL Flexible Server"
description: "PostgreSQL Flexible Server adds complexity to BCDR planning. Here are patterns and trade-offs for different reliability tiers."
publishDate: 2026-04-24
tags:
  - bcdr
  - postgresql
  - azure
  - database
status: draft
---

PostgreSQL Flexible Server on Azure is simple to deploy.

BCDR for it is not.

You have knobs: zone redundancy, read replicas, backup retention, cross-region replica.

You need to pick the right combination.

Most teams pick wrong.

Then either:

1. They overspend (zone redundancy + cross-region replicas + daily backups = overkill).
2. Or they underspend (single zone, 7-day backup, no replicas = lose data on zone failure).

## Why this matters

PostgreSQL is stateful.

Losing it is losing data.

BCDR patterns for PostgreSQL must account for:

- Zone failures (outage of 1-4 hours).
- Region failures (rare, but cascades everything in that region).
- Operational errors (backup, point-in-time recovery).

## Framework or model

Choose based on RPO/RTO:

| Tier | Zone Redundancy | Read Replica | Backup Window | Cost/month | Typical RTO | Typical RPO |
|------|-----------------|--------------|---------------|-----------|------------|-----------|
| **Dev** | No | No | 7 days | $200 | 6h | 1h |
| **Standard** | Yes | SamRegion | 35 days | $500 | 2h | <15min |
| **Premium** | Yes | CrossRegion | 35 days + point-in-time | $1500+ | <15min | <5min |

## Practical implementation

For production:

1. Use Flexible Server with zone redundancy (automatic failover within region).
2. Enable daily automated backups (35-day retention).
3. For critical workloads, add cross-region read replica.
4. Test restore procedures quarterly.

For development:

1. Single-zone basic tier.
2. 7-day backup retention.
3. No replicas needed.

## What to do this week

1. Classify your PostgreSQL databases (critical vs non-critical).
2. For critical: enable zone redundancy + cross-region replica.
3. For non-critical: enable single-zone with automated backup.
4. Update your runbook with disaster recovery procedures.

PostgreSQL BCDR is not complicated.
Done right, it is insurance against rare but expensive failures.

I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
