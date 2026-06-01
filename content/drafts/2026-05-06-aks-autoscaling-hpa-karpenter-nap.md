---
title: "AKS Autoscaling: HPA vs Karpenter vs Node Auto-Provisioning"
description: "Kubernetes autoscaling has three options. Each works at a different layer. Choosing the right one (or combination) matters for cost and latency."
publishDate: 2026-05-06
tags:
  - kubernetes
  - aks
  - autoscaling
  - finops
status: draft
---

HPA scales pods.
Karpenter provisions nodes.
Node Auto-Provisioning (NAP) provisions node types.

Three layers, three different problems they solve.

Most teams pick one and wonder why it does not work.

## Why this matters

Pod demand increases.
HPA scales pods (replicas).
But if no nodes have capacity, HPA blocks.

Enter Karpenter: it provisions nodes when HPA-scaled pods need capacity.

But which node type?
Karpenter picks based on cost/performance.
NAP takes that further: it selects the optimal node SKU for your workload mix.

## Framework or model

| Layer | Tool | Solves | Cost | Latency |
|-------|------|--------|------|---------|
| **Pod** | HPA | Too few pod replicas | Low (scales fast) | 30-60s |
| **Node** | Karpenter | No node capacity for pods | Medium (rightsizes) | 2-5min |
| **Node Type** | NAP | Wrong node type for workload | High (optimizes SKU) | 5-10min |

Use all three together for best results:

1. HPA scales pods when CPU/memory spikes.
2. Karpenter provisions nodes when pods are pending.
3. NAP chooses cost-optimal node for the workload.

## Practical implementation

1. Enable HPA on deployments (metric: CPU >70%).
2. Install Karpenter (creates provisioner for auto-nodes).
3. Enable NAP (let GKE optimize node selection).
4. Monitor and adjust thresholds monthly.

## What to do this week

1. Check HPA configuration on your workloads (do you have it?).
2. If not, add it for your top 3 services.
3. Install Karpenter + NAP.
4. Test: Trigger load; observe autoscaling cascades.

Three layers of autoscaling give you granularity and cost optimization.

I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
