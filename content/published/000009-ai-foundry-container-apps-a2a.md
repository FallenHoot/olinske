---
title: 'Azure AI Foundry Agents + Container Apps: Building Scalable A2A Solutions'
description: >-
  Agent-to-Agent (A2A) patterns combine Azure AI Foundry agents with Container
  Apps for asynchronous, scalable multi-agent systems. Here is the reference
  architecture.
publishDate: '2026-05-25'
tags:
  - cloud-architecture
  - ai
  - agents
  - azure
status: published
---

Chaining agents synchronously works fine for a proof of concept.

It breaks down once agent work becomes slow, bursty, or failure-prone.

I use Agent-to-Agent (A2A) here as shorthand for asynchronous agent handoffs between specialized components that collaborate toward one workflow outcome. Queues are one transport mechanism in that model, but A2A is broader than queueing. It also includes agent role boundaries, shared state discipline, retry semantics, and decision ownership.

Azure AI Foundry Agent Service and Azure Container Apps are a strong fit for this pattern.

## Why this matters

Synchronous agent chains fail when:

- Agent B takes 30 seconds; your API caller times out.
- Agent C fails; the entire chain fails with it.
- Load spikes and all agents compete for the same compute.

Asynchronous handoffs address all three.

Agent A records intent, publishes work, and returns control. Agent B processes when capacity is available. Results are stored durably, and the caller polls, subscribes to status, or receives a notification later.

## What changed

Microsoft Foundry Agent Service now has clearer paths for single agents, workflow agents, and hosted agents.

Azure Container Apps supports both continuously running apps and event-driven jobs, with KEDA-based scaling from event sources like Azure Service Bus.

That combination creates a useful split:

- Foundry handles agent definition, conversations, tools, and managed runtime concerns.
- Service Bus handles temporal decoupling and load leveling.
- Container Apps handles custom worker compute and queue-driven scale.

It also introduces a helpful control-plane and data-plane split:

- **Control plane:** workflow intent, routing decisions, policy checks, and orchestration state.
- **Data plane:** actual worker execution, tool calls, message processing, and artifact generation.

Most production incidents happen at the boundary between these two planes.

## Why this architecture

This pattern is useful when you need more control than a synchronous agent call, but you do not want to run AKS.

It fits especially well when:

- One part of the system needs to respond quickly, but downstream work is slower.
- Work arrives in bursts and should scale with queue depth.
- You need custom code, libraries, or runtime control around the agent workflow.
- You want to separate the control plane from the execution plane.

It is not the only option.

If your process is mostly deterministic and can be modeled as repeatable orchestration with branching and approval steps, Foundry workflow agents might be enough. At the time of writing, workflow agents are still in preview, so that matters for production decisions. If you need custom code, queue-driven workers, or explicit compute control, Container Apps becomes more compelling.

## Framework or model

Reference architecture:

1. **Foundry Agent Service:** Define the agent, tools, and conversation behavior.
2. **Azure Service Bus queue or topic:** Use a queue for competing consumers and task distribution. Use a topic when multiple downstream processors need their own copy of the event.
3. **Azure Container Apps:** Run workers that process queued work. Use an app for continuously running queue processors. Use an event-driven job when each event should start a separate run-to-completion execution.
4. **State store:** Persist workflow state outside prompt memory. Azure Cosmos DB works well when you need low-latency state access, multitenant isolation, and flexible JSON storage. Blob storage works well for larger artifacts and reports.
5. **Observability:** Track queue depth, worker failures, retries, and end-to-end execution state.

One design rule matters more than the rest: queue messages should carry references and intent, not the entire working state. Persist the state separately and keep workers idempotent.

## Practical implementation

Example: cost optimization agent -> compliance agent -> reporting agent

1. A Foundry agent analyzes spend and writes a recommendation record to Cosmos DB.
2. It publishes a Service Bus message containing the recommendation ID and tenant or workflow metadata.
3. A Container Apps worker reads the message, loads the current state from Cosmos DB, validates the recommendation against policy, and writes the decision back.
4. If reporting is required, publish a second message to a reporting queue or topic.
5. A reporting worker generates the output and stores the artifact in Blob Storage.

This gives you three important properties:

- Independent scaling: analysis, compliance, and reporting do not need the same compute profile.
- Better failure isolation: a reporting failure does not need to block the original request path.
- Recoverability: a worker can retry from durable state instead of reconstructing context from prompts.

## Failure model

Treat queue-driven A2A as at-least-once delivery by default.

- **Idempotency:** every worker must handle duplicate deliveries safely.
- **Retry policy:** use bounded retries with backoff for transient failures.
- **Dead-letter queue (DLQ):** move poison messages to DLQ after retry limits and alert operators.
- **Compensation path:** define what to roll back or mark as failed when partial workflow steps succeed.

## What can go wrong

This pattern is better than synchronous chaining, but it is not free.

- **Duplicate delivery:** Service Bus and distributed workers require idempotent handlers. A retry must not create duplicate side effects.
- **State drift:** If messages carry stale payloads instead of references to durable state, downstream agents act on old information.
- **Queue design mistakes:** Queues distribute work to one consumer. Topics and subscriptions fan out work to multiple consumers. Choosing the wrong one changes the system behavior.
- **Overusing async:** Not every multi-agent workflow needs queues and workers. If the workflow is short, deterministic, and user-facing, synchronous orchestration or Foundry workflows may be simpler.
- **State-store design:** If you use Cosmos DB as the shared state layer, partition-key design matters. A bad partition choice creates hot partitions and expensive cross-partition queries.

## Trade-offs

- **Latency:** asynchronous handoffs improve resilience and throughput, but they add end-to-end latency compared with direct synchronous calls.
- **Complexity:** queues, retries, idempotency, DLQ handling, and state orchestration add operational and debugging overhead.

## What to do this week

1. Review your current multi-agent flow and mark which steps are slow, failure-prone, or bursty.
2. Decide which handoffs need a queue and which can stay synchronous.
3. For each async handoff, decide whether you need a queue or a topic.
4. Decide whether the worker should be a continuously running Container App or an event-driven Container Apps job.
5. Design the state store before designing the prompts. If you use Cosmos DB, choose the partition key from your access pattern first.

## References

- Microsoft Learn: What is Microsoft Foundry Agent Service?
- Microsoft Learn: Build with agents, conversations, and responses
- Microsoft Learn: Build a workflow in Microsoft Foundry
- Microsoft Learn: What is Azure Service Bus?
- Microsoft Learn: Service Bus queues, topics, and subscriptions
- Microsoft Learn: Set scaling rules in Azure Container Apps
- Microsoft Learn: Jobs in Azure Container Apps
- Microsoft Learn: Hierarchical partition keys in Azure Cosmos DB

Async systems are often more resilient and scalable.

They are only worth the added complexity when the workload actually needs decoupling, custom compute, or queue-driven scale.

I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
