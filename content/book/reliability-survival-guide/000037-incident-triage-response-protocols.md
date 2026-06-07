---
title: 'Chapter 11: Incident Triage and Response Protocols'
description: >-
  Advanced incident response patterns. How to make decisions under pressure when
  information is incomplete. Decision frameworks grounded in real postmortems
  showing what works and what fails.
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

# Chapter 11: Incident Triage and Response Protocols

*← [Chapter 10: Execution and the Next Quarter](/book/reliability-survival-guide/000027-reliability-execution-quarterly-plan) | [Chapter 12: Reliability Pricing →](/book/reliability-survival-guide/000029-reliability-pricing-saas-margin-trap)*

**Note:** This chapter uses technical terms. See the [Glossary](/book/reliability-survival-guide/glossary-reliability-terms) for definitions.

---

## The Problem This Chapter Solves

Chapter 0 teaches you the immediate response. This chapter teaches you **why** the decisions work and **what goes wrong** when they fail.

Fast recovery is not luck. It is decision quality under pressure.

> "Decision cadence under uncertainty is a capability, not a personality trait."  
> Reliability lesson from WWII air and naval command loops: teams that run observe-orient-decide-act faster, with disciplined role clarity, recover sooner.

Most reliability books assume you have time to think. Real incidents do not give you that. This chapter is about making good decisions in minutes with incomplete information.

---

## Part 1: Decision-Making Under Pressure

### The OODA Loop: Why Speed Beats Perfection

A military pilot named John Boyd discovered this pattern. It applies to incident response too:

```
1. OBSERVE: What is happening right now?
2. ORIENT: What do I know about situations like this?
3. DECIDE: What is my next action?
4. ACT: Do it
5. Loop back to OBSERVE: What happened?
```

The team that cycles through this loop fastest recovers fastest. Speed matters more than perfect decisions.

> "Perfection too late is failure in a different uniform."  
> Reliability lesson from operational history: an 80% decision now is often better than a 100% decision after the blast radius has doubled.

**Why:**
- A fast decision that is 80% right works better than a perfect decision that comes 5 minutes too late
- You learn from observing results. Waiting for perfect information wastes learning time
- Situations change. If you wait 10 minutes to decide, the situation has changed

**How to apply:**
1. Observe for 90 seconds
2. Make the best decision you can
3. Act on it
4. Observe what happened
5. Adjust if needed

**What fails:**
- Spending 15 minutes investigating before acting (too slow)
- Acting without observing results (you do not learn)
- Making one decision and refusing to change it (you ignore new information)

### The Medical Triage Model

Emergency rooms classify patients in 60 seconds into four categories:

```
RED (Immediate):     Life-threatening, treat now
YELLOW (Urgent):     Serious, treat soon
GREEN (Stable):      Injured but stable, treat later
BLACK (Expectant):   Unlikely to survive
```

This is NOT permanent. As information arrives, patients move between categories.

**Why this works:**
- Fast decision, not perfect
- Resources go to the highest impact cases first
- Improves overall outcome

**Apply to incidents:**

```
RED (Immediate):     Customers losing money right now, all hands
YELLOW (Urgent):     Customers notice degradation, escalate
GREEN (Stable):      Only internal users affected, monitor
BLACK (Unknown):     Might not be real, needs investigation
```

Not every incident is RED. Treating everything as RED creates alert fatigue and slows decisions.

### When to Override Your Runbook

Runbooks are for 90% of failures. The other 10% require judgment.

Example: Your runbook says "Restart the database." Usually correct. But what if:
- Restart takes 10 minutes and recovery is happening naturally in 2 minutes?
- Restart will lose in-flight transactions?
- Restart will trigger replication re-sync that cascades the problem?

Runbooks cannot account for all context. That is why incident commanders exist.

**Rule:**
```
Runbook says X
You observe Y
Conditions unusual? → Override runbook, report to team lead
Conditions normal? → Execute runbook as written
```

---

## Part 2: The Escalation Decision Criteria

Not all incidents need escalation. Escalating unnecessarily burns trust and slows decision-making.

Escalate when:

```
1. Customer revenue impact is actively happening
   Example: "Orders not processing" → Escalate immediately

2. Decision is above your authority
   Example: "Should we fail over to backup provider?" → Escalate
   
3. Recovery is taking longer than expected
   Example: 15 minutes in with no progress → Escalate
   
4. You are unsure and the stakes are high
   Example: "Should we rollback this schema change?" → Escalate
   
5. Multiple teams are affected
   Example: "API down because database is down" → Escalate

6. The decision is non-reversible or risky
   Example: "Should we delete the corrupted data?" → Escalate
```

**Do NOT escalate when:**

```
1. You are just scared
   Example: "The error rate is high but I do not know what to do"
   → Instead: Run the decision tree, make a decision, report result

2. It is your job to handle this severity
   Example: "Single service down" and you are the oncall
   → Instead: Follow the runbook, manage the incident

3. You want someone else to make a hard decision
   Example: "I fixed it but something else broke, should we continue?"
   → Instead: Make the decision based on customer impact
```

---

## Part 3: The Rollback Decision in Detail

Rollback seems simple. It is actually dangerous.

### Why Rollback Is Risky

**Scenario 1: Other services depend on your new code**
```
Timeline:
  14:32 — You deploy new code
  14:35 — Another team deploys code that depends on your new code
  14:38 — Your code breaks
  14:40 — You rollback your code to the old version
  
Result: The other team's code is calling functions that no longer exist. 
Their code breaks too. Cascade failure.
```

**Scenario 2: You changed the database structure**
```
Timeline:
  14:32 — You deploy code + database change (remove a column)
  14:35 — Everything looks good
  14:38 — New code breaks due to a different bug
  14:40 — You rollback the code
  
Result: Old code expects that column to exist. Writes fail.
Database is changed but code expects old structure.
Rollback did not fix the problem.
```

**Scenario 3: Rollback takes longer than fixing**
```
The bug fix: 5 minutes to write, test, deploy
Rollback: 12 minutes (rebuild, canary test, verify)
Decision: Fix the bug, do not rollback
```

### The Rollback Decision Matrix (Detailed)

Use this matrix. It forces you to think through the actual risks.

```
QUESTION 1: How recent was the deployment?
├─ < 2 minutes
│  └─ Error rate spiked? → Rollback immediately (timing is too clear)
│
├─ 2-10 minutes
│  └─ Error rate is very high? → Probably rollback
│  └─ Error rate is moderate? → Investigate 2 more minutes
│  └─ Specific service failing? → Could be coincidental, investigate
│
├─ 10-30 minutes
│  └─ Unlikely to be the cause (something else happened)
│
└─ > 30 minutes
   └─ Unlikely unless there is a delayed trigger (queue backlog, etc.)

QUESTION 2: What was deployed?
├─ Code only? → Rollback is safe (no state change)
│
├─ Database schema?
│  └─ New column? → Rollback safe (schema change is backward compatible)
│  └─ Column deleted? → Rollback risky (old code will fail on deleted column)
│  └─ Type changed? → Rollback risky (old queries might fail)
│
└─ Configuration/infrastructure?
   └─ Feature flag? → Rollback is safe (toggle it off)
   └─ Scale change? → Rollback is safe
   └─ Traffic routing? → Rollback is safe

QUESTION 3: Are other services depending on the new behavior?
├─ YES → Rollback will cascade the failure
│  └─ Do NOT rollback, fix forward
│
├─ MAYBE → Check git logs for recent deploys by dependent services
│  └─ If deployed AFTER this change → Rollback will cascade
│  └─ If deployed BEFORE this change → Safe to rollback
│
└─ NO (you checked) → Rollback is safe

QUESTION 4: Will rollback cause data loss?
├─ YES → Do NOT rollback (recovery is better than data loss)
│
└─ NO → Rollback is safe

FINAL DECISION:
├─ Safe rollback + error rate bad + deployment recent?
│  └─ ROLLBACK IMMEDIATELY
│
├─ Rollback is risky OR unclear?
│  └─ Escalate to VP, let them decide
│
├─ Rollback will take > 30 minutes?
│  └─ Fix forward if fix is faster
│  └─ Roll back if fix is unknown
│
└─ Still unsure?
   └─ Escalate, do not guess
```

### Real Postmortem: Why Rollback Backfired

**Incident:** PaymentService erroring 10% of requests

**Timeline:**
- 14:32 — Deployment A: PaymentService v2.1 (code change)
- 14:35 — Deployment B: ReceiptService v1.4 (depends on PaymentService new API)
- 14:38 — Error rate on PaymentService spikes to 10%
- 14:39 — Oncall engineer: "Recent deployment, rollback immediately"
- 14:41 — Rollback of PaymentService to v2.0
- 14:43 — ReceiptService calling non-existent endpoint, cascading failure
- 14:50 — ReceiptService now at 50% error rate
- 14:55 — Realized the cascade, rolled back ReceiptService too

**What should have happened:**
- 14:40 — Check: "Did any service depend on this deployment?" (YES)
- 14:41 — Check git logs: ReceiptService deployed 3 minutes AFTER PaymentService
- 14:42 — Decision: Do NOT rollback PaymentService, fix forward instead
- 14:45 — Found bug in PaymentService, deployed fix
- 14:46 — Error rate back to baseline

**Time lost due to wrong rollback decision:** 16 minutes

---

## Part 4: The Failover Decision in Detail

Failover is less risky than rollback but still has hidden dangers.

### When to Failover

```
QUESTION 1: Is primary actually down (unreachable)?
├─ YES → Failover immediately
├─ NO → Does not respond to pings but might recover?
│  └─ Wait 30 seconds, then decide
└─ UNSURE → Escalate

QUESTION 2: Is failover faster than recovery?
├─ Primary recovery < 2 minutes?
│  └─ Wait for recovery (less risky)
├─ Primary recovery > 5 minutes?
│  └─ Failover (faster)
└─ Primary recovery 2-5 minutes?
   └─ Failover (prevents further customer impact while primary comes up)

QUESTION 3: Will failover cause issues?
├─ Replication lag is high (> 5 minutes)?
│  └─ Failover will cause data loss, escalate
├─ Failover has never been tested?
│  └─ Escalate (unfamiliar procedure, might make things worse)
├─ Failover time is unknown (> 10 minutes)?
│  └─ Wait for primary recovery (failover is slower than recovery)
└─ Failover is well-tested and fast (< 2 minutes)?
   └─ Safe to failover

QUESTION 4: Is the issue on the primary or upstream?
├─ Primary is fine but traffic not reaching it?
│  └─ Do NOT failover (issue is upstream, failover will not help)
│
├─ Primary is actually broken?
│  └─ Failover OK if primary is gone
│
└─ UNSURE?
   └─ Escalate
```

### Post-Failover Validation

Do NOT assume failover succeeded. Validate:

```
After failover completes:
1. [ ] New primary responding to traffic
2. [ ] No data loss (validate recent writes exist)
3. [ ] Replication lag acceptable (if replicated)
4. [ ] Dependent services working (test a customer journey)
5. [ ] Old primary actually down (do not try to use it)

If any check fails:
└─ Failback to original primary (more likely to work than continuing on broken secondary)
```

---

## Part 5: Communication During Incident (The Underestimated Skill)

Most incident guides skip communication. It is actually the second-most impactful decision after the technical fix.

### The Status Page Update Timing

Chapter 0 already gives you the exact minute-by-minute status page template. Use that script during the incident.

This chapter focuses on why that script works:

1. **Cadence beats detail.** Customers need predictable updates more than deep technical detail.
2. **Specific action beats vague intent.** "Restarting database" builds more trust than "investigating".
3. **Honest uncertainty beats false certainty.** "We do not know yet" is better than a wrong ETA.
4. **Validation beats celebration.** Do not declare all clear until data integrity and customer journeys are verified.

If you need the literal wording in the middle of an outage, use the quick template in Chapter 0.

### The Customer Impact Honesty Rule

Lying about impact delays customer response, triggers unnecessary escalations, and destroys trust.

```
Honest communication during incident:
├─ Quantify impact: "Affecting X% of users on feature Y"
├─ Acknowledge severity: "We know this is critical, our team is working"
├─ Give time horizon: "We estimate 15 more minutes OR we do not know yet"
└─ Update before silence: "No change in status, but still working"

Impact honesty speeds up customer response and preserves trust.
```

---

## Part 6: Role Clarity (The Source of Most Failures)

When roles are unclear, incidents take 2-3x longer to resolve.

### Who Decides What?

```
INCIDENT COMMANDER:
├─ Decides: Rollback vs. fix forward
├─ Decides: Failover or wait for recovery
├─ Decides: Escalate or continue
├─ Has authority over: Engineering team during incident
├─ Does NOT have authority over: Business/product decisions during incident
└─ Does NOT decide: Root cause (that is post-incident)

TECH LEAD:
├─ Decides: Technical triage (is this cascade or single service?)
├─ Decides: Which team member investigates what
├─ Executes: IC's decisions (rollback, restart, failover)
├─ Reports to: IC every 3 minutes
├─ Escalates: If IC decision appears technically wrong
└─ Does NOT decide: Business impact or next-steps strategy

COMMUNICATIONS LEAD:
├─ Decides: What and when to communicate
├─ Decides: Whether to escalate to executives
├─ Reports to: IC on customer panic level
├─ Does NOT decide: Technical response
└─ Does NOT have authority over: Engineering choices (that is IC's role)

EXECUTIVE (if involved):
├─ Decides: Business response (offer credits? pause billing? etc.)
├─ Decides: Customer communication timing
├─ Receives: Regular briefing from IC
├─ Does NOT have authority over: Technical decisions (that is IC's)
└─ Role: Listen, provide context, execute business decisions
```

### Common Failure: Unclear Authority

**Scenario from real incident:**

```
14:40 — IC says: "Let's rollback"
14:41 — Tech lead says: "Wait, I think I see the issue, give me 2 minutes"
14:42 — VP joins: "What is the ETA?"
14:43 — IC says: "Depends on tech lead's assessment"
14:44 — VP says: "I think we should fail over"
14:45 — Tech lead: "But failover will cause cascade..."
14:46 — Everyone talking over each other, no decision made
14:48 — Customer impact worsening, now 50% error rate

What went wrong:
- IC did not decide (deferred to tech lead)
- VP tried to override IC (two bosses)
- No one had clear authority to make the call

How to fix it:
14:40 — IC: "Tech lead, what is your assessment?"
14:41 — Tech lead: "I see the issue, need 2 minutes"
14:42 — IC: "You have 2 minutes, then we rollback"
14:43 — Tech lead: "I need 4 minutes for safety"
14:44 — IC: "OK, 4 minutes. VP, I will keep you updated"
14:45 — Tech lead fixes issue
14:46 — Error rate recovering

Clear authority compressed decision time from 6 minutes to 6 minutes, but with a successful outcome.
```

---

## Part 7: When Things Go Wrong (Incident Adjustments)

Incidents rarely follow the script. You will make decisions that are wrong.

When that happens:

### Course Correction Sequence

```
STEP 1: Observe that the decision is not working
Example: "We rolled back, error rate still bad"

STEP 2: Do NOT wait for full validation (that takes time)
Instead: Make a corrective decision immediately

STEP 3: Report the course correction to the team
Example: "Rollback did not help, we are now fixing forward"

STEP 4: Escalate if needed
If the new decision is riskier than the original, escalate to VP

STEP 5: Continue monitoring
Watch for second-order effects from the correction

TIME SAVED BY QUICK COURSE CORRECTION: 15-30 minutes
```

### Incident Post-Mortems: Learning from Wrong Decisions

Bad decisions during incidents are not failures. They are learning opportunities.

The question to ask is not "Why did we make the wrong decision?" (pressure, incomplete information).

The question is "What structure would have prevented this decision?"

Example:
```
Incident: Rolled back, which cascaded failure to dependent service

Post-Mortem questions:
"Why did the IC decide to rollback?" (He had incomplete information)
✓ "What runbook or decision matrix would have surfaced the cascade risk?"

Outcome: Add pre-rollback check to decision matrix:
"Before rollback, verify that no service depends on new behavior"
```

---

## Part 8: Building Judgment (Incident Experience Over Time)

The best incident commanders are not the smartest engineers. They are the engineers who have responded to enough incidents to recognize patterns.

Judgment is learned. Here is how to get there:

### Incident Retrospectives (the Learning Loop)

```
IMMEDIATELY AFTER INCIDENT (30 minutes):
└─ Postmortem meeting with full team
   ├─ What happened (timeline, symptoms, decisions)
   ├─ What worked well (specific decisions, not "good communication")
   ├─ What could be better (runbooks, alerts, decision criteria)
   └─ Follow-ups (implement what could be better)

48 HOURS LATER:
└─ Follow-up on action items
   ├─ Which were completed? (usually: 50-70%)
   ├─ Which are still needed?
   └─ Which are blocked?

QUARTERLY REVIEW:
└─ Category the incident type
   ├─ "This was our 3rd cascade failure in 6 months"
   ├─ "This was our 1st silent data corruption"
   └─ "This pattern keeps happening, needs architectural fix"
```

### Building the Decision Library

Over time, you will see patterns. Document them.

```
After 10 incidents on your team, you have probably seen:
├─ 2 rollback decisions (1 good, 1 bad)
├─ 1-2 failover decisions
├─ 2-3 cascade failures
├─ 1 data corruption incident
└─ 3-4 "unknown" incidents that turned out to be X

After 50 incidents, your IC can recognize and decide faster because
they have lived through similar situations.

This is not genius. It is pattern recognition through experience.
```

---

## Prevention Architecture Loop: Decision Quality to Fewer Incidents

This chapter explains decision quality under pressure. To become architecturally complete, each recurring incident pattern must map to a prevention design.

Use this loop after every postmortem:

1. Identify the failure class that triggered the incident.
2. Identify the design control that would have reduced blast radius.
3. Add the control to architecture backlog with an owner and a date.
4. Verify control efficacy in a simulation, not only in documentation.

| Repeated incident pattern | Prevention design upgrade |
|---|---|
| Rollback caused a secondary outage | Backward-compatible contracts and deployment-order enforcement |
| Failover decision delayed by uncertainty | Tested active-passive runbook with objective cutover criteria |
| Escalation confusion | Single-commander authority model with pre-assigned deputies |
| Data incident discovered late | Continuous integrity checks and tiered data correctness SLOs |
| Identity dependency failure | Token cache layers and degraded read-only operating mode |

### Architect takeaway

Your objective is not perfect incident decisions. Your objective is fewer hard decisions in production.

Design for that objective:

- Encode rollback safety in API and schema contract policy
- Encode failover criteria in measurable thresholds, not judgment alone
- Encode dependency behavior in explicit timeout and fallback contracts

### CTO takeaway

Incidents should change architecture investment priorities in the same quarter.

Treat this as portfolio governance:

- Incident class frequency determines funded prevention themes
- Prevention themes must have named owners and simulation dates
- Quarterly scorecard should include prevention completion rate, not only incident MTTR

---

## Summary: Decisions That Matter

This chapter teaches three things:

1. **Decision frameworks** (what to decide, what the options are)
2. **Decision discipline** (making decisions under pressure without panicking)
3. **Decision learning** (getting better at decisions over time)

The teams that recover fastest are not lucky. They are trained in decision-making under uncertainty.

That training is learnable. Use the frameworks in this chapter. Practice with the playbooks. Learn from your own incidents.

Over time, you will build the judgment to make good decisions when information is incomplete and time is running out.

That judgment is worth more than any runbook.

---

*← [Chapter 10: Execution and the Next Quarter](/book/reliability-survival-guide/000027-reliability-execution-quarterly-plan) | [Chapter 12: Reliability Pricing →](/book/reliability-survival-guide/000029-reliability-pricing-saas-margin-trap)*
