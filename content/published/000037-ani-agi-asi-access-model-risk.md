---
title: 'The Risk Is Not the Prompt. It Is the Pattern.'
description: >-
  Enterprise AI risk is less about one prompt and more about identity-linked
  activity accumulating across tools, memory, and access boundaries.
publishDate: '2026-06-01'
tags:
  - ai-strategy
  - cloud-architecture
  - governance
  - security
status: published
---

Last week, I was in a conversation that started exactly the way these conversations always start. Someone said, "I do not share sensitive data with AI tools, so I am not worried." I used to say the same thing about search, where I asked ordinary questions, clicked through results, and moved on without thinking much about cumulative traces. That is the shape of the problem: not the platform, the pattern.

The real risk is not what you type into a model. The risk is potential identity-linked activity accumulated across systems where memory, connectors, and audit correlation are enabled. In practical terms, the failure mode is simple: identity plus memory plus cross-system data access plus weak trust boundaries.

That is why I still reference ANI, AGI, and ASI. Most production systems today are ANI-like for quick lookups, error checks, comparisons, and idea scaffolding. That capability level is already enough for this risk to materialize under the right system conditions.

This article focuses on cumulative inference risk. Active attack chains, such as prompt injection and tool exploitation, are related but distinct failure modes.

Inference risk model:

$$
Risk = f(\text{identity linkage}, \text{retention}, \text{connector breadth}, \text{trust boundary strength})
$$

## ANI is enough to create this risk

ANI is Artificial Narrow Intelligence, and most enterprise AI deployments still behave like ANI systems. AGI and ASI matter for capability debates, yet you do not need either to produce cross-project inference from ordinary activity. Stronger synthesis would raise speed and blast radius, not create this category of risk from scratch.

Most enterprises are operating in ANI-like conditions today. The mistake is assuming ANI-like means low consequence.

## Why this topic is bigger than one prompt

Here is the scenario I keep thinking about. Imagine I am on a confidential project called Project Save the Planet. I ask search and LLM tools practical questions: who else has used this stack, what teams learned from a similar migration, and what this specific error message means. My coworkers do the same thing from their side. Nobody posts a roadmap. Nobody pastes a full strategy document. Nobody tries to disclose the project. Each query is harmless by itself, yet when you zoom out across weeks, identities, coworkers, memory features, linked workspaces, and logs, the risk is no longer one prompt. The risk is cross-project inference from aggregate context.

## This is a known pattern, not a fringe theory

Different communities use different language, but they describe the same shape of risk. The mosaic effect describes how harmless fragments become sensitive when combined. Linkage and re-identification research shows that records that look anonymous can often be reconnected to real people when enough auxiliary signals exist. Inference attack literature in machine learning shows that systems can reveal more than users intended, even when direct disclosure is limited. Enterprise data fusion and entity resolution platforms are built on this exact principle: weak signals become strong conclusions when stitched together.

That is why this article is not saying, "the model read one secret file." The concern is cumulative inference across ordinary activity.

## Where we are now, honestly

Current enterprise LLM deployments are often stateless by default, and major enterprise/API offerings publish terms saying customer prompts are not used to train base models by default. Those controls matter.

The environments are not equal, and the risk profile changes by environment:

| Environment | Primary risk |
| --- | --- |
| Consumer AI | Platform-level profiling and broad external retention |
| Enterprise AI, properly configured | Internal over-permissioning and cross-context correlation |
| Hybrid or shadow usage | Data exfiltration and policy bypass across unmanaged boundaries |

The remaining risk is at the workflow layer:

1. Overscoped access and tool permissions.
2. Retention settings nobody reviewed.
3. Shadow use of consumer tools outside enterprise boundaries.
4. Shared context systems that quietly accumulate operational detail.

This is where many real incidents have historically started in analogous systems. A practical way to think about this is three layers:

1. Model layer: what the base model can and cannot do.
2. System layer: memory, retrieval, connectors, logs, and identity.
3. Organization layer: policy, behavior, and exception handling.

Most teams debate the model layer, while most failures happen in the system and organization layers.

The precise failure mode is this: identity plus memory plus cross-system data access plus weak trust boundaries.

In governance terms, this is primarily a system-layer problem, expressed through control plane decisions and data plane exposure, not a base model problem.

## What this is not

Enterprise copilots reading email or documents inside tenant boundaries is not the same as data exfiltration. Risk emerges when data moves across systems, connectors expand scope beyond intent, and retention links activity over time.

## Where the business is moving now

The shift is already underway. Field teams are no longer working only inside fixed SaaS screens. They are increasingly working through AI assistants, connectors, and tool calls that stitch many systems together in one workflow. That is why this is not only an AI safety conversation. It is an operating model conversation.

In practical terms, non-engineering roles now perform work that looks like light engineering: prompting, retrieval, API-backed actions, and workflow orchestration.

Security and data access have to move with that reality. The old question was, "who can view this data?" The new question is, "who can trigger which action, using which data, through which tool path, under which approval conditions?"

Organizations are not choosing between innovation and control. They are choosing between uncontrolled innovation and architected innovation.

## Why most AI guardrails fail

Most guardrails fail because they are applied at the wrong layer.

1. They are tool-centric instead of workflow-centric.
2. They block read and reasoning paths that users need for real work.
3. They ignore composition risk across connectors and systems.
4. They create enough friction that teams route around them.

This produces fake safety. Useful work is blocked, unsafe work moves into shadow workflows, and governance confidence drifts away from operational reality.

## What actually works

Enable thinking. Constrain movement.

1. Allow internal querying, summarization, and synthesis.
2. Constrain propagation, persistence, and outbound transmission.
3. Enforce identity-scoped context and least-privilege connector scope.
4. Gate high-impact writes and egress with policy and approvals.
5. Continuously monitor composition drift and context expansion.

If guardrails stop useful work, they will be bypassed. If guardrails allow unsafe work, they will be exposed. Architecture is the only path that scales trust and utility together.

## The MCP power and trap

Model Context Protocol has been a major improvement for practical AI work. It gives teams a clean way to connect assistants to real systems and backend API calls, which is exactly why it is moving so quickly into field workflows. In Azure and Microsoft-heavy environments, this same pattern often appears in Graph-backed connectors, Azure OpenAI function calling, Logic Apps or Functions orchestration, and Copilot connector/plugin paths. The same strength creates a new failure mode.

In simple terms, MCP allows one tool to call another tool using model output as input.

An MCP that looks safe on its own can become unsafe when paired with a second MCP that has different permissions or outputs. One connector can read sensitive internal context. Another connector can write, transmit, or transform data in ways nobody intended. Linked together, they can create unintended context paths if composition is not governed explicitly.

Most enterprise systems enforce identity-scoped access, so composition risk typically requires over-permissioning, misconfigured connectors, or untrusted content injection.

The risk is often less about one dangerous tool and more about dangerous combinations of otherwise reasonable tools.

In architecture terms, this is where trust boundaries fail:

1. Data plane: what can be read and retrieved.
2. Control plane: what can be executed, sent, updated, or approved.
3. Composition plane: how Tool A output becomes Tool B input.

When composition is weakly governed, retrieval paths quietly become execution paths.

## Attack preconditions matrix

Use this as a fast test for any agent or MCP workflow. Remove one precondition, and you usually break the attack chain.

If you prefer a checklist instead of theory, use this.

| Attack precondition | Typical example | Control move that breaks the chain |
| --- | --- | --- |
| Access to sensitive context | Agent can read internal docs, tickets, or customer data | Scope data by project and role. Deny broad cross-workspace reads by default. |
| Exposure to untrusted content | Agent ingests web pages, email, PDFs, issue comments | Route untrusted content through isolated processing. Block direct promotion into privileged context. |
| Outbound or state-changing capability | Agent can call external URLs, send messages, or write records | Require policy checks and approval gates before high-impact tool calls. |
| Cross-tool composition path | Tool A reads sensitive data and Tool B can transmit/transform it | Evaluate tool combinations, not only single tools. Default deny cross-MCP context sharing. |
| Persistent memory/retention | Long-lived memory links activity over time | Set retention TTLs, isolate memory by project, and purge on policy triggers. |

This is the operational test: if all preconditions are true in one workflow, treat it as high risk until explicitly validated and redesigned before release.

## One concrete mini-case

A field user asks an assistant to summarize a customer escalation report containing internal ticket IDs and workaround notes.

The PDF contains hidden instruction text. The assistant follows it and calls a second MCP-backed tool that can issue outbound queries.

The first tool reads internal customer notes. The second tool sends an HTTP request that includes extracted identifiers as query parameters.

Nobody pasted a roadmap. Nobody explicitly shared a secret. The leak came from tool composition and context linkage.

This chain is avoidable when teams block untrusted-to-privileged context promotion and require explicit approval for cross-MCP high-impact actions.

No novel model capability is required. Only ordinary workflow composition is required.

## Detection when prevention fails

Prevention controls are mandatory, and detection controls are what tell you where governance already drifted.

1. Detect anomalous cross-tool usage, especially new read-to-write or read-to-egress paths.
2. Alert on unusual cross-connector sequences for the same identity or workload.
3. Flag long prompt-to-action chains where low-risk prompts lead to high-impact actions.
4. Correlate metadata signals across logs to identify repeated cross-context reconstruction patterns.
5. Detect identity-linked context expansion across unrelated systems over time.

Example: a read-only system triggering outbound HTTP calls within the same prompt chain should be treated as high risk.

## The question behind AGI and ASI

I am not arguing that AGI has arrived. Today, many enterprise systems are constrained and often stateless by default. That reduces risk, but it does not remove risk.

The key question is what happens as systems get better at linking activity back to people, teams, and long-running work. A model does not need full AGI to build useful "notes on top of notes" through retrieval, memory, and graph-like correlation.

If you wait for AGI or ASI headlines before building control maturity, you are late. Capability growth changes the slope of risk, and governance lag determines the damage. That is the practical point.

## The leadership posture I recommend

Treat ANI as operationally powerful now, not harmless now.

Build controls that assume context accumulation is normal, with clear owners and review cadence:

| Control | Primary owner | Cadence | Evidence artifact |
| --- | --- | --- | --- |
| Prompt/data classification policy | Security and data governance | Quarterly, plus major tool changes | Approved classification matrix and exceptions log |
| Read/assist/execute permission split | Identity and platform engineering | Monthly access review | Role mapping and permission diff report |
| Delegated permission and token-scope review (Entra ID) | Identity engineering and security architecture | Monthly, plus before new connector release | App consent inventory, delegated scope diff, and break-glass approvals |
| Least-privilege short-lived credentials | Platform engineering | Monthly control validation | Credential TTL policy and token audit sample |
| Prompt-to-action decision trail logging | Security engineering | Weekly spot check, monthly audit | Trace logs linking prompt, context, tool call, and outcome |
| Approval gates for high-impact writes | Business owner and security | Per action, with monthly quality review | Approval records and denied-action analysis |
| Actual usage audit versus approved usage | Security operations | Monthly | Tool usage variance report |
| Cross-tool and cross-MCP composition review | Security architecture and app owners | Before release, then quarterly | Composition threat model and test results |
| Data plane versus control plane boundary checks | Platform architecture | Before release, then quarterly | Boundary diagram, blocked paths list, and exception approvals |
| Private endpoint and egress restriction validation | Platform and network engineering | Monthly, plus infra changes | Egress policy report and endpoint exposure diff |
| Purview and Defender signal review for AI workflows | Security operations and governance | Weekly triage, monthly trend review | Incident trends, false-positive review, and remediation log |
| Default-deny cross-MCP context sharing | Platform and architecture governance | Enforced continuously, reviewed monthly | Policy config baseline and exception approvals |

If your policy says one thing and employee behavior says another, behavior is your real architecture.

## Closing

I do not think this is a paranoid take. It is a sober read of a pattern we have already seen: harmless inputs become meaningful intelligence when systems can connect enough dots for long enough. We are still mostly in ANI, which does not mean we are safe by default. This is the best moment to get serious, before stronger synthesis arrives and your historical data becomes someone else's strategic map.

If this sounds abstract, run a simple exercise with your leadership team. Use a synthetic dataset first, or use fully redacted prompts that have passed legal and privacy review. Then ask what project narrative an analyst could reconstruct from metadata and question patterns across three adjacent roles.

Most organizations already have this risk. They usually cannot see it yet because it appears only when systems are composed.

If your access model is not designed for AI-driven workflows, it is likely misaligned.

The first organization to take this seriously will not prevent AI usage. It will define the safe architecture for it.

---

Disclaimer: I work at Microsoft. The views expressed here are my own and based only on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
