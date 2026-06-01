---
title: "Distributing 70B-Parameter Models to 200 GPU Nodes Is a Solved Problem (If You Know Where to Look)"
description: "The bottleneck in enterprise AI isn't model quality — it's model logistics. P2P distribution via Dragonfly and Harbor+ModelPack cuts pull times from hours to minutes."
tags: [cloud-architecture]
status: idea
source: "CNCF Blog (P2P AI model distribution with Dragonfly, Harbor ModelPack)"
---

## Angle
Enterprise platform teams need to treat model weight distribution as first-class infrastructure. Cover the CNCF tooling landscape and AKS-specific patterns.

## Why this fills a gap
No existing draft covers the infrastructure side of running large models — the logistics of getting weights onto nodes at scale.
