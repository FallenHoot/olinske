---
title: "Running LLMs on Kubernetes? Your Threat Model Is Missing Half the Attack Surface"
description: "Standard K8s security assumes deterministic workloads — LLMs are not. Prompt injection, model poisoning, and data exfiltration via tool calls create a threat surface that network policies don't address."
tags: [ai-strategy]
status: idea
source: "CNCF Blog (LLMs on Kubernetes: Understanding the threat model), Kubernetes Blog (Agent Sandbox)"
---

## Angle
Practical threat model for enterprise AKS deployments running inference workloads. Cover the gaps between standard K8s security controls and LLM-specific attack vectors.

## Why this fills a gap
Existing AKS drafts cover autoscaling and BCDR. No draft addresses the security model for running inference on AKS.
