---
title: "BCDR for AKS: What Fails and What Doesn't"
publishDate: 2026-05-23
tags:
  - cloud-architecture
  - bcdr
  - kubernetes
type: blog-linkedin-share
linkedinPostId: "pending"
variant: medium
sourcePost: "content/posts/000010-bcdr-for-aks-what-fails-and-what-does-not.md"
canonicalUrl: "https://zach.olinske.com/posts/000010-bcdr-for-aks-what-fails-and-what-does-not"
hashtags:
  - AKS
  - Kubernetes
  - BCDR
---

A team told me Kubernetes handles failover automatically.

I asked what happens to stateful workloads during a zone failure.

They had not thought through that case.

AKS makes horizontal scaling straightforward. It makes BCDR complicated. Zone failure behavior for Kubernetes workloads is different from VMs in ways that catch teams off guard, especially when local state is involved.

The patterns that work at the cluster level do not always translate directly to workload recovery. There is a specific set of decisions around multi-region topology, upgrade strategy, and state management that determines whether your recovery actually holds.

I wrote about what fails, what holds, and why VM BCDR instincts can mislead you in Kubernetes environments.

Has your team tested AKS recovery across a real zone failure, or only against a scheduled maintenance window?
