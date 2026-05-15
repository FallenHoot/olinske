---
title: "Chapter 7d: Change – The Failure You Deploy Yourself"
description: "Most outages are not caused by infrastructure failures. They are caused by change: deployments, configuration updates, and operational decisions made under pressure. This chapter shows why change is the primary failure domain and how to design for safe change instead of hoping for perfect decisions."
publishDate: 2026-07-07
tags:
  - cloud-architecture
  - reliability
  - change-management
  - deployment
status: draft
---

*← [How You See (and Miss) Reality](/posts/000034-reliability-illusions) | [The Hidden Cost of Observability →](/posts/000024-hidden-cost-reliability-tooling)*

---

Your infrastructure is fine.

Your database is fine.

Your network is fine.

But you just deployed code at 2 PM on a Tuesday and now 30% of requests are timing out.

Change is the failure domain you deploy yourself.

Yet most teams treat deployment like a checkbox: "Did we deploy?" instead of "Did we deploy safely?"

## Why change is often the primary failure trigger

Across public reliability studies and many enterprise postmortems, change-related events are frequently the most common outage trigger, often cited in the 60-80% range depending on method and scope.

This does not mean infrastructure and dependency failures are irrelevant. It means change repeatedly acts as the initiating event in multi-factor incidents.

Specifically:
- Deployments (code, configuration, infrastructure)
- Rollbacks (reverse change under pressure)
- Migration (data, systems, traffic)
- Upgrades (dependencies, libraries, frameworks)

Each of these creates a window where the system is in a state it has never been in before.

In incident analysis, change is often the trigger, not always the deepest root cause. Incentives, architecture constraints, and operational readiness still determine blast radius.

## The failure modes of change

### Mode 1: The untested code path

You deployed code that works in your test environment.

It fails in production because:
- Production data is different (volume, distribution, edge cases)
- Production traffic pattern is different (concurrency, timing)
- Production infrastructure is different (latency, failure modes, resource constraints)

**The consequence:** You deployed a failure. It takes 20 minutes to detect. It takes 30 minutes to rollback. 50 minutes of degradation while users hit the broken path.

### Mode 2: Configuration drift

Your infrastructure is defined in code. But someone updated the configuration manually in the console (because the code change went through review and was slow).

Now you have:
- Infrastructure-as-code says X
- Reality says Y
- Deployment happens and "corrects" reality back to X
- Dependent services break because they relied on Y

**The consequence:** Change that should be routine triggers a cascade because you had hidden configuration.

### Mode 3: Rollback under pressure

You deployed bad code. Now you are in an incident. The pressure is high. You decide to rollback.

But:
- Rollback takes 15 minutes
- During rollback, requests queue up
- Rollback completes but queue is massive
- Database is overloaded
- Rollback fails partway through

Now you have a system in a partially-rolled-back state with a massively overloaded database.

**The consequence:** Your rollback created a worse failure than the original code.

### Mode 4: Coupling across deployment boundaries

You deploy Service A. Service B depends on an API contract you just changed.

The deployment order matters:
- If A deploys first: B's old code breaks against A's new API
- If B deploys second: you have a brief window where they are inconsistent
- If deployment fails partway: you are stuck in inconsistent state

**The consequence:** You have no safe deployment order. Every deployment is a risk.

### Mode 5: Data migration paralysis

You need to migrate data. But:
- Old code still reads old format
- New code expects new format
- During migration, some records are old, some are new
- Your code doesn't handle mixed formats

Options:
1. Deploy code that handles both formats first, then migrate data (slow)
2. Migrate data, then deploy code (window where new code sees old data)
3. Deploy everything together (window where old code sees new data)

There is no safe path. There is only "which failure mode do you prefer?"

### Mode 6: Dependency cascade

You upgraded a library. The library works fine in isolation.

But it interacts with another library in a way that was never tested together.

Or it changes timing behavior that exposed a race condition elsewhere in the system.

Or it changed how errors are handled and your error handling logic breaks.

**The consequence:** You tested the upgraded library. You did not test the upgraded system.

## What you should be doing (and probably are not)

### 1. Treat deployment as a failure domain

Ask these questions before every deployment:

- What is the rollback plan?
- How long does rollback take?
- What happens during rollback?
- What happens if rollback fails?
- Are there dependent services that also need to rollback?
- Can you rollback partially (one instance, one region)?

If you cannot answer these questions, you are not ready to deploy.

### 2. Test the deployment process, not just the code

You do:
- Unit tests
- Integration tests
- Load tests

You probably don't do:
- Deployment testing (actually run the deployment process, watch what happens)
- Rollback testing (actually run the rollback, confirm it works)
- Rollback under load (rollback while the system is handling traffic)
- Multi-service deployment (deploy when dependencies exist)

### 3. Design for safe deployment

This means:
- Feature flags (deploy code invisible, enable safely)
- Blue-green deployment (deploy to dark environment, switch traffic)
- Canary deployment (send 1% traffic first)
- Rolling deployment (one instance at a time, watch for errors)

Not all at once. But pick a strategy for each type of change.

### 4. Decouple deployment from enablement

Separate:
- **Deployment:** Getting code into production
- **Enablement:** Turning it on

Deploy the code. Run it dark (disabled). Monitor it. Then enable.

This removes the "deploy = change user experience" equation.

### 5. Explicit configuration management

Your configuration is code. It is versioned. It is reviewed. It is deployed through the same process as your application.

No manual updates to production. No drift. No surprises.

### 6. Explicit coupling documentation

For every external dependency, document:
- Does this service depend on me?
- What API version do they use?
- If I change my API, can they rollback independently?
- What is the safest deployment order?

Make coupling explicit before it becomes a deployment incident.

### 7. Runbook for "bad deployment"

You deployed bad code. Now what?

- Who decides to rollback? (not whoever is on-call, but who has authority)
- How long do we wait before deciding? (30 seconds? 5 minutes? 30 minutes?)
- Do we rollback one region first? One instance?
- What is the decision criteria? (error rate > X%, latency > Y?, customer complaints > Z?)

Write this down. Practice it. Refine it after incidents.

### 8. Measure change frequency vs stability

Track:
- Deployments per day
- Incidents per deployment
- Time from detection to rollback
- Success rate of deployments

Then ask: Are we deploying more and breaking more? Or are we deploying more but breaking less?

If it is the former, change is currently your dominant failure trigger. If it is the latter, you have designed for safer change.

## The uncomfortable truth

Most teams optimize for deployment frequency.

> "We deploy 50 times a day."

They do not optimize for deployment safety.

> "And we have one incident per day."

You cannot have both. You can optimize for frequent, safe deployment—but that requires:
- Excellent testing
- Good feature flags
- Disciplined change process
- Clear monitoring

Most teams pick one: frequent (and risky) or safe (and slow).

The teams that deploy frequently AND safely are the teams that built operational discipline into their deployment process.

## Time and change

When you deploy, the clock starts:

1. **Detection time:** How long before you know the deployment broke?
2. **Decision time:** How long before you decide to rollback?
3. **Rollback time:** How long does rollback take?
4. **Normalization time:** How long before the system recovers (queue clears, database settles)?

**Total outage = sum of these four.**

Most teams optimize the third (rollback time). They ignore the first two (detection, decision).

Yet detection + decision often takes longer than the actual rollback.

If detection takes 5 minutes and decision takes 3 minutes, your rollback is 2 minutes—but you have already been degraded for 8 minutes.

---

## Key architecture principle

**Change is one of the failure domains you control most directly.**

You cannot control hardware failures. You cannot always control external dependencies.

But you can control how change enters your system, how it is tested, and how you respond when it breaks.

That is where your reliability is actually built.

---

## Chapter index

| Chapter | Topic |
|---|---|
| [Chapter 1](/posts/000018-reliability-is-an-economic-decision) | Opening thesis: reliability as economic decision |
| [Chapter 2](/posts/000019-systems-fail-according-to-incentives) | Incentives and organizational failure |
| [Chapter 3](/posts/000031-the-things-that-actually-break) | The things that actually break |
| [Shared Responsibility](/posts/000020-shared-responsibility-accountability-vacuum) | Shared responsibility and accountability vacuum |
| [Chapter 4](/posts/000021-reliability-equation-financial-model) | The financial model |
| [Chapter 5](/posts/000022-provider-failures-status-pages) | Provider failures and status page reality |
| [Chapter 5 (Alt)](/posts/000032-identity-tier-zero-spof) | Identity – The System Kill Switch |
| [Chapter 6](/posts/000023-partial-failure-control-plane-failures) | Partial failures and degraded-state design |
| [Chapter 6 (Alt)](/posts/000033-silent-outages-data-corruption) | Silent outages and data corruption |
| **Chapter 7d (Alt)** | **Change – The Failure You Deploy Yourself** |
| [Chapter 7](/posts/000024-hidden-cost-reliability-tooling) | Hidden cost of observability tooling |
| [Chapter 7b (Alt)](/posts/000034-reliability-illusions) | How You See (and Miss) Reality |
| [Chapter 8](/posts/000025-reliability-tradeoffs-on-call-finops) | Trade-offs: on-call, FinOps, and human cost |
| [Chapter 9](/posts/000026-reliability-governance-adr-ledger-indicators) | Governance system |
| [Chapter 10](/posts/000027-reliability-execution-quarterly-plan) | Execution and the next quarter |
| [Chapter 12](/posts/000029-reliability-pricing-saas-margin-trap) | Reliability pricing and the SaaS margin trap |
| [Appendix](/posts/000028-reliability-operating-artifacts-and-policy-templates) | Operating artifacts and policy templates |
| [Chapter 13](/posts/000030-reliability-maturity-organizational-adoption) | Maturity and organizational adoption |

---

*I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.*
