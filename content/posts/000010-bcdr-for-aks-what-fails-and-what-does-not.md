---
title: "BCDR for AKS: What Fails and What Doesn't"
description: "Kubernetes BCDR is not the same as VM BCDR. Here are patterns that work across regions, zone failures, and cluster upgrades."
publishDate: 2026-05-23
tags:
  - cloud-architecture
  - kubernetes
  - aks
  - reliability
status: draft
---

AKS makes horizontal scaling easy.

It makes BCDR hard.

A zone failure in one region cascades differently than it would for VMs.

The pod that fails is quickly replaced by Kubernetes.
If that pod had local state, that state is lost.
If your database or backing service is also down, the replacement pod still fails.

Most AKS failures are not cluster failures. They are state failures.

## Why this matters

BCDR for AKS is layered:

- Pod level: Kubernetes automatically restarts (but local state is lost).
- Node level: Kubernetes reschedules pods to other nodes (but zone failure affects all nodes).
- Region level: Active-active or failover (but requires cross-region network and state sync).

AKS BCDR also splits into two planes:

- Control plane: API server and scheduling behavior.
- Data plane: nodes, pods, storage, and dependencies.

Control plane recovery does not guarantee data plane recovery.

Most teams only get the pod layer right.

## Framework or model

Use this BCDR matrix:

| Failure | Pod-only | Node-only | Zone | Region |
|---------|----------|-----------|------|--------|
| **Pod level** | Auto-restart | Auto-reschedule | Cascades | Cascades |
| **Node level** | - | Auto-drain | Need zone-aware | Need region failover |
| **Zone level** | - | - | Auto-balance (if multi-zone) | Cascades |
| **Region level** | - | - | - | Requires active-active or failover |

Most production workloads need zone + region coverage.

## Practical implementation

For multi-zone resilience:
- Deploy AKS cluster with Availability Zones (not just nodes in one zone).
- Use PodDisruptionBudgets to prevent all pods from being evicted.
- Use zone-redundant storage where supported, such as ZRS disks, Azure Files, or external PaaS databases designed for zone or region resilience.

For cross-region resilience:
- Active-active: Two AKS clusters, both serving traffic, same backing database.
- Failover: Primary cluster + standby cluster on standby, traffic manager switches on failure.

Cross-region resilience is primarily a data problem.
Compute failover is usually easier than keeping state consistent across regions.

Cluster upgrades should be treated like controlled failures.
If a workload cannot tolerate rolling disruption during upgrades, the BCDR design is incomplete.

## What to do this week

1. Check your AKS cluster: How many zones is it deployed to? (Where supported, target 3 zones.)
2. Check your storage: Is it ZRS or GZRS? (If not, fix it.)
3. Check your stateful workloads: Do they lose data if a pod is evicted?
4. Plan cross-region backup: Do you have a second AKS cluster or backup plan?

BCDR for Kubernetes is not harder than BCDR for VMs.
It just requires thinking about multiple layers at once.

I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
