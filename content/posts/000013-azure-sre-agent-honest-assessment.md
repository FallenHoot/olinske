---
title: "FinOps and SRE Belong Together. I Built the Bridge."
description: "Most FinOps teams are one person spending 20% of their time. They see the cost problems. They cannot fix them. Agentic AI can be the operations team they do not have. Here is what I built and what it means for lean and mature teams alike."
publishDate: 2026-06-03
tags:
  - cloud-architecture
  - ai-strategy
  - finops
  - azure
  - sre
status: draft
---

Most organizations treat FinOps and SRE as separate disciplines. FinOps watches the bill. SRE keeps things running. They report to different leaders, use different tools, and have different priorities.

That separation is the problem.

In my [last post](/posts/000012-spring-cleaning-cloud-finops), I wrote about the four hard questions mature customers need to ask about cloud cost. The questions that go past orphaned resources and into architecture, product, data, and organizational choices. Those questions surface real problems. They do not solve them. Someone still needs to act.

That is where most FinOps programs stall.

## You are not alone, but you might as well be

I talk to customers about FinOps and AI every week. The main issue is always the same: FinOps teams are lean. You are lucky if a single person spends 20% of their time on it. That is the norm. Even mature customers who staff five or more full-time FinOps resources hit the same wall. They can see the problems. They cannot fix them.

FinOps teams do not have the SRE skills, the monitoring access, or the ability to change the infrastructure as code. They flag a VM as oversized, file a ticket, and wait. SRE teams see performance data. They right-size resources for reliability, not cost. Nobody is looking at both signals at the same time.

I think of FinOps as Finance and Operations, not just cost control. The operations part means someone needs to actually change things in the environment. That someone is usually the SRE team, or should be.

The question is: what if you do not have an SRE team? What if the person doing FinOps 20% of the time is also the person expected to act on what they find?

That is where agentic AI changes the equation.

## How the idea started

A few weeks ago I was at a FinOps workshop at IBM Norway. Someone showed me [Cloudgeni's Infrastructure Agents Guide](https://github.com/Cloudgeni-ai/infrastructure-agents-guide). It was interesting because it covered a lot of the same ground that my coworker Hélder Pinto had built into the Microsoft FinOps Toolkit with the Azure Optimization Engine.

That workshop is where the idea clicked. The FinOps Toolkit already lets you talk to your FOCUS data using GitHub Copilot in Visual Studio. The optimization data is there. The intelligence is there. What is missing is the operations bridge: the agent that can take those insights and actually act on them without requiring a dedicated SRE team.

That is when I pitched the Azure SRE Agent platform as the bridge. Use the agent to combine FinOps intelligence with SRE operational authority. Give lean teams a force multiplier. Give mature teams a way to automate the repetitive analysis that burns out their best people.

## What agentic AI changes for FinOps teams

For lean teams (one person at 20%), an agentic AI workflow does what they cannot staff for:

- Queries Azure Monitor, Resource Graph, and Advisor APIs directly instead of waiting for batch exports
- Correlates cost signals with performance data in seconds, not days
- Validates whether a resize would actually work before recommending it
- Runs on a schedule without anyone clicking buttons or checking dashboards

The agent is not replacing the FinOps practitioner. It is giving them the SRE capabilities they do not have. The person who spends 20% of their time on cost now has an operations partner that runs continuously.

For mature teams (five or more people), the value is different. They already have the skills. They do not have the time. The agent handles the repetitive investigation so the team can focus on the architecture and product questions from post 045 that actually require human judgment. Which resilience decisions are real requirements. Which data movement is organizational dysfunction. Which workloads are politically protected. No agent answers those. The agent handles the compute rightsizing so the team has bandwidth for the hard conversations.

## What I built

I took the Azure Optimization Engine (AOE), an open-source project created by Hélder Pinto as part of the FinOps Toolkit, and ported its capabilities into the Azure SRE Agent platform.

AOE is excellent. It generates weekly infrastructure optimization recommendations using 35 PowerShell runbooks, a SQL database, and about 50 Azure resources. It has been a community standard for years.

I replaced that with YAML definitions and markdown knowledge base documents that an AI agent uses to perform the same analysis in real-time. About 200 lines of YAML instead of about 16,000 lines of PowerShell. Three Azure resources instead of fifty.

| Dimension | AOE | My SRE Agent subagents |
|---|---|---|
| Data collection | 22 PowerShell runbooks exporting to blob/LA | Agent queries APIs directly |
| Recommendation logic | 13 PowerShell runbooks with hardcoded rules | Subagent instructions + knowledge base |
| Infrastructure | ~50 Azure resources | 3 resources (App Insights, LA, Managed Identity) |
| Intelligence | Static arithmetic (P99, thresholds) | AI-powered pattern analysis |
| Output | SQL DB + Power BI | Email, Teams, ServiceNow, PagerDuty |

Hélder and I are both part of the FinOps Contributor team at Microsoft. I showed him this project first since I built directly on his work. He is the foundation. I am trying to take it to the next platform.

## How it works

The agent has six specialist subagents, each handling a different optimization domain:

- **Compute Optimization** scans VMs for rightsizing using a FitScore system that checks CPU, memory, network, disk IOPS, disk throughput, NIC count, and disk count against target SKU capabilities.
- **Storage Optimization** finds unattached disks, wrong disk tiers, and storage account misconfigurations.
- **Network Optimization** catches unused load balancers, orphaned public IPs, NICs, and NSGs.
- **PaaS Optimization** checks App Service Plan sizing and SQL DB tier efficiency.
- **Governance and Compliance** flags expiring credentials, outdated APIs, and non-cost Advisor recommendations.
- **Orchestrator** aggregates findings across all subagents and produces reports.

The FitScore is the core. It scores each VM from 0 to 5 based on whether a proposed resize would actually work, not just whether the CPU is underutilized. A resize that saves money but violates disk IOPS requirements or exceeds NIC limits gets flagged as unsafe. That validation is what makes this more than a cost dashboard.

The knowledge base includes workload pattern detection that AOE does not have. The agent can distinguish burst workloads from steady-state from batch jobs. A VM that spikes to 90% CPU for two hours every night and sits at 5% the rest of the day is not oversized. It is a batch workload. AOE would flag it. This agent adds headroom and reduces the FitScore instead.

## What the SRE Agent platform gets right

The platform solves a real problem. SRE teams spend too much time on repetitive investigation. The agent queries Azure Monitor, Log Analytics, Resource Graph, and Advisor APIs directly instead of waiting for batch exports. It correlates signals across sources in seconds.

The subagent architecture lets you build specialist agents with scoped permissions and independent schedules. My compute subagent runs daily. My governance subagent runs weekly. Each has its own YAML config, its own knowledge base, its own scope.

The two-mode trust model (Review mode where humans approve, Autonomous mode where pre-approved actions execute) is the right approach for getting operations teams to adopt without resistance.

## What the platform gets wrong

The manual click-ops. I have been actively talking with the product group about this. Setting up subagents requires portal clicks. Updating knowledge base documents requires portal clicks. If I need to fix something across five subagents and ten knowledge base files, that is a lot of clicking.

I need an API. I need to manage this with code, the same way I manage everything else in Azure. The product group knows. I hope it comes soon, because the current workflow does not scale.

The Anthropic sub-processor is a detail that security teams need to know about before onboarding. Some of the AI reasoning runs through Anthropic's models. For regulated enterprises, that changes the data processing agreement.

The preview limitations are real. Three regions for the control plane (Sweden Central, Australia East, US East 2). Allow-listing may be required. No production SLAs yet.

## Why I am open-sourcing it

I demoed this to the FinOps team at Microsoft. They wanted to go a different direction. I talked with several customers in Norway and two of them had already started building something similar independently.

I do not care about competition. My goal is to empower every customer on the planet to get the best ROI out of the cloud.

So I am making the repo public. The goal is not for people to use it as-is. The goal is for people to build on it. This is something you can do with SRE Agent. The subagent YAML, the knowledge base documents, the FitScore methodology, the Bicep deployment templates, all of it is available for anyone to take and adapt.

The repo is experimental. Use at your own risk. It connects to the Azure SRE Agent platform which is still in preview.

## The FinOps + SRE thesis

I call it FinSRE. A play on words, and a real shift.

Google pioneered Site Reliability Engineering to treat operations as a software problem. FinSRE is the evolution of that mindset applied to the cloud bill. If a standard SRE ensures a site does not crash, a FinSRE ensures the site does not financially crash the company.

The core idea: treat cost as a first-class reliability metric, just like latency or availability. In traditional SRE, you have an error budget (0.1% downtime allowed). In FinSRE, you have a cost budget. If a deployment spikes cloud costs by 40% without a proportional increase in revenue or users, that is a Service Level Objective violation.

| | Traditional SRE | FinSRE |
|---|---|---|
| Primary goal | System availability | Unit economic efficiency |
| Key metric | p99 latency, uptime | Cost per transaction, cost per request |
| Toil reduction | Automating manual deployments | Automating kill switches for runaway costs |
| Incident example | Site is down for 10 minutes | Spend is $10K over budget in 1 hour |

The industry is moving here whether it uses the name or not. The FinOps Foundation expanded their mission from "cloud cost" to "technology value" in early 2026. They published "FinOps Enabled Executive" describing a new archetype: the "COO for the CTO." That is an operations role, not a finance role. Rootly, an incident management platform, now treats cost spikes as critical incidents. Google's latest FinOps whitepaper focuses on unit economics: calculating exactly how much a single customer login costs in cloud compute.

SRE Weekly, the industry's most respected reliability newsletter, runs sponsors like Archera (commitment insurance) and Costory (cost correlation). Cost tools advertising to SRE audiences. The audiences are already blending. The tooling just has not caught up.

Nobody is calling it FinSRE yet. Nobody has claimed the term. The conversation is happening in fragments across FinOps blogs, SRE newsletters, and cloud provider whitepapers. The bridge exists in practice. It just does not have a name.

To be fair, the idea is not new. The roots go back to 2019 when J.R. Storment and Mike Fuller established the "Operate" phase in their book Cloud FinOps, which is where SRE principles first met financial management. Google's SRE workbooks introduced "Cost-Aware SRE" and started treating cost as an SLO. Engineers like Aditya Soni wrote early pieces arguing that cost is a proxy for efficiency,  making it a natural metric for SREs who already own the observability stack. Companies like Fidelity and FINRA showed that SRE teams are best equipped for cost anomaly detection because they already have the monitoring in place. What I am doing is giving it a name and building the tooling. The concept was inevitable. The implementation was not.

The Azure SRE Agent platform gives SRE teams a way to automate both operational and cost optimization work in the same pipeline. The same agent that investigates an incident can also scan for oversized VMs, question backup retention policies, and catch orphaned resources.

That is FinSRE. Not a new dashboard. Not another ticket. An agent that has both the reliability context and the cost context, and can act on what it finds.

## This week

1. Check out the repo: [github.com/FallenHoot/azure-sre-optimization-agent](https://github.com/FallenHoot/azure-sre-optimization-agent)
2. If you have Azure SRE Agent preview access, try deploying the compute optimization subagent. The Bicep template handles everything.
3. If you run FinOps and SRE as separate teams, ask yourself: who acts on the FinOps recommendations? If the answer is "it goes in a ticket queue", the gap is real.

FinOps without operations is just a dashboard. SRE without cost visibility is just firefighting. FinSRE treats cost as a reliability metric. That is what cloud operations should have been all along.

---

**Disclaimer:** I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
