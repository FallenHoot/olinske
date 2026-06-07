---
title: 'Appendix A: Crisis Reference Cards'
description: >-
  One-page laminate-able guides for incident response. Print these. Put them in
  your war room. Use them at 2 AM when your system is failing.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - incident-response
  - operations
  - reference
status: published
copyright: © 2026 Zach Olinski. All rights reserved.
licenseUrl: 'https://olinske.com/docs/COPYRIGHT.md'
attributionRequired: true
commercialUsePermitted: false
---

# Appendix A: Crisis Reference Cards

Print these cards. Laminate them. Put them in your incident command area.

**What are these?** Quick reference guides. When your system is failing and you have 30 seconds to remember what to do, use these cards.

**What are these NOT?** They don't replace Chapters 0 and 11. Read those chapters first. Use these cards when you are in crisis and need instant guidance.

**Note:** For term definitions, see [Glossary](/book/reliability-survival-guide/glossary-reliability-terms).

---

## CARD 1: THE INCIDENT TRIAGE TREE (PRINT THIS FIRST)

```
╔════════════════════════════════════════════════════════════════════╗
║              INCIDENT TRIAGE TREE (First 2 Minutes)               ║
║     Your system is failing. Answer yes/no questions. No guesses.  ║
╚════════════════════════════════════════════════════════════════════╝

START HERE: Can you see your dashboards?
├─ NO ──────────────────────────────────────► MONITORING IS DOWN
│                                              Page: Infra lead + Monitoring oncall
│                                              Action: Do not continue without visibility
│
└─ YES ─────────────────────────────────────► Continue to next question

Is the problem visible in ALL regions/zones?
├─ YES ─────────────────────────────────────► PROVIDER EVENT OR CONTROL PLANE DOWN
│                                              Escalate immediately
│                                              Check: provider status page
│                                              Action: Failover if available, else wait
│
└─ NO ──────────────────────────────────────► Continue to next question

Did you deploy something in the last 5 minutes?
├─ YES ─────────────────────────────────────► LIKELY DEPLOYMENT FAILURE
│                                              See: CARD 3 (Deployment Decision Tree)
│                                              Action: Run rollback decision matrix
│
└─ NO ──────────────────────────────────────► Continue to next question

What is the symptom?
├─ "Error rate high" / "Timeouts"  ─────────► CARD 4 (Service Failure)
├─ "Latency increasing" ────────────────────► CARD 5 (Latency Triage)
├─ "No traffic getting through" ────────────► CARD 6 (Traffic Loss)
├─ "Data looks wrong" ──────────────────────► CARD 7 (Data Corruption)
│                                              DO NOT ROLLBACK YET
└─ "Everything is down" ────────────────────► CARD 8 (Cascade Failure)
                                              Multiple teams, complex response
```

---

## CARD 2: ESCALATION LADDER

```
╔════════════════════════════════════════════════════════════════════╗
║                      ESCALATION LADDER                             ║
║     When to wake up who. When to page. When to escalate to CEO.   ║
╚════════════════════════════════════════════════════════════════════╝

MINUTES 0-2: Oncall Engineer Owns It
  ├─ Run triage tree (CARD 1)
  ├─ Make the first decision
  └─ No escalation yet unless:
     ├─ Regional provider outage
     ├─ All services down
     ├─ Identity system down
     ├─ Data corruption detected
     └─ → If any above: Escalate to IC immediately

MINUTES 2-5: Incident Commander (if escalated)
  ├─ Takes decision authority
  ├─ Pages relevant service leads
  ├─ Reports to Comms lead
  ├─ Executes rollback/failover decision
  └─ Status: "We have an incident commander, we are handling it"

MINUTES 5-30: Service Owner + Team Leads
  ├─ Page the service owner
  ├─ Page additional service leads if cascade
  ├─ Tech lead executes IC decisions
  ├─ If still unresolved: escalate at minute 15
  └─ Status: "Multiple teams engaged"

MINUTES 30+: Director+ Escalation
  ├─ Call director (unplanned outage for 30+ min is director-level)
  ├─ Brief director on: symptom, action taken, expected recovery time
  ├─ Director may choose to involve VP (if customer impact is high)
  ├─ VP briefing: impact, recovery timeline, external comms plan
  └─ Status: "Executive visibility, may impact customer communication"

60+ MINUTES: Consider Public Communications
  ├─ If customer-visible and unresolved > 60 min
  ├─ Issue public statement
  ├─ Consider credit / compensation plan
  └─ Brief sales team (they will get customer calls)

ALWAYS ESCALATE IF:
  ├─ You are unsure (escalate, don't guess)
  ├─ Customer revenue impact is active
  ├─ Data integrity is at risk
  ├─ Provider incident confirmed
  └─ Recovery time > 30 minutes
```

---

## CARD 3: DEPLOYMENT DECISION TREE (ROLLBACK OR NOT?)

```
╔════════════════════════════════════════════════════════════════════╗
║              DEPLOYMENT DECISION TREE (3 Minutes)                 ║
║        Did this deployment cause the failure? Should we rollback? ║
╚════════════════════════════════════════════════════════════════════╝

When was the deployment? (Relative to when failure started)
├─ 0-2 minutes BEFORE failure ──────► LIKELY CAUSE → Continue
├─ 2-5 minutes BEFORE failure ──────► MAYBE CAUSE → Continue, but less certain
├─ 5-15 minutes BEFORE failure ─────► UNLIKELY (unless delayed trigger)
└─ > 15 minutes BEFORE failure ─────► NOT THE CAUSE (stop and investigate elsewhere)

Error rate after failure started:
├─ Spiked immediately (< 10 seconds) ─► Deployment is likely cause
├─ Increased gradually (1-5 min) ─────► Deployment might be cause
└─ No change, just high ──────────────► Deployment probably not cause

What was deployed?
├─ CODE CHANGE:
│  ├─ Simple code fix? ──────────────────► Rollback is safe
│  ├─ Large refactor? ──────────────────► Rollback is safe (code rollback)
│  └─ API change? ──────────────────────► Check if others depend on it (next question)
│
├─ DATABASE SCHEMA:
│  ├─ New column added? ────────────────► Rollback is safe (backward compatible)
│  ├─ Column deleted? ───────────────────► RISKY (old code will fail)
│  └─ Type changed? ────────────────────► RISKY (old queries may fail)
│
├─ CONFIGURATION:
│  ├─ Feature flag? ────────────────────► Rollback is safe (toggle it)
│  └─ Scale parameter? ────────────────► Rollback is safe
│
└─ INFRASTRUCTURE:
   ├─ Network routing? ───────────────► Rollback is safe
   └─ Traffic allocation? ───────────► Rollback is safe

Did another service depend on this deployment?
├─ NO ──────────────────────────────────► Rollback is safe
├─ YES and service deployed AFTER this ─► ROLLBACK WILL CASCADE (do NOT rollback)
├─ YES and service deployed BEFORE this ─► Rollback is safe (they expect old behavior)
└─ UNSURE ──────────────────────────────► CHECK GIT LOG, then decide

Will rollback cause data loss?
├─ YES ──────────────────────────────────► DO NOT ROLLBACK (escalate)
└─ NO ───────────────────────────────────► Rollback is safe

FINAL DECISION:
├─ Deployment is likely cause?
├─ Rollback is technically safe?
├─ Rollback won't cascade to dependents?
├─ Rollback won't cause data loss?
└─ If ALL YES ──────────────────────────► ROLLBACK IMMEDIATELY
   If ANY NO ───────────────────────────► Escalate or fix forward
```

---

## CARD 4: SERVICE FAILURE TRIAGE (High Error Rate / Timeouts)

```
╔════════════════════════════════════════════════════════════════════╗
║              SERVICE FAILURE TRIAGE (Error Rate High)             ║
║              Which service is failing? What caused it?            ║
╚════════════════════════════════════════════════════════════════════╝

STEP 1: Identify which service has high error rate
  ├─ Look at dashboard: which service went red?
  ├─ Call the service owner (if known)
  └─ For service [X], continue:

STEP 2: Is this service's dependency healthy?
  ├─ What does [X] depend on?
  │  ├─ Database?
  │  ├─ Cache?
  │  ├─ Message queue?
  │  ├─ Identity / Auth?
  │  └─ Other services?
  │
  ├─ Check each dependency:
  │  ├─ Responding? ──────► YES → Dependency OK
  │  └─ Slow/failing? ─────► NO → Dependency problem (fix that first)
  │
  └─ If dependency has issue:
     ├─ Can it be restarted? (< 30 sec) ─► Restart it
     ├─ Can it fail over? ─────────────► Fail over
     └─ Otherwise ──────────────────────► Escalate

STEP 3: Did [X] have a recent deployment?
  ├─ YES → See CARD 3 (Deployment Decision Tree)
  └─ NO → Continue

STEP 4: Can the service be restarted?
  ├─ Restart time < 30 seconds? ──────► Restart [X] immediately
  │                                     Monitor error rate for 3 min
  │                                     If better: done
  │                                     If same: continue
  │
  └─ Restart time > 30 seconds? ──────► Skip, investigate further

STEP 5: Is this in the runbook?
  ├─ Check: docs/runbooks/[service-X].md
  ├─ If found: Follow the runbook
  └─ If not found: Investigate deeper or escalate

If nothing works in first 5 minutes:
  └─ Escalate to service owner and IC
```

---

## CARD 5: LATENCY TRIAGE (Everything Slow)

```
╔════════════════════════════════════════════════════════════════════╗
║                    LATENCY TRIAGE (Slow Response)                 ║
║              Which component is slow? Database? Network? Queue?   ║
╚════════════════════════════════════════════════════════════════════╝

Is latency uniform (all services slow) or specific (one service slow)?
├─ UNIFORM ───────────────────────────► Likely infrastructure problem
│  ├─ Check: Database latency (run: SELECT query_latency_p99)
│  ├─ Check: Network latency (check provider status)
│  ├─ Check: Storage I/O (check disk queue length)
│  └─ If database: Restart slow queries or kill blocking transactions
│
└─ SPECIFIC ──────────────────────────► Likely service problem
   ├─ Check: That service's dependency health
   ├─ Check: That service's recent deployment
   └─ See CARD 4 (Service Failure) for next steps

Is the latency visible in all regions?
├─ YES ──────────────────────────────► Likely shared component (DB, queue, network)
└─ NO ───────────────────────────────► Likely one region's infra (LB, link, etc.)

What changed recently?
├─ Deployment? ──────────────────────► Bad query or inefficient change
├─ Scale increase? ──────────────────► Insufficient capacity
├─ Database operation? ──────────────► VACUUM, REINDEX, or migration running
└─ Nothing known? ───────────────────► Investigate queries / connections

IMMEDIATE ACTIONS:
├─ Kill slow running queries (database admin command)
├─ Restart services that are slow
├─ Check: Message queues backing up (if yes: scale consumers)
├─ Reduce traffic (circuit break non-critical services)
└─ Fail over if one region is slow and you have another

ESCALATION:
  If latency > 5 seconds and not resolved in 10 minutes:
  ├─ Escalate to database team
  └─ Escalate to infrastructure team (network, storage)
```

---

## CARD 6: TRAFFIC LOSS (No Traffic Getting Through)

```
╔════════════════════════════════════════════════════════════════════╗
║               TRAFFIC LOSS (Nothing Getting Through)              ║
║    Load balancer not routing? Network down? Deployment killed?   ║
╚════════════════════════════════════════════════════════════════════╝

Can you reach your systems at all? (Try: curl API endpoint)
├─ No response / Connection refused ──► Network or load balancer issue
├─ HTTP error (50x, 40x) ────────────► Service is responding but erroring
└─ Response is slow but coming ──────► See CARD 5 (Latency)

Recent deployment?
├─ YES (< 5 min) ─────────────────────► Likely killed traffic routing
│  ├─ See CARD 3 (Deployment Decision Tree)
│  ├─ Check: Deployment rollback
│  └─ If deployment is bad: Rollback immediately
│
└─ NO ──────────────────────────────► Continue

Can you reach a backend directly (skip load balancer)?
├─ YES ──────────────────────────────► Load balancer is the problem
│  ├─ Restart load balancer? (if fast)
│  ├─ Failover to secondary LB? (if available)
│  └─ Escalate to network team
│
└─ NO ───────────────────────────────► Backend services are unreachable
   └─ This is a cascade failure: See CARD 8

Can you reach from internal network? (Skip external path)
├─ YES ──────────────────────────────► Network / firewall / routing issue
│  └─ Escalate to network team immediately
│
└─ NO ───────────────────────────────► Services are completely down
   └─ This is a cascade failure: See CARD 8

IMMEDIATE ACTIONS:
├─ If deployment: Rollback
├─ If LB: Restart or failover
├─ If network: Escalate
├─ If backend: See CARD 8 (Cascade Failure)
└─ Notify: Customers are completely blocked
```

---

## CARD 7: DATA CORRUPTION (Data Looks Wrong)

```
╔════════════════════════════════════════════════════════════════════╗
║              DATA CORRUPTION (System Up, Data Wrong)              ║
║       Stop. Do not rollback yet. Do not delete anything.          ║
╚════════════════════════════════════════════════════════════════════╝

STOP: Before doing anything else, escalate to database team.
  └─ This requires careful recovery. Wrong action causes worse damage.

When did you first notice?
├─ Right after deployment ──────────► Deployment changed data incorrectly
├─ Gradually over hours ───────────► Replication lag or write failure
└─ Just discovered but older ──────► How old is the corruption?

How many records affected?
├─ Few (< 100) ─────────────────────► Can be fixed manually
├─ Many (100-1000) ──────────────────► Service-level decision needed
└─ Very many (> 1000) ──────────────► Possible data-wide issue

Is it safe to rollback?
├─ Rollback would lose good data written AFTER corruption? ─► NO
├─ Rollback would RESTORE corrupted data? ──────────────────► NO
├─ Rollback has never been tested? ───────────────────────────► RISKY
└─ Unsure? ──────────────────────────────────────────────────► NO

WHAT TO DO:
1. [ ] Isolate the corrupted data (do not let it spread)
2. [ ] Stop writes if corruption is actively spreading
3. [ ] Document the scope (how much data is bad?)
4. [ ] Call database team (do not decide alone)
5. [ ] Plan reconciliation (not rollback)
6. [ ] Do NOT delete corrupted data until recovery plan approved

DO NOT:
  ├─ Rollback without database team approval
  ├─ Delete corrupted records (you may need them for reconciliation)
  ├─ Deploy a fix that overwrites with different data (write validation first)
  └─ Declare "all clear" before data validation

Once database team is engaged:
  ├─ Follow their reconciliation plan
  ├─ Do not deviate
  └─ Validate that recovery succeeded before resuming writes
```

---

## CARD 8: CASCADE FAILURE (Multiple Services Down)

```
╔════════════════════════════════════════════════════════════════════╗
║         CASCADE FAILURE (Multiple Services Failing)                ║
║  One service failed. Now everything else is failing because of it. ║
╚════════════════════════════════════════════════════════════════════╝

CRITICAL RULE: Fix from the BOTTOM UP, not top to bottom.

Step 1: Identify the lowest-level failure
  ├─ Which service failed FIRST? (check timestamps in logs)
  ├─ Which service has the highest error rate?
  ├─ Which service is depended on by everything else?
  │
  └─ Example: API failing → API calls Queue → Queue is failing
     = Queue is the lowest level

Step 2: Fix the lowest-level service
  ├─ Can it be restarted? (take < 30 sec) ─► Restart it
  ├─ Can it fail over? (have secondary) ───► Fail over
  ├─ Is it the database? ──────────────────► See CARD 5 (Latency) / CARD 7 (Corruption)
  ├─ Is it the queue? ─────────────────────► Scale consumers, drain backlog
  └─ Is it a dependency (provider issue)? ─► Escalate + wait or activate fallback

Step 3: Do NOT try to fix services at the top
  ├─ They will recover once their dependency recovers
  ├─ Fixing the API while the Queue is down will not help
  └─ Wasted effort

Step 4: Escalate cascade failures immediately
  ├─ Multiple teams involved
  ├─ Coordination needed
  └─ May require multiple decisions (rollback, restart, failover)

COMMON CASCADE PATTERNS:
├─ One service deployed bad code → cascades to dependent services
│  └─ Fix: Rollback the bad deployment
│
├─ Database is slow → queue backs up → API times out
│  └─ Fix: Optimize database, kill slow queries, scale
│
├─ Identity system down → everything cascades (needs login)
│  └─ Fix: Restart identity OR activate token cache fallback
│
├─ Message queue fails → all async processing stops
│  └─ Fix: Restart queue or fail over to backup
│
└─ Network link is bad → some calls timeout → cascades
   └─ Fix: Failover to alternate network path

COMMUNICATION:
  "We have a cascade failure. Fixing [lowest-level service first].
   Once that recovers, dependent services should follow.
   Estimate [time] for full recovery."
```

---

## CARD 9: ROLE CARDS DURING INCIDENT

### INCIDENT COMMANDER

```
╔════════════════════════════════════════════════════════════════════╗
║                    INCIDENT COMMANDER ROLE                         ║
║                      (IC / Incident Lead)                          ║
╚════════════════════════════════════════════════════════════════════╝

YOU ARE IN CHARGE OF INCIDENT RESPONSE.

Your Decisions:
  ├─ Rollback or fix forward?
  ├─ Failover or wait for recovery?
  ├─ Escalate or continue with current team?
  └─ When is the incident resolved?

Your Responsibilities:
  ├─ [ ] Declare incident (Pagerduty: create incident)
  ├─ [ ] Assign Tech Lead (who executes decisions)
  ├─ [ ] Assign Comms Lead (who updates status page)
  ├─ [ ] Make decision on triage result (use CARD 1)
  ├─ [ ] Execute decision (order Tech Lead to do it)
  ├─ [ ] Report progress every 3 minutes
  ├─ [ ] Escalate if recovery > 15 min
  └─ [ ] Declare incident resolved (not just "system up")

What You DO:
  ├─ Listen to Tech Lead's assessment
  ├─ Ask: "How long will this take?"
  ├─ Make decisions: rollback? failover? escalate?
  ├─ Brief leadership on status
  └─ Coordinate between tech and communications

What You DON'T DO:
  ├─ Do NOT do the technical work (Tech Lead does that)
  ├─ Do NOT investigate root cause (postmortem does that)
  ├─ Do NOT update status page (Comms Lead does that)
  └─ Do NOT make technical decisions alone (ask Tech Lead first)

Say This:
  "I am the IC. Tech Lead, what is your assessment?
   We have 5 minutes. Go. Report back."

Do NOT Say:
  "I don't know what to do. What should we do?"
  (Instead: Get Tech Lead's input, then decide)
```

### TECH LEAD

```
╔════════════════════════════════════════════════════════════════════╗
║                        TECH LEAD ROLE                              ║
║                   (Engineering Lead / Executor)                    ║
╚════════════════════════════════════════════════════════════════════╝

YOU EXECUTE THE IC'S DECISIONS. YOU OWN TECHNICAL RESPONSE.

Your Decisions:
  ├─ Technical triage (is this cascade? dependency failure? depl?)
  ├─ Which team investigates what?
  ├─ What command to execute next?
  └─ When technical response is complete

Your Responsibilities:
  ├─ [ ] Run triage tree (CARD 1)
  ├─ [ ] Report finding to IC ("Database is slow, API is cascading")
  ├─ [ ] Recommend action ("I recommend restarting DB")
  ├─ [ ] Execute IC's decision ("Restarting now")
  ├─ [ ] Report progress every 3 minutes
  ├─ [ ] Escalate if IC decision appears technically wrong
  └─ [ ] Validate that decision worked

What You DO:
  ├─ Assess the technical problem
  ├─ Recommend a fix
  ├─ Execute the IC's decision
  ├─ Monitor the result
  └─ Report: "Did it work? Should we try something else?"

What You DON'T DO:
  ├─ Do NOT make the big decision (IC does that)
  ├─ Do NOT investigate root cause during incident (do that after)
  ├─ Do NOT update status page (Comms Lead does that)
  └─ Do NOT delay because you want the "perfect" answer (good enough is OK)

Say This:
  "The database is slow. I recommend restarting it. Restart time
   is 45 seconds. Should I proceed?"

Do NOT Say:
  "I am not sure what the problem is yet. Let me investigate more."
  (Instead: Make a decision with available info, report result)
```

### COMMUNICATIONS LEAD

```
╔════════════════════════════════════════════════════════════════════╗
║                   COMMUNICATIONS LEAD ROLE                         ║
║              (Status Page / Customer Communications)               ║
╚════════════════════════════════════════════════════════════════════╝

YOU OWN WHAT CUSTOMERS HEAR AND WHEN.

Your Decisions:
  ├─ When to post to status page (2 min, 5 min, 10 min intervals)
  ├─ What to tell customers (what detail level?)
  ├─ When to escalate to executives (if needed)
  └─ How long to estimate recovery

Your Responsibilities:
  ├─ [ ] First status page update within 2 minutes
  ├─ [ ] Follow-up updates every 5-10 minutes
  ├─ [ ] Ask IC for progress update every 3 minutes
  ├─ [ ] Post: incident timeline, impact, recovery status
  ├─ [ ] Brief leadership if recovery > 30 minutes
  └─ [ ] Post "all clear" only when IC approves

What You DO:
  ├─ Post initial message: "Investigating [symptom]"
  ├─ Post updates: "Making progress, currently [action]"
  ├─ Post resolution: "Service restored, no data loss"
  ├─ Ask IC: "What should I tell customers about ETA?"
  └─ Brief leadership: "Incident impact and timeline"

What You DON'T DO:
  ├─ Do NOT post technical details customers don't need
  ├─ Do NOT post root cause (you don't know yet)
  ├─ Do NOT go silent (creates panic)
  ├─ Do NOT post hopeful estimates without IC approval
  └─ Do NOT delay posting to get "perfect" message (fast > perfect)

Say This:
  "We are aware of errors affecting [X% of users] on [feature].
   Our team is [specific action]. We will update every 5 minutes.
   Estimated time to recovery: [IC's estimate]."

Do NOT Say:
  "We don't know what is wrong yet."
  (Instead: "We are investigating. More soon.")
```

---

## CARD 10: POST-INCIDENT CHECKLIST (First 60 Minutes After Recovery)

```
╔════════════════════════════════════════════════════════════════════╗
║          POST-INCIDENT VALIDATION (First 60 Minutes)               ║
║         System is back up. But is it actually OK? Validate.       ║
╚════════════════════════════════════════════════════════════════════╝

FIRST 10 MINUTES: Technical Validation
  ├─ [ ] Can you see dashboards? (monitoring working)
  ├─ [ ] Error rate < baseline + 0.1%?
  ├─ [ ] Latency < baseline + 500ms?
  ├─ [ ] All regions responding?
  ├─ [ ] Recent customer operations succeeded?
  ├─ [ ] Database replication lag < 5 seconds?
  └─ [ ] No new alerts firing?

FIRST 30 MINUTES: Data Integrity Validation
  ├─ [ ] Replication lag is back to normal
  ├─ [ ] Run data consistency check (if you have one)
  ├─ [ ] No orphaned records in logs
  ├─ [ ] Recent transactions complete successfully
  ├─ [ ] Cache consistency validated
  └─ [ ] No alerts about data anomalies

FIRST 60 MINUTES: Operational Validation
  ├─ [ ] Support team: "No new anomalies from customers"
  ├─ [ ] Product team: "Feature flags working as expected"
  ├─ [ ] Finance team: "No stuck transactions"
  ├─ [ ] Internal teams: "No cascading issues discovered"
  └─ [ ] Security team: "No signs of exploitation"

DECISION: Is it safe to declare "All Clear"?
  ├─ ALL validation checks pass? ──────► YES, declare "All Clear"
  │  ├─ Tech Lead: "Technical systems nominal"
  │  ├─ IC: "Incident is resolved"
  │  ├─ Comms Lead: Notify customers
  │  └─ Leadership: Brief them
  │
  └─ ANY validation check failed? ─────► NO, incident continues
     ├─ Resolve the new issue
     ├─ Re-validate
     └─ Only then declare "All Clear"

DO NOT declare "All Clear" until validation is complete:
  ├─ Too early: You will have to declare again (loses credibility)
  ├─ Too late: Cost of extended outage grows
  └─ Right time: When validation confirms recovery is real

NEXT STEP: Schedule postmortem
  ├─ When: 48 hours (not 2 weeks, not tomorrow)
  ├─ Duration: 90 minutes
  ├─ Attendees: Everyone involved + stakeholders
  └─ Purpose: Learn, not blame
```

---

## CARD 11: SYMPTOM INDEX (Quick Navigation)

```
╔════════════════════════════════════════════════════════════════════╗
║              SYMPTOM INDEX (Which Card Do I Need?)                 ║
╚════════════════════════════════════════════════════════════════════╝

"My error rate is high"
  └─ See: CARD 1 (Triage Tree)
     If single service → CARD 4 (Service Failure)
     If multiple services → CARD 8 (Cascade)

"My latency is bad"
  └─ See: CARD 5 (Latency Triage)

"Nothing is getting through"
  └─ See: CARD 6 (Traffic Loss)

"Data looks wrong"
  └─ See: CARD 7 (Data Corruption)
     STOP: Do not rollback yet

"Everything is down"
  └─ See: CARD 1 (Triage Tree)
     Likely: CARD 8 (Cascade Failure)
     Or: Regional provider outage

"I just deployed and now it is failing"
  └─ See: CARD 3 (Deployment Decision Tree)

"I can't see my dashboards"
  └─ See: CARD 1 (Triage Tree)
     Monitoring is down
     Escalate immediately

"I don't know what is wrong"
  └─ See: CARD 1 (Triage Tree)
     Start at the top
     Ask yes/no questions
     Do not guess
```

---

## Using These Cards

**Print Them Now:**
- Print each CARD section double-sided (front/back)
- Use thick cardstock (8.5" x 11")
- Laminate them (office supply store, $2-5 per card)

**Where to Keep Them:**
- War room (where incidents are coordinated)
- On-call binder (physical, always available)
- Incident command desk
- Slack (pin these as images in #incidents channel)
- Wiki (link to this document)

**How to Use Them:**
- When pager goes off: Start with CARD 1
- Answer the questions: move to the next card
- Each card takes 1-3 minutes to use
- Do not spend 10 minutes reading, spend 1 minute deciding

**Keep Them Current:**
- Review CARD 3 (Deployment) quarterly
- Review CARD 8 (Cascade) after each cascade failure
- Add your own CARDS for your systems (identity fallback, etc.)
- Remove cards that no longer apply

---

*← [Chapter 0: The First 24 Hours](/book/reliability-survival-guide/000036-first-24-hours-incident-triage) | [Chapter 11: Incident Triage and Response →](/book/reliability-survival-guide/000037-incident-triage-response-protocols)*
