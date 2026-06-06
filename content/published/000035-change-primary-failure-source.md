---
title: 'Chapter 7: Change – The Failure You Deploy Yourself'
description: >-
  Most outages are not caused by infrastructure failures. They are caused by
  change: deployments, configuration updates, and operational decisions made
  under pressure. This chapter shows why change is the primary failure domain
  and how to design for safe change instead of hoping for perfect decisions.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - reliability
  - change-management
  - deployment
status: published
---

*← [How You See (and Miss) Reality](/posts/000034-reliability-illusions) | [The Hidden Cost of Observability →](/posts/000024-hidden-cost-reliability-tooling)*

---

Your infrastructure is fine.

Your database is fine.

Your network is fine.

Yet you just deployed code at 2 PM on a Tuesday and now 30% of requests are timing out.

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

However:
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
- Your code does not handle mixed formats

Options:
1. Deploy code that handles both formats first, then migrate data (slow)
2. Migrate data, then deploy code (window where new code sees old data)
3. Deploy everything together (window where old code sees new data)

There is no safe path. There is only "which failure mode do you prefer?"

### Mode 6: Dependency cascade

You upgraded a library. The library works fine in isolation.

However, it interacts with another library in a way that was never tested together.

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

You probably do not do:
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

## Safe Deployment Checklist: The Three-Phase Process

Do not deploy unless you have answers to all three phases. This checklist is meant to be run before every production deployment, regardless of size.

### PHASE 1: Pre-Deployment (Before You Deploy)

- [ ] **Deployment plan documented**
  - [ ] Service(s) being deployed
  - [ ] Version(s) deployed
  - [ ] Expected duration of deployment
  - [ ] Rollback duration and estimated impact
  - [ ] Who makes rollback decision?
  - [ ] Who executes the deployment?

- [ ] **Change tested in staging**
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] Smoke tests (basic functionality) pass
  - [ ] Load test passed (if significant code change)
  - [ ] Staging environment mirrors production (data, traffic, schema)

- [ ] **Dependencies identified**
  - [ ] What services depend on this one?
  - [ ] Have they been notified?
  - [ ] Can they rollback independently if needed?
  - [ ] API contracts are stable or backward-compatible?

- [ ] **Monitoring prepared**
  - [ ] Dashboard showing key metrics for this service exists
  - [ ] Error rate baseline established (e.g., normally 0.01%)
  - [ ] Latency baseline established (e.g., normally p99 < 200ms)
  - [ ] Alert configured: error rate > 2x baseline
  - [ ] Alert configured: latency > 3x baseline
  - [ ] Someone will watch dashboards during and 10 min after deployment

- [ ] **Communication plan**
  - [ ] Status page ready to update (if customer-facing)
  - [ ] Team chat channel ready (e.g., #incidents)
  - [ ] On-call escalation path documented
  - [ ] Customer support team notified of expected behavior

- [ ] **Rollback plan documented**
  - [ ] Rollback command is written and tested
  - [ ] Rollback time is estimated (not guessed)
  - [ ] Who can execute rollback? (list specific people)
  - [ ] Rollback thresholds defined (see below)
  - [ ] What happens to in-flight requests during rollback?
  - [ ] Will rollback cause data loss or inconsistency?

### PHASE 2: During Deployment

- [ ] **Deployment started at planned time**
  - [ ] Start time logged with date/time
  - [ ] Deployment method verified (blue-green? canary? rolling?)

- [ ] **Monitoring active**
  - [ ] Dashboards being watched
  - [ ] Alerts configured and armed
  - [ ] On-call engineer has pager ready

- [ ] **Traffic pattern normal**
  - [ ] No unusual traffic spike
  - [ ] No dependent service is also deploying
  - [ ] No known maintenance windows overlapping

- [ ] **One instance / canary first (if rolling/canary)**
  - [ ] First instance deployed
  - [ ] Wait 2 minutes and observe errors/latency
  - [ ] If errors spike: STOP, rollback single instance, investigate
  - [ ] If normal: continue to next batch

- [ ] **Deployment progression tracked**
  - [ ] Timestamp each batch deployed
  - [ ] Error rate checked after each batch
  - [ ] Latency checked after each batch
  - [ ] At-a-glance: "Are things breaking?"

- [ ] **No rollback threshold hit yet**
  - [ ] Error rate < baseline * 2
  - [ ] Latency < baseline * 3
  - [ ] No customer complaints yet
  - [ ] All systems appear normal

### PHASE 3: Post-Deployment (After Deployment Complete)

- [ ] **Deployment completed**
  - [ ] All instances updated (or all regions, all shards, etc.)
  - [ ] End time logged
  - [ ] Total deployment time recorded

- [ ] **Stability validation (Wait 10 minutes)**
  - [ ] Error rate normal (within 1.5x baseline)
  - [ ] Latency normal (within 1.5x baseline)
  - [ ] No alerts firing
  - [ ] Database queries performing normally
  - [ ] Cache hit rates normal
  - [ ] Logs clean (no unexpected warnings)

- [ ] **Dependent services verified**
  - [ ] If this service is an API: downstream calls succeeding?
  - [ ] If this service reads from another: data fetch succeeding?
  - [ ] No cascading errors appearing

- [ ] **Sample user workflows tested**
  - [ ] Log in (if auth-dependent)
  - [ ] Create an order (if payment-related)
  - [ ] Search (if search is affected)
  - [ ] Whatever the primary user journey is

- [ ] **Decision: Accept or Rollback?**
  - [ ] Everything looks good → Mark as successful, close incident
  - [ ] Something is wrong → Execute rollback immediately
  - [ ] Something is uncertain → Wait another 5 min and re-check
  - [ ] (Note: Do NOT leave system in uncertain state for > 15 min)

---

## Rollback Decision Matrix

Use this to decide: Should we rollback right now?

**Deployment age** (time since deployment started)

| Age | Error Rate | Latency | Action |
|---|---|---|---|
| **0-30 seconds** | Any spike | Any spike | Rollback immediately (too early to analyze) |
| **30 seconds - 2 min** | > 3x baseline | > 5x baseline | Likely rollback (but check: is it cascade?) |
| **30 seconds - 2 min** | 1.5x-3x baseline | 2-5x baseline | Investigate (1 min), decide |
| **2-5 minutes** | > 2x baseline | > 3x baseline | Rollback (we should know if deployment is bad by now) |
| **2-5 minutes** | < 2x baseline | < 3x baseline | Continue, do NOT rollback (most flaky deployments settle) |
| **5-10 minutes** | > 1.5x baseline | > 2x baseline | Rollback (if it was deployment, we know by now) |
| **5-10 minutes** | < 1.5x baseline | < 2x baseline | Accept deployment (if errors this late, likely not deployment) |
| **> 10 minutes** | Any change | Any change | NOT the deployment (other incident, not related to change) |

---

## Deployment Kill Switches

For any service, identify: What is the fastest way to disable this change if it is breaking?

### By Deployment Strategy:

**Blue-Green Deployment**
```
Kill switch: Flip traffic back to green
Speed: < 5 seconds
Risk: Zero (old code is still running)
```

**Canary Deployment**
```
Kill switch: Route 100% away from canary
Speed: 10-30 seconds
Risk: Very low (only canary affected)
```

**Rolling Deployment**
```
Kill switch: Rollback all instances from new version to old
Speed: 30 seconds - 5 minutes (depends on restart time)
Risk: Moderate (service is in flux during update)
```

**Feature Flag**
```
Kill switch: Disable the flag
Speed: < 1 second
Risk: Nearly zero (old code path still works)
```

### By Service Type:

**Stateless Service (API)**
- Kill switch: Instant restart or traffic reroute
- Speed: < 30 seconds

**Database Schema Change**
- Kill switch: Rollback script (must have one pre-written)
- Speed: 1-10 minutes (depends on table size)
- Risk: HIGH (schema rollback can fail)

**Message Queue Consumer**
- Kill switch: Stop consumer (drain queue with old version)
- Speed: < 1 minute
- Risk: Medium (messages queue, then resume)

**Async Job / Batch Process**
- Kill switch: Disable job, kill in-flight executions
- Speed: 1-30 minutes (depends on job duration)
- Risk: Medium (partial state may exist)

### Decision: Can I Rollback This Deployment?

Before you deploy, answer:

```
1. Do I have a rollback command tested and ready?     [ YES ] [ NO ]
2. Does rollback restore the prior version?           [ YES ] [ NO ]
3. Will rollback lose data?                           [ YES ] [ NO ]
4. Will rollback cause cascading failures?            [ YES ] [ NO ]
5. Rollback time < 5 minutes?                         [ YES ] [ NO ]

If 1-2: YES, 3-4: NO, 5: YES → Safe to deploy
If ANY other combination → DO NOT DEPLOY (or deploy to canary only)
```

---

## Deployment Patterns That Work (Grounded in Practice)

### Pattern 1: Feature Flag + Staged Rollout

**Deployment sequence:**
```
1. Deploy code (with feature disabled)
2. Wait 5 minutes (monitor for unexpected errors unrelated to feature)
3. Enable flag for internal employees (0.1% traffic)
4. Wait 5 minutes (monitor for feature-specific issues)
5. Enable flag for 1% of users (canary)
6. Wait 10 minutes (monitor for scale issues)
7. Enable for 50% of users
8. Wait 10 minutes
9. Enable for 100% of users
10. Remove feature flag code (in next deployment)
```

**Kill switch:** Disable flag at any step (< 1 second)

**Best for:** New features, API changes, algorithm changes, user-facing logic

### Pattern 2: Blue-Green Deployment

**Setup:**
```
- Blue environment: current production version
- Green environment: new version running
- Load balancer: routes traffic to Blue
```

**Deployment sequence:**
```
1. Deploy new version to Green environment
2. Run smoke tests against Green
3. If good: flip load balancer to Green
4. Monitor Green for 10 minutes
5. If good: keep Green as primary, clean up Blue for next deployment
```

**Kill switch:** Flip LB back to Blue (< 5 seconds)

**Best for:** Stateless services, container deployments, systems with significant changes

### Pattern 3: Rolling Deployment with Instance Health Checks

**Deployment sequence:**
```
1. Take instance 1 out of load balancer
2. Deploy to instance 1
3. Health check passes? → Put back in LB, move to instance 2
4. Health check fails? → Rollback instance 1, STOP deployment
5. Repeat for remaining instances
```

**Kill switch:** Stop adding instances, rollback all new instances

**Best for:** Services that handle distributed state, gradual capacity changes

### Pattern 4: Database Migrations + Safe Deployment

**The hard case:** You need to migrate data but keep both old and new code working.

**Sequence (takes longer, but safer):**
```
Phase 1: Deploy code that handles BOTH old and new formats
- Old code path: reads/writes old format
- New code path: reads/writes new format
- Compatibility layer: converts between them
- Run this version for 1-2 deployments (let it stabilize)

Phase 2: Migrate data (backfill old records to new format)
- Run migration during low-traffic window
- Verify new format readable
- Keep old format as fallback

Phase 3: Remove old code path
- Deploy code that ONLY uses new format
- Keep fallback to old format in monitoring (just in case)
- Run this version for 1 week

Phase 4: Remove fallback
- Delete old format handling code
- Remove migration scripts
- Confirm system stable
```

**Kill switch:** Rollback to Phase 1 (has both code paths)

**Total time:** 2-4 weeks (not 1 deployment)

---

## Detection: Deployment Metrics That Matter

Track these for every production deployment:

```
deployment.duration_seconds        # How long does it take?
deployment.error_rate_during       # Errors during deployment
deployment.rollback_rate           # % of deployments rolled back
deployment.successful              # (1 = success, 0 = rollback)
deployment.time_to_detection       # How fast did we know it was bad?
deployment.time_to_decision        # How fast did we decide?
deployment.time_to_rollback_start  # How fast did we start rollback?

# On-Call Experience
deployment.pager_events_during     # Alerts during deployment
deployment.incident_created        # Did this trigger an incident?
deployment.customer_impact         # Yes/No (if exposed customer-facing)

# Long-term Trends
deployments.per_day                # Velocity
incidents.per_deployment           # Quality
mean_time_between_deployments      # Stability
mean_time_to_recover_from_bad_deployment  # Incident response speed
```

Ask quarterly:
- Are we deploying safer? (incidents per deployment decreasing?)
- Are we deploying faster? (deployment duration decreasing?)
- Are our rollbacks working? (time to rollback decreasing?)

---

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

You can control how change enters your system, how it is tested, and how you respond when it breaks.

That is where your reliability is actually built.

---

## Chapter index

| Chapter | Topic |
|---|---|
| [Chapter 1](/posts/000017-reliability-is-an-economic-decision) | Opening thesis: reliability as economic decision |
| [Chapter 2](/posts/000019-systems-fail-according-to-incentives) | Incentives and organizational failure |
| [Chapter 3](/posts/000031-the-things-that-actually-break) | The things that actually break |
| [Shared Responsibility](/posts/000020-shared-responsibility-accountability-vacuum) | Shared responsibility and accountability vacuum |
| [Chapter 4](/posts/000021-reliability-equation-financial-model) | The financial model |
| [Chapter 5](/posts/000022-provider-failures-status-pages) | Provider failures and status page reality |
| [Chapter 5 (Alt)](/posts/000032-identity-tier-zero-spof) | Identity – The System Kill Switch |
| [Chapter 6](/posts/000023-partial-failure-control-plane-failures) | Partial failures and degraded-state design |
| [Chapter 6 (Alt)](/posts/000033-silent-outages-data-corruption) | Silent outages and data corruption |
| **Chapter 7b (Alt)** | **Change – The Failure You Deploy Yourself** |
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

