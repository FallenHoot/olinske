---
title: 'Chapter 0: The First 24 Hours—Incident Triage and Immediate Response'
description: >-
  When your system is down. Crisis decision trees, role definitions, and the exact
  sequence that determines whether you recover in minutes or hours. Read this
  before your pager goes off.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - incident-response
  - operations
  - reliability
status: published
copyright: © 2026 Zach Olinski. All rights reserved.
licenseUrl: 'https://olinske.com/docs/COPYRIGHT.md'
attributionRequired: true
commercialUsePermitted: false
---

# Chapter 0: The First 24 Hours

## Incident Triage and Immediate Response

**Your system is failing. You have minutes, not hours, to make the right calls.**

This chapter is not theory. It is procedure. Read it now, before your pager goes off at 2 AM. Print Appendix A and laminate it.

**Note:** This chapter uses technical terms. See the [Glossary](/book/reliability-survival-guide/glossary-reliability-terms) for definitions of unfamiliar words.

---

## The Central Thesis

Incident response fails for one reason: teams skip triage and jump straight to finding the root cause.

Finding the root cause is important. But that is not what the first 10 minutes are for.

The first 10 minutes are for **stopping the bleeding**. Stop the immediate damage.

The next hour is for **understanding what happened**. Figure out what went wrong.

Everything after that is for **preventing it again**. Make sure it does not happen next time.

This chapter teaches the first 10 minutes.

> "In war, first reports are wrong, and delay is fatal. Triage first, explanation second."  
> Reliability lesson from WWII command practice: teams that classify the battlefield quickly can recover faster even with incomplete data.

---

## The Architecture of a Good Incident Response

Every incident follows the same sequence. The sequence never changes. Only the details change.

```
MINUTES 0-2:    TRIAGE (what is actually broken?)
MINUTES 2-10:   IMMEDIATE ACTION (stop the problem from spreading)
MINUTES 10-30:  STABILIZATION (get the system partially working)
MINUTES 30-60:  ROOT CAUSE HYPOTHESIS (why did this happen?)
HOUR 1-4:       FULL RECOVERY (everything working again)
HOUR 4+:        VALIDATION (is it actually safe?)
```

Teams that follow this sequence recover faster. Teams that skip to finding the root cause often make things worse.

> "The side that restores operational tempo first usually wins the day."  
> Reliability lesson from WWII and later coalition operations: speed of coordinated action matters more than perfect certainty in minute zero.

The sequence feels wrong when you are panicking. Your first instinct is to find the problem immediately. But fighting that instinct is the only way to recover fast.

---

## Part 1: The Triage Decision Tree (First 2 Minutes)

The decision tree below answers: **What kind of failure is this?**

Use it step-by-step. Ask yes/no questions. You make better decisions based on facts, not emotion.

**What does "cascade" mean?** When one service breaks, it causes other services to break, which breaks more services. Like dominoes falling. [See Glossary: Cascade](/book/reliability-survival-guide/glossary-reliability-terms#c)

```
┌─────────────────────────────────────────────────────────┐
│ YOUR SYSTEM IS DOWN: FOLLOW THIS TREE (2 MINUTES)       │
└─────────────────────────────────────────────────────────┘

QUESTION 1: Is the problem visible?
├─ Can you see dashboards/metrics? 
│  ├─ NO → MONITORING IS DOWN
│  │   └─ Escalate immediately (Chapter 11, escalation criteria)
│  │   └─ Cannot triage without visibility
│  │   └─ Page infrastructure lead + monitoring oncall
│  │
│  └─ YES → Continue to Question 2

QUESTION 2: What is the geographic scope?
├─ Are ALL regions/zones affected?
│  ├─ YES → PROVIDER REGIONAL EVENT (or fundamental control-plane)
│  │   └─ Go to "Provider Event Triage" (below)
│  │   └─ Escalate immediately
│  │
│  └─ NO → Single region/zone or single service affected
│     └─ Go to Question 3

QUESTION 3: Did you deploy something in the last 5 minutes?
├─ YES → DEPLOYMENT FAILURE (likely)
│  └─ Go to "Deployment Triage" (below)
│  └─ Page the deployer's team lead
│
└─ NO → Continue to Question 4

QUESTION 4: What is the visible symptom?
├─ "Error rate spiking" / "Timeouts"
│  ├─ Is one service down (dependent services error)?
│  │  ├─ YES → Dependency failure
│  │  │   └─ Go to "Dependency Triage" (below)
│  │  │   └─ Page the failed service's team lead
│  │  │
│  │  └─ NO → Cascade failure
│  │     └─ Go to "Cascade Failure Triage" (below)
│  │     └─ Escalate immediately, multiple team leads
│  │
│  ├─ "Latency increasing"
│  │  └─ Go to "Latency Triage" (below)
│  │  └─ Likely database or queue saturation
│  │
│  ├─ "No traffic getting through"
│  │  ├─ Did we deploy? → Rollback decision
│  │  └─ Recent changes to traffic routing/LB? → Undo
│  │
│  └─ "Data looks wrong"
│     └─ GO DO NOT ROLLBACK YET (Chapter 6)
│     └─ Go to "Silent Failure Triage" (below)
│     └─ Page database team, escalate before any remediation
```

### Provider Event Triage

Your cloud provider (AWS, Azure, GCP) is having an outage.

Quick questions:
1. Is your system actually down, or is the provider just slow?
   - Provider status page says "everything is fine" but you are down? → Your problem, not theirs
   - Provider status page confirms incident? → Wait or switch to backup

2. Do you have a backup in another region? (Cross-region failover means traffic switches to a backup automatically)
   - YES → Switch to backup NOW (decision takes < 5 minutes)
   - NO → Wait for provider to fix it

3. How long until the provider says it will be fixed?
   - < 10 minutes → Wait
   - > 10 minutes → Switch to backup or reduced mode
   - Unknown → Assume 30 minutes, start switching to backup

### Deployment Triage

You deployed new code in the last 5 minutes and the system broke.

**What does "canary" mean?** A small test. You send new code to 1% of users first, then 10%, then 100%. If something breaks, only 1% of users see it.

Quick questions:
1. How long did the deploy take?
   - < 2 minutes → Probably safe, keep watching
   - 2-5 minutes → Watch carefully
   - > 5 minutes → Something is stuck, check deployment logs

2. Did the system break immediately or did it get worse slowly?
   - Immediately after deploy (< 1 second) → Rollback immediately
   - Gradually (1-5 minutes after) → Could be related, consider rollback
   - Hours later → Probably not related to this deploy

3. Are you running a canary (new code on only some servers)?
   - YES → Route users away from the new servers
   - NO → Rollback all servers to the old version

Decision:
- System is broken because of this deploy? → Rollback (undo the deploy)
- Not sure if this deploy caused it? → Watch for 2 minutes, then rollback if it gets worse
- System is stable? → Keep the new code, investigate elsewhere

### Dependency Triage

```
One service is down or unhealthy.

Identify the dependency:
1. Which service is erroring?
2. Is it a known critical dependency?
   - Auth / Identity → Chapter 5, escalate immediately
   - Database → Chapter 6, escalate immediately
   - Cache → Can degrade (fall back to DB), monitor
   - Queue → Can degrade (queue locally), monitor

Action:
├─ Can the dependency be restarted?
│  ├─ Restart time < 30 seconds → Restart, monitor
│  ├─ Restart time > 30 seconds → Failover if available
│
├─ Is this a known issue?
│  └─ Check runbook: scripts/runbooks/[service-name].md
│
└─ Is it a provider issue?
   └─ Check provider status page
   └─ Escalate if provider confirmed
```

### Cascade Failure Triage

```
Multiple services are failing, hard to see which started it.

IMMEDIATE ACTION (first 2 minutes):
1. Stop looking for root cause. Stop that.
2. Instead: Identify the lowest-level service that started failing.
   - Check deployment times (which was deployed first?)
   - Check error rates (which has highest error rate?)
   - Check timestamps (which started failing first?)

3. Once identified: apply dependency triage to that service

RULE FOR CASCADE FAILURES:
Always fix from the lowest level upward. Do not try to fix the top of the cascade.

Example:
- API → Failing
- API depends on: Queue
- Queue → Failing
- Queue depends on: Network

Fix network first, then queue, then API. Do not fix API.
```

### Latency Triage

```
Everything is responding, but slowly.

Quick questions:
1. Is latency database latency?
   - Check: SELECT query latency increasing? → Database issue
   - Fix: Restart slow queries, add index, scale DB
   - Go to: Chapter 6 (silent failures) and Chapter 7b (partial failures)

2. Is latency queue latency?
   - Check: Messages backing up? → Queue issue
   - Fix: Scale queue consumers, increase partition count
   - Go to: Chapter 5

3. Is latency network latency?
   - Check: All calls slow (not just one service)?
   - Check: Regional breakdown (one region slow?)
   - Go to: Provider event triage, network team

4. Is this cascading from one slow service?
   - Check: Callers timing out waiting for slow service?
   - Fix: Either speed up the service or circuit-break it
   - Go to: Chapter 7b (partial failures)

ACTION:
├─ Immediate: Kill slow queries, drain queues, restart slow services
├─ 5 minutes: Assess if this is cascading (route around it)
└─ 30 minutes: Fix root cause
```

### Silent Failure Triage (Data Corruption)

Your system is responding. But data looks wrong.

**STOP.** Do not rollback yet. Data corruption requires careful handling.

**What does "replication lag" mean?** Your backup database is slightly behind the main database. Changes take a few seconds to copy over.

Quick questions:
1. When did this start?
   - Right after a deployment? → The new code changed data incorrectly
   - Slowly over hours? → Changes were not copied to backups (replication lag)
   - Discovered now, but old data? → How long ago did this start?

2. How much data is affected?
   - A few records (< 100)? → Can be fixed manually
   - Many records (> 1000)? → Need management approval before fixing

3. Can you safely rollback (undo the deploy) without losing good data that was written after the corruption?
   - YES → Rollback is an option
   - NO → Do not rollback

Decision:
- Rollback is safe? → Still check with the data team first
- Rollback is not safe? → Go to Chapter 6 (Silent Outages)
- Not sure? → Call management before doing anything

What to do NOW:
- Stop the bad data from spreading (stop writing)
- Measure how much data is affected (scope)
- Call the data team (do not fix this alone)
- Plan recovery (fix the data, do not just undo)

---

## Part 2: Immediate Actions (Minutes 2-10)

Once you have classified the failure, take immediate action. Do not investigate further. Do not wait for root cause.

### Action 1: Establish Command & Control (Minute 2)

Declare an incident. This triggers the response machinery.

```
Pagerduty / Incident platform:
├─ Create incident: [brief description of triage result]
├─ Set severity: Critical (customer impacted) or Warning (no customer impact yet)
├─ Assign Incident Commander (senior engineer who can make decisions)
├─ Assign Communications Lead (notifies status page and customers)
└─ Assign Tech Lead (executes the response)

If unsure about severity: declare Critical. Downgrade later if needed.
```

### Action 2: Stop the Failure from Spreading (Minutes 3-5)

If you identified a failing dependency, stop using it to prevent more failures.

**What does "circuit-break" mean?** When a library is broken, stop checking it out to everyone. Give your users something else instead. Prevents one broken piece from breaking everything.

What to do (in order):

1. Can you stop using the broken service?
   - YES → Stop using it immediately
   - NO → Go to step 2

2. Can you serve users with reduced features (degraded mode)?
   - Example: Use cached data instead of real-time data
   - Example: Show "Service Temporarily Unavailable" instead of crashing
   - YES → Switch to degraded mode
   - NO → Go to step 3

3. Can you restart the broken service?
   - YES → Restart it
   - NO → Switch to backup if you have one

4. If none of the above work: Accept that you are down. Escalate. Tell customers when you expect recovery.

### Action 3: Communicate Immediately (Minute 5)

Status page update. **Not** "we are investigating." **Not** "we do not know yet."

```
Template:
"We are aware of reports of [symptom]. Our team is triage and [specific action: restarting X / rolling back Y / failing over to Z]. Estimated time to restoration: [honest estimate or 'unknown']. More updates every [5 min / 10 min]."

Timing:
- First update: Before minute 5
- Follow-up updates: Every 5 minutes if unresolved, every 10 if recovering
- Under-promise, over-deliver on timing

Do NOT:
- Say "we fixed it" until it is actually fixed
- Explain root cause until you understand it
- Predict recovery until you have made progress
```

### Action 4: Execute the Immediate Fix (Minute 5-10)

Based on your triage:

```
If deployment:
├─ Rollback deployment? (use decision matrix in Chapter 7b)
└─ Monitor error rate for 3 minutes post-rollback

If dependency failed:
├─ Restart it?
├─ Failover to replica?
└─ Circuit break, route around?

If cascade failure:
├─ Identify lowest-level failing service
└─ Restart/rollback that service first

If latency:
├─ Kill slow queries (do not wait for completion)
├─ Drain the queue (process locally if needed)
└─ Restart the slow service

If data corruption:
├─ Isolate corrupted data
├─ Stop writing to corrupted table
└─ Do NOT rollback without authorization
```

---

## Part 3: Incident Roles (Who Decides What?)

The following roles exist for one reason: **clarity under pressure**.

Without clarity, teams second-guess each other. Decisions slow down. Recovery takes longer.

**Role assignments are not permanent positions. They are assigned per-incident.**

### The Incident Commander

**Authority:** Final decision on major actions (rollback, failover, declare "all clear")

**Responsibilities:**
- Calls the triage decision
- Decides between rollback vs. fix-forward
- Escalates when needed
- Declares the incident resolved

**What they need:**
- Full visibility into customer impact
- Tech lead's assessment of what is happening
- Comms lead's feedback on customer panic level

**What they do NOT do:**
- Execute technical fixes (that is Tech Lead's job)
- Write status updates (that is Comms Lead's job)
- Investigate root cause during the incident (that happens after)

### The Tech Lead

**Authority:** Technical decision-making during the incident

**Responsibilities:**
- Executes IC's decisions
- Owns technical assessment (is this data corruption? Cascading?)
- Directs engineering team (who investigates what)
- Reports progress to IC every 3 minutes

**What they need:**
- Access to systems and logs
- Authority to execute decisions without approval (kill queries, restart services)
- Clear direction from IC on what to do

**What they do NOT do:**
- Make the big decision (rollback or wait?) — IC does that
- Write status updates — Comms does that
- Investigate root cause during the incident — that is post-incident work

### The Communications Lead

**Authority:** What customers hear and when

**Responsibilities:**
- Initial status page update within 2 minutes
- Updates every 5-10 minutes (depending on severity)
- Alert escalation (customers, leadership) if recovery takes long
- Post-incident communication (what we learned, what is changing)

**What they need:**
- Updates from IC on progress
- Honest assessment of recovery timeline
- Authority to post without waiting for legal or approval (speed matters)

**What they do NOT do:**
- Make technical decisions
- Investigate technical details
- Commit to specific fixes or timelines without IC approval

---

## Part 4: The Decision Matrices (Should We Do This?)

Three decisions determine incident outcomes.

### Decision 1: Should We Rollback?

Use this matrix. Do not use your gut.

| Condition | Decision |
|-----------|----------|
| Deployed < 2 min ago AND error rate spiked immediately | **YES, rollback immediately** |
| Deployed < 5 min ago AND error rate high | **PROBABLY, but verify** |
| Deployed > 15 min ago | **Unlikely to be the cause unless coincidental timing** |
| Error rate is bad but canary traffic not affected | **NO, rollback would hurt more than help** |
| Database schema changed in deployment | **NO, rollback will cause data loss** |
| Other services depend on new behavior | **NO, rollback will cascade to them** |
| Error rate after rollback is still bad | **Rollback is not the fix** |
| You are unsure | **Escalate to VP before rolling back** |

### Decision 2: Should We Failover?

Use this matrix.

| Condition | Decision |
|-----------|----------|
| Primary is completely down (unreachable) | **YES, failover immediately** |
| Primary is running but degraded | **Monitor for 2 min, see if it recovers** |
| Failover time < 1 minute | **Faster to failover than wait** |
| Failover time > 5 minutes | **See if primary recovers first** |
| Failover will trigger replication lag issues | **Wait, see if primary recovers** |
| Data loss if we failover | **DO NOT FAILOVER without VP approval** |
| Failover has never been tested | **DO NOT FAILOVER without VP approval** |

### Decision 3: Should We Fix Forward (Code Change)?

Use this matrix.

| Condition | Decision |
|-----------|----------|
| Root cause is identified and fix is simple (< 5 min code change) | **YES, fix forward** |
| Root cause is unknown | **NO, either rollback or degrade** |
| Fix requires database migration | **NO, too risky, too slow** |
| Fix requires changes to 3+ services | **NO, too risky** |
| Fix has never been tested in production | **NO, too risky** |
| Customer impact continues while you develop fix | **Rollback/failover is faster** |

---

## Part 5: The Escalation Ladder (When to Wake Up More People)

The goal is to escalate as little as possible while still solving the problem.

```
MINUTE 0-2:   Oncall engineer runs triage

MINUTE 2-5:   If triage shows:
              ├─ Regional provider event → Escalate immediately
              ├─ All services cascading → Escalate immediately
              ├─ Identity system down → Escalate immediately
              ├─ Data corruption → Escalate immediately (before action)
              └─ Single service → Oncall may handle alone

MINUTE 5-30:  If not resolved:
              ├─ After 5 min with no progress → Escalate
              ├─ Customer impact visible → Escalate
              ├─ Multiple teams needed → Escalate
              └─ Still investigating → May not need escalation yet

MINUTE 30+:   If still not resolved:
              ├─ Director+ escalation (board visibility)
              ├─ Executive communication
              └─ Legal/compliance notification (if data impacted)
```

---

## Part 6: Common Failure Modes and Their Playbooks

### Playbook A: Identity System Down

```
Identity service is unreachable.

TRIAGE (1 min):
- Is it completely down? (all requests fail?)
- Or degraded? (token refresh slow?)

If completely down:
1. Can you restart it? → Restart, monitor 3 min
2. Is it a certificate issue? → Renew cert, restart
3. Is replication broken? → Failover to replica
4. Is the provider down? → Wait for provider recovery

If recovery > 15 minutes:
1. Activate manual approval workflow (pre-built)
2. Serve cached tokens (approved user list)
3. New users: manual approval only
4. Cannot exceed 1 hour in this mode

VALIDATION:
- New tokens issued successfully
- Recent logins work
- No support queue explosion
```

### Playbook B: Database Replication Lag

```
Primary and replica out of sync.

TRIAGE (1 min):
- Replication lag < 5 seconds? → Normal, monitor
- Replication lag 5-30 seconds? → High, consider failover
- Replication lag > 5 minutes? → Critical, escalate

If lag > 30 seconds:
1. Is primary actually failing? → Failover to replica
2. Is network slow? → Check link health
3. Is write volume high? → Wait for it to drain
4. Is replication broken? → Escalate to DB team

VALIDATION:
- Lag returns to < 5 seconds
- Reads from replica succeed
- No data loss
```

### Playbook C: Cascade Failure (Multiple Services Down)

```
Multiple services failing.

TRIAGE (2 minutes):
1. Identify the lowest-level failing service
2. Identify what that service depends on
3. Check if the dependency is down

Example:
- API is failing
- API calls Queue
- Queue is failing
- Fix Queue, then API will recover

RULE: Always fix from bottom up, not top down.

ACTION:
1. Fix the lowest-level dependency
2. Monitor for propagation (API should recover)
3. If API still bad → restart API
4. Do NOT try to fix API while its dependency is broken
```

### Playbook D: Bad Deployment

```
You deployed something, now everything is failing.

DECISION MATRIX (use above):
├─ Deployed < 2 min ago? → Rollback immediately
├─ Deployed < 5 min ago? → Consider rollback
├─ Deployed > 15 min ago? → Probably not the cause
└─ Error rate after rollback still bad? → Not the cause

ROLLBACK EXECUTION:
1. Run: scripts/rollback.sh [deployment-id]
2. Monitor error rate (expect 3-min stabilization)
3. If still bad → Was not the deployment, investigate further

VALIDATION:
- Error rate returns to baseline
- Recent operations succeed
- No downstream impacts
```

### Playbook E: Data Corruption Detected

```
System is responding, but data looks wrong.

DO NOT ROLLBACK YET.

TRIAGE (1 minute):
1. When did corruption start?
2. How many records affected?
3. Is corruption spreading (new records being created wrong)?

If spreading:
1. Stop writes to affected table
2. Page database team immediately
3. Do not make recovery decision without them

If localized:
1. Audit scope (how many records actually bad?)
2. Isolate corrupted records
3. Plan reconciliation (not rollback)
4. Validate recovery before announcing

RULE: Recovery is more important than speed. Do not lose good data trying to fix bad data.
```

---

## Part 7: When You Do Not Know What to Do

This will happen. You will encounter a failure that does not match your playbooks.

When that happens:

**Do not guess. Escalate.**

```
If you are unsure:
1. Declare the incident (at the threat level you think it is)
2. Page the person who knows (if possible)
3. Tell them exactly what you see (symptoms, not your theory)
4. Ask: "Based on what you are hearing, is this critical?"
5. Let them lead if it is above your authority

Time spent escalating (2 minutes) is faster than time spent guessing (30 minutes).
```

---

## Part 8: Post-Incident Checklist (First 60 Minutes After Recovery)

Once you have declared "all clear," recovery is not done. You still need to validate.

### Hour 0-1: Technical Validation

```
- [ ] Replication lag < 5 seconds
- [ ] Error rate < baseline + 0.1%
- [ ] All recent customer operations succeeded
- [ ] No new issues emerging in logs
- [ ] Database integrity checks passed
- [ ] All regions/zones responding
- [ ] Monitoring fully operational
```

### Hour 1-4: Operational Validation

```
- [ ] Support team: no new anomalies
- [ ] Product team: feature flags working
- [ ] Finance: no stuck transactions
- [ ] Security team: no signs of exploitation
- [ ] Internal teams: no cascading issues discovered
```

### Decision: Is It Safe to Declare "All Clear"?

```
If all validation checks pass:
1. Tech lead: "Technical systems nominal"
2. IC: "Incident resolved, declaring all clear"
3. Comms lead: Notify customers
4. Leadership: Brief leadership

If validation shows problems:
1. Declare incident re-open
2. Apply appropriate playbook
3. Do not declare all clear until validation passes
```

### Hour 4+: Schedule the Postmortem

```
When:      48 hours after incident resolved (not 2 weeks)
Duration:  90 minutes
Attendees: Everyone who was in the incident + stakeholders

Purpose:   Understand what happened, not who is to blame
Output:    Document decision points and follow-up actions
```

---

## Prevention by Design: Remove the Same Incident Next Quarter

This chapter is about the first 24 hours. Reliability maturity requires converting repeated incident classes into design controls.

Use this mapping after every incident:

| Failure class observed in triage | Prevention design control | Validation cadence |
|---|---|---|
| Cascade failure | Explicit service isolation boundaries, per-hop timeout budgets, circuit breakers, retry budgets | Quarterly chaos tests that kill one dependency and verify no cross-service collapse |
| Bad deployment | Progressive delivery (canary or blue-green), feature flag kill switch, contract compatibility checks | Every production deployment with rollback drill monthly |
| Dependency failure | Local fallback behavior, cached read paths, asynchronous buffering for non-critical writes | Monthly game day with dependency outage simulation |
| Regional provider event | Multi-zone baseline and pre-planned active-passive failover for Tier 0 and Tier 1 workloads | Quarterly full failover and failback exercise |
| Data corruption | Write-path validation, reconciliation jobs, immutable recovery checkpoints | Daily integrity checks and quarterly restoration test |
| Identity outage | Token cache layering, degraded read-only mode, separate human and service auth paths | Quarterly token-refresh and IdP dependency simulation |

### Architect takeaway

Design explicit failure boundaries before the next quarter begins. Incident speed is useful, but architecture determines how many incidents happen.

Minimum architecture package for high-impact systems:

- Dependency timeout and retry budgets documented per critical call path
- Circuit breaker and fallback behavior documented per external dependency
- Progressive deployment plus rollback kill switch for every user-facing service
- Regional failover strategy tied to declared RTO and RPO targets

### CTO takeaway

Treat repeated incident classes as capital allocation signals.

If the same class appears three or more times in one quarter, fund prevention work as mandatory platform investment, not discretionary backlog.

- Fund one reliability platform owner per critical product area
- Reserve dedicated quarterly capacity for reliability architecture, not only incident response
- Tie leadership review to prevention metrics: repeated incident class count, failover drill pass rate, and rollback success rate

---

## Summary: The Discipline That Saves Time

This chapter teaches discipline. Discipline feels slower when you are panicking. It is actually faster.

**Undisciplined incident response:**
- 2 minutes: Start investigating everything
- 15 minutes: Still not sure what the problem is
- 30 minutes: Make a guess, rollback, things get worse
- 60 minutes: Finally isolate the real problem
- 90 minutes: Fix it

**Disciplined incident response (using this chapter):**
- 2 minutes: Run decision tree, classify the problem
- 5 minutes: Execute immediate action (rollback, restart, failover)
- 10 minutes: Know if it worked, escalate if not
- 30 minutes: Either fixed or escalated to the right people
- 60 minutes: Validated and declared

The discipline feels like a delay. It is actually a time saver.

Print Appendix A. Laminate it. Use it. This chapter saves time by removing the time you would spend panicking.

---

*← [Introduction](/book/reliability-survival-guide/000017-reliability-is-an-economic-decision) | [Chapter 1: What Actually Kills Systems →](/book/reliability-survival-guide/000031-the-things-that-actually-break)*
