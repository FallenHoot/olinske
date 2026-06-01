---
title: "Azure AI Foundry Agents + Container Apps: Building Scalable A2A Solutions"
publishDate: 2026-05-20
tags:
  - ai-strategy
  - agents
  - architecture
type: blog-linkedin-share
linkedinPostId: "pending"
variant: medium
sourcePost: "content/posts/000009-ai-foundry-container-apps-a2a.md"
canonicalUrl: "https://zach.olinske.com/posts/000009-ai-foundry-container-apps-a2a"
hashtags:
  - AzureAI
  - AgentArchitecture
  - ContainerApps
---

The first multi-agent demo I saw worked perfectly.

Agents called each other in sequence, every step succeeded, and everyone was impressed.

Then someone asked: what if Agent 2 takes a long time?

The synchronous chain breaks. Everything waiting on Agent 2 is blocked. The whole system stalls.

Agent-to-Agent architecture is the pattern that fixes this. Agents queue work for each other instead of calling directly. Each agent processes independently. Results surface when ready.

Azure AI Foundry combined with Container Apps is a natural fit for this model. I put together the reference architecture, including how to handle failures and retries across agent boundaries.

Have you moved any multi-agent workloads from synchronous to async? What forced the change?
