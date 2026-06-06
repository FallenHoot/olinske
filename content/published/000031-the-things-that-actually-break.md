---
title: 'Chapter 3: The Things That Actually Break Real Systems'
description: >-
  A brutal look at what actually kills production reliability. Not theory. Not
  best practices. The specific failure modes that leave engineers explaining to
  executives at 2 AM.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - reliability
  - operations
status: published
---

*← [Chapter 2: Systems Fail According to Incentives](/posts/000019-systems-fail-according-to-incentives) | [Shared Responsibility Accountability →](/posts/000020-shared-responsibility-accountability-vacuum)*

---

Reliability books spend chapters describing what should happen. This one is different.

This chapter describes what actually happens. The gap between those two things kills more systems than any architectural flaw.

## The hard truths

### Availability and control-path failures

### 1. Identity failures can become system-wide outages

Not optional services. Everything.

When identity breaks in a critical path, large portions of the system can become unavailable to users and operators.

You cannot fix identity failure with workarounds. You cannot degrade gracefully. You cannot retry. The authentication layer is upstream of everything else.

**The trap:** Most teams invest in compute redundancy, database replication, multi-region failover. Then they route all identity through a single control-plane path to a third-party provider with an SLA, no failover, and a customer support queue.

**What happens in real incidents:**
- Your identity provider experiences a transient token issue
- Your caching layer misses the update
- For 7 minutes, every login fails globally
- Nobody can access anything
- You have no fallback

This pattern is not theoretical. It happens to enterprise scale systems regularly.

### 2. Latency is failure

Most teams distinguish between:
- Service up (good)
- Service down (bad)

They skip the middle: Service slow (worse).

When a service gets slow enough:
- Users retry
- Load increases
- System gets slower
- Retry storms start
- System collapses
- Now it looks like a crash

It started as latency.

**Why latency is worse than outage:**
- An outage is visible immediately
- Latency can look like normal variance until it is not
- Customers assume their connection is the problem, not the service
- Retry storms escalate the problem before you notice

**The common miss:** You monitor P99 latency at 500ms, feel fine, and do not notice that P99.9 is 30 seconds until the platform is cascading.

### 3. Partial failure is the norm, not the exception

You already know this intellectually. You do not internalize it operationally.

Assume that right now, in production:
- One dependency is 200ms slower than baseline
- One region sees higher error rates
- One thin critical path is more fragile than you think
- One monitoring blind spot exists
- One cache is stale

These are not failures. They are the default operating conditions of a complex system.

**The mistake:** Designing for the happy path and hoping the sad path never happens at scale. It will. It is.

### Detection and response failures

### 4. Monitoring fails when you need it most

The reality is brutal but true:

When the system is under extreme stress and you need observability most, your observability itself becomes unreliable.

**Why:**
- Monitoring traffic adds load during overload
- Telemetry systems become the bottleneck
- Dashboards become unreachable
- Logs are dropped because the logging system cannot keep up
- Alarms fire but you cannot query why

**What you have left:** Your runbooks, your heuristics, and the 30 lines of code you wrote 8 months ago that nobody remembers.

**Real incident pattern:** System starts degrading → you go to check dashboards → dashboards are slow → you cannot tell what is happening → you guess → you make it worse.

### 5. Humans slow down recovery

Every decision in an incident takes time:
- "Should we roll back?" (5 minutes)
- "Who can approve this?" (10 minutes)
- "Is this the right fix?" (15 minutes)
- "Are we sure we should do this?" (10 minutes)

In a high-stress incident, that is 40 minutes of delay for what feels like a fast response.

**The multiplier:** If multiple people need to coordinate, approval chains break, or ownership is unclear, you add hours.

**What you cannot see:** The mental overhead. During a bad incident, smart engineers make bad decisions. Not because they are not smart. Because their cognitive load is maxed.

**This is not soft skills. This is infrastructure.** If your decision-making process requires synchronous consensus during an incident, your incident response time is not 4 hours. It is 4 hours plus however long it takes to reach consensus.

Most teams do not have a documented decision cascade. "The VP will decide" is not a decision cascade during a 2 AM incident.

### 6. Failover is harder than you think

You have tested regional failover. Good.

You have not tested it:
- While your database is under replication load
- While your identity provider is degraded
- While your support channel is overloaded
- While you are under attack or cost pressure
- While your team is split between time zones
- While your team is tired from the previous incident

**The gap:** Lab tests look great. Production failover is messier. You have dependencies on the failing region you forgot about. Your DNS TTL was set to an hour. Your failover procedure assumes a component that is currently offline. Your backup is older than you thought.

**What actually happens:** Failover starts. You discover issues. You stop. You troubleshoot. You restart. 45 minutes in, you are still not fully over.

### Correctness and dependency failures

### 7. Data corruption is worse than downtime

A system that is down for 2 hours is a problem.

A system that silently corrupts data for 2 hours is a career-ending problem.

**Why teams miss this:**
- They focus on uptime metrics
- They assume databases maintain consistency
- They think transactions solve it
- They do not test recovery from partial writes

**Where it comes from:**
- Incomplete writes during failover
- Out-of-order events processed in wrong order
- Duplicate writes that should be idempotent but are not
- Cascading updates that leave data in inconsistent state
- Logical corruption that looks fine to infrastructure

**The consequence:** You restore the service quickly. You spend weeks validating that data is actually correct and untangling duplicates or reversals.

### 8. Dependency chains are longer than you think

You know you depend on a cloud provider. You also depend on:
- Your DNS provider
- Your CDN
- Your payment processor
- Your email provider
- Your identity provider
- Your logging platform
- Your monitoring platform
- Your incident communication tool

That is eight different SLAs and eight different failure modes. The combined availability is the product of all of them.

If each is 99.9%, the combined is 99.1%. You are one decimal place away from SLA breach before any of your code fails.

**What teams do:** Assume each SLA in isolation. Do not model the chain.

### 9. Capacity is a first-class failure domain

You can have perfect architecture and still hit a wall: quota exhaustion.

- Region capacity exhausted (cannot spawn new instances)
- Database connection pool exhausted (new requests queue, then timeout)
- DNS query rate limit hit (lookups fail)
- API rate limit hit (external service cuts you off)
- Disk quota hit (cannot write logs, cannot deploy)
- Network bandwidth limit (traffic shaped, service slowdown)

None of these are architecture failures. All of them will take your system down.

**The trap:** Most teams discover these during growth or after a major incident when load spikes. By then, it is too late.

### Economic and governance failures

### 10. Reliability work gets cut first

During budget cycles, reliability work gets cut because:
- It produces no visible feature
- The system is "working fine" right now
- The cost savings seem safe

Then an incident happens six months later that costs more than the annual reliability budget.

**The meta-problem:** Organizations are optimized to cut costs immediately and pay for incidents eventually. That is the incentive structure. No amount of reliability technology fixes misaligned incentives.

---

## What this means

You cannot engineer your way around these hard truths. You must:

1. **Accept that identity is critical infrastructure.** Do not route it through single points of failure. Have a fallback. Test it.

2. **Monitor latency, not just uptime.** P99.9 matters. Tail latencies are where failure hides.

3. **Design for partial failure as the default.** Not as an edge case. As the baseline operating condition.

4. **Do not trust your monitoring during incidents.** Have runbooks that work without dashboards. Have decision cascades that work without consensus.

5. **Document the decision chain before you need it.** Who decides during an incident? What is the escalation path? What is non-negotiable?

6. **Test failover under load.** Not in the lab. Inject real incidents and measure how long recovery actually takes.

7. **Validate data correctness.** Measure corruption indicators (duplicates, out-of-order, stale) alongside availability.

8. **Map the full dependency chain.** Calculate the combined availability. Plan what happens if one node fails.

9. **Treat capacity as architecture.** Not as an operations detail. Model it. Plan for it. Test it.

10. **Make reliability funding non-discretionary.** Tie it to risk, not to budget cycles. If you cut it, the risk goes up. Make that explicit.

---

## Chapter index

| Chapter | Topic |
|---|---|
| [Chapter 1](/posts/000017-reliability-is-an-economic-decision) | Opening thesis: reliability as economic decision |
| [Chapter 2](/posts/000019-systems-fail-according-to-incentives) | Incentives and organizational failure |
| **Chapter 3** | **The things that actually break** |
| [Chapter 4](/posts/000021-reliability-equation-financial-model) | The financial model |
| [Chapter 5](/posts/000022-provider-failures-status-pages) | Provider failures and status page reality |
| [Chapter 6](/posts/000023-partial-failure-control-plane-failures) | Partial failures and degraded-state design |
| [Chapter 7](/posts/000024-hidden-cost-reliability-tooling) | Hidden cost of observability tooling |
| [Chapter 8](/posts/000025-reliability-tradeoffs-on-call-finops) | Trade-offs: on-call, FinOps, and human cost |
| [Chapter 9](/posts/000026-reliability-governance-adr-ledger-indicators) | Governance system |
| [Chapter 10](/posts/000027-reliability-execution-quarterly-plan) | Execution and the next quarter |
| [Chapter 12](/posts/000029-reliability-pricing-saas-margin-trap) | Reliability pricing and the SaaS margin trap |
| [Appendix](/posts/000028-reliability-operating-artifacts-and-policy-templates) | Operating artifacts and policy templates |
| [Chapter 13](/posts/000030-reliability-maturity-organizational-adoption) | Maturity and organizational adoption |

---

*I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.*
