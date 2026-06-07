---
title: 'Reading Paths – Start Here Based on Your Role'
description: >-
  Not everyone needs to read the entire book. Pick your role. Follow the reading
  path. Get the insights that matter for your job.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - incident-response
  - operations
  - guide
status: published
copyright: © 2026 Zach Olinski. All rights reserved.
licenseUrl: 'https://olinske.com/docs/COPYRIGHT.md'
attributionRequired: true
commercialUsePermitted: false
---

# Reading Paths – Which Path Is Yours?

Not everyone reads a reliability book the same way. An on-call engineer needs actionable guides. A CTO needs economic reasoning. An architect needs design patterns.

**Pick your role. Read the chapters in order. You will have the insights you need.**

**Note:** For term definitions, see [Glossary](/book/reliability-survival-guide/glossary-reliability-terms).

---

## ROLE 1: On-Call Engineer

**Your job:** Respond to pages at 2 AM. Fix the problem. Go back to sleep.

**What you need:** Triage procedures. Playbooks. Decision matrices. Hands-on fixes.

**Reading time:** 2-3 hours

---

### START HERE: The Crisis Reference Cards

[**Appendix A: Crisis Reference Cards**](/book/reliability-survival-guide/appendix-a-crisis-reference-cards)

Print these. Laminate them. Put them in your pocket.

This is everything you need to triage an incident in the first 2 minutes. Triage decision tree. Escalation ladder. Deployment decisions. Service failures. Latency issues. Data corruption. Cascade failures. Role clarity. Recovery validation. Symptom index.

**Time:** 30 minutes to read, 5 minutes to use during an incident.

---

### NEXT: The Field Playbooks

[**Appendix C: Field Playbooks**](/book/reliability-survival-guide/appendix-c-field-playbooks)

Five specific failure scenarios you will encounter:
- Identity system down
- Database replication lag
- Cascade failures
- Bad deployment → rollback
- Provider regional outage → failover

Each one is a step-by-step procedure. Follow them in order.

**Time:** 1 hour to read, 15-30 minutes to execute during an incident.

---

### THEN: The Immediate Response Guide

[**Chapter 0: The First 24 Hours – Incident Triage and Immediate Action**](/book/reliability-survival-guide/000036-first-24-hours-incident-triage)

This is your full incident response playbook. Decision trees. Immediate actions (minutes 0-10). Role definitions. Decision matrices for rollback and failover. Escalation procedures. Common playbooks. Recovery checklist.

**Time:** 1.5 hours to read.

---

### OPTIONAL: The Operational Artifacts

[**Appendix B: Operational Artifacts and Templates**](/book/reliability-survival-guide/appendix-b-operational-artifacts)

Use this to build your service's runbooks, dependency maps, and monitoring queries.

**Time:** 2-3 hours to customize for your services.

---

### Your Incident Response Workflow

When pager goes off:
1. Grab **Appendix A** (crisis cards)
2. Run the triage tree (2 minutes max)
3. Flip to the relevant playbook in **Appendix C** or **Chapter 0**
4. Execute the steps
5. Update status every 3 minutes
6. If it is weird, escalate to the on-call tech lead

---

## ROLE 2: Architect

**Your job:** Design systems that don't fail. Or fail gracefully.

**What you need:** Design patterns. Failure mode analysis. Trade-off reasoning. Dependency mapping.

**Reading time:** 4-5 hours

---

### START HERE: The Economics Foundation

[**Chapter 1: Reliability is an Economic Decision**](/book/reliability-survival-guide/000017-reliability-is-an-economic-decision)

Skip the rest of the book if you only read one chapter. This explains why you are designing for reliability. Not because it is virtuous. Because it is profitable.

Understand the trade-offs:
- How much reliability costs
- How much downtime costs
- Where to invest, where to skip

**Time:** 1 hour.

---

### THEN: The Failure Modes

Read these three chapters in sequence. They explain what actually breaks:

[**Chapter 3: The Things That Actually Break**](/book/reliability-survival-guide/000031-the-things-that-actually-break)

Not what you think breaks. What actually does break in production. Based on real incidents.

**Time:** 45 minutes.

---

[**Chapter 5a: Identity – The System Kill Switch**](/book/reliability-survival-guide/000032-identity-tier-zero-spof)

Identity failures disable everything downstream. Yet most teams miss identity as a Tier-0 failure domain. This chapter shows why and how to design for identity resilience.

Learn:
- Identity failure modes
- Fallback patterns (2-hour cached token strategy)
- Degraded-mode authentication
- Detection and monitoring
- Gameday scenarios

**Time:** 1 hour.

---

[**Chapter 6b: Silent Outages – When Data Corruption Looks Like Success**](/book/reliability-survival-guide/000033-silent-outages-data-corruption)

The most dangerous failures are silent: data corruption, inconsistency, partial writes. Your system looks fine while integrity degrades.

Learn:
- Six silent failure patterns
- Detection queries by database type (SQL, MongoDB, DynamoDB, Redis, SQS)
- Consistency verification strategies
- Monitoring approaches
- Real incident examples

**Time:** 1.5 hours.

---

### THEN: The Change/Deployment Pattern

[**Chapter 7b: Change – The Failure You Deploy Yourself**](/book/reliability-survival-guide/000035-change-primary-failure-source)

Most outages are caused by change: deployments, configuration updates, operational decisions. This chapter shows why and how to design for safe change.

Learn:
- Deployment failure modes
- Safe deployment checklist (3-phase process)
- Rollback decision matrix
- Kill switch design (feature flags, blue-green, canary, rolling)
- Metrics that matter

**Time:** 1.5 hours.

---

### OPTIONAL: Deep Dives

If you want to go deeper, Chapter 2 (incentives) and Chapter 9 (governance) explain the organizational context. Skip them unless you are designing systems at a larger scale.

---

### Your Architecture Design Checklist

Before you ship a new service, verify:

1. **Failure modes identified?** (Read Chapter 3, think about your system)
2. **Identity resilience?** (Chapter 5a - can it work if identity is down?)
3. **Silent failure detection?** (Chapter 6 - what queries would you run?)
4. **Safe deployment?** (Chapter 7b - what is your kill switch?)
5. **Economics validated?** (Chapter 1 - does uptime investment make sense?)

---

## ROLE 3: CTO / Engineering Leader

**Your job:** Make investment decisions. Trade off reliability vs. cost vs. speed. Set team culture.

**What you need:** Economic reasoning. Organizational incentives. Long-term strategy. Governance patterns.

**Reading time:** 5-6 hours (or read it over a week)

---

### START HERE: The Economic Thesis

[**Chapter 1: Reliability is an Economic Decision**](/book/reliability-survival-guide/000017-reliability-is-an-economic-decision)

This is your foundation. Understand why you invest in reliability and where to draw the line.

This chapter alone will change how your org talks about reliability.

**Time:** 1 hour.

---

### THEN: Understanding Your Organization

[**Chapter 2: Systems Fail According to Incentives**](/book/reliability-survival-guide/000019-systems-fail-according-to-incentives)

Your team is not building unreliable systems. Your incentives are rewarding unreliable systems. This chapter shows the incentive structures that lead to failure.

Learn:
- How incentives drive reliability decisions
- Common incentive misalignment patterns
- How to measure what you care about
- Organizational anti-patterns

**Time:** 45 minutes.

---

[**Chapter 4: The Financial Model**](/book/reliability-survival-guide/000021-reliability-equation-financial-model)

Put numbers to reliability. How do you calculate the economics? What levers do you have?

Learn:
- Revenue impact of downtime
- Cost of different reliability levels
- ROI on reliability investment
- Multi-region and multi-tier trade-offs

**Time:** 1 hour.

---

### THEN: Understand What Actually Breaks

[**Chapter 3: The Things That Actually Break**](/book/reliability-survival-guide/000031-the-things-that-actually-break)

You need to know what your org is optimizing for. This chapter shows what actually fails in production.

**Time:** 45 minutes.

---

### THEN: Build Governance Systems

[**Chapter 9: Governance and Risk**](/book/reliability-survival-guide/000026-reliability-governance-adr-ledger-indicators)

You cannot just hope for reliability. You need systems that make it automatic. Architecture decision records. Audit logs. Indicators that flag risk early.

Learn:
- Governance system design
- How to enforce policy without being a police state
- Risk indicators
- Escalation procedures

**Time:** 1 hour.

---

### THEN: Execution

[**Chapter 10: Quarterly Execution**](/book/reliability-survival-guide/000027-reliability-execution-quarterly-plan)

Reliability improvements need to be planned and tracked. This chapter shows how to weave reliability into your normal quarterly planning.

**Time:** 45 minutes.

---

### OPTIONAL: Deep Dives

- **Chapter 5a (Identity):** If you have identity failures, read this.
- **Chapter 6b (Silent Outages):** If you have data integrity issues, read this.
- **Chapter 7b (Change):** If you have frequent deployment issues, read this.

---

### Your Leadership Action Plan

After reading these chapters:

1. **Audit incentives:** Do your KPIs reward reliable systems or fast delivery? (Ideally both.)
2. **Calculate economics:** What is your break-even point? How much uptime is worth it?
3. **Build governance:** What decision frameworks will you enforce?
4. **Plan quarterly work:** What reliability improvements go into the backlog?
5. **Communicate:** Help your org understand why you are investing in reliability.

---

## ROLE 4: SRE Lead / Platform Engineer

**Your job:** Build and scale the reliability infrastructure. Stand up observability. Define runbooks. Lead gamedays.

**What you need:** Deep technical patterns. Operational artifacts. Monitoring strategies. Team-building insights.

**Reading time:** 6-7 hours (or read it over two weeks)

---

### START HERE: The Full Trilogy

This is the complete reading path for SRE leads. Read in order:

**Chapter 0: First 24 Hours** → **Chapter 11: Incident Triage & Response** → **Appendices A, B, C**

Then the deep-dive chapters on specific domains.

---

### PHASE 1: Incident Response (2 hours)

[**Chapter 0: The First 24 Hours**](/book/reliability-survival-guide/000036-first-24-hours-incident-triage)

Your North Star for incident response. This is what your team should be doing.

**Time:** 1 hour.

---

[**Chapter 11: Incident Triage & Response Protocols**](/book/reliability-survival-guide/000037-incident-triage-response-protocols)

The advanced playbook. OODA loops. Medical triage models. Decision matrices. Escalation procedures. Role clarity.

Use this to train your team on how to make decisions under pressure.

**Time:** 1 hour.

---

### PHASE 2: Operational Artifacts (2-3 hours)

[**Appendix A: Crisis Reference Cards**](/book/reliability-survival-guide/appendix-a-crisis-reference-cards)

Use these as a template for building your org's laminate-able cards.

**Time:** 1 hour to customize for your services.

---

[**Appendix B: Operational Artifacts**](/book/reliability-survival-guide/appendix-b-operational-artifacts)

This is your toolkit. Templates for:
- Service runbooks
- Dependency maps
- SPOF inventories
- Silent failure detection queries
- Recovery checklists
- Economics cards
- Escalation contacts

Adapt each template for your services. This is where the theoretical knowledge becomes operational.

**Time:** 2-3 hours to build templates for each critical service.

---

[**Appendix C: Field Playbooks**](/book/reliability-survival-guide/appendix-c-field-playbooks)

Five specific failure scenarios. Use these to train your team. Run gamedays based on these.

**Time:** 1 hour to customize for your environment.

---

### PHASE 3: Deep Dives by Domain (2-3 hours)

Pick the chapters that apply to your biggest current pain:

---

[**Chapter 5a: Identity Resilience**](/book/reliability-survival-guide/000032-identity-tier-zero-spof)

If your org has identity issues:
- Detection queries (code examples)
- 2-hour fallback implementation pattern
- Degraded-mode authentication
- Gameday procedures

**Time:** 1 hour.

---

[**Chapter 6b: Silent Outages**](/book/reliability-survival-guide/000033-silent-outages-data-corruption)

If your org has data integrity issues:
- 50+ detection queries by database type
- Consistency verification procedures
- Real incident examples
- Monitoring frequency recommendations

This chapter is heavy. Use it to build your data consistency monitoring.

**Time:** 2 hours.

---

[**Chapter 7b: Safe Deployment**](/book/reliability-survival-guide/000035-change-primary-failure-source)

If your org has frequent deployment incidents:
- 3-phase safe deployment checklist
- Rollback decision matrix
- Kill switch design patterns
- Metrics to track

Use this to evaluate your current deployment process.

**Time:** 1.5 hours.

---

### Your SRE Playbook

After reading, build:

1. **Team Training:** Use Chapter 0 + Appendix A to train on incident response
2. **Operational Artifacts:** Customize Appendix B for each critical service
3. **Gameday Scenarios:** Use Appendix C to run monthly incident simulations
4. **Monitoring:** Use Chapter 6 queries to build silent failure detection
5. **Deployment Safety:** Use Chapter 7b to evaluate your current deployment process

---

## ROLE 5: Team Lead / Engineering Manager

**Your job:** Help your team execute. Grow them. Remove obstacles. Manage workload and quality.

**What you need:** Pragmatic guidance. Trade-off thinking. Coaching material. Team-building patterns.

**Reading time:** 3-4 hours

---

### START HERE: The Economics

[**Chapter 1: Reliability is an Economic Decision**](/book/reliability-survival-guide/000017-reliability-is-an-economic-decision)

You need to understand why you are investing in reliability. Use this chapter to educate your team on the economic thinking behind reliability decisions.

**Time:** 45 minutes.

---

### THEN: Understand Incentives

[**Chapter 2: Systems Fail According to Incentives**](/book/reliability-survival-guide/000019-systems-fail-according-to-incentives)

Your team's behavior is driven by incentives. Make sure you are not rewarding unreliable systems.

Use this to audit your team's KPIs and sprint goals.

**Time:** 45 minutes.

---

### THEN: Know What Breaks

[**Chapter 3: The Things That Actually Break**](/book/reliability-survival-guide/000031-the-things-that-actually-break)

What are your team's actual risks? What breaks in your systems?

Have your team read this and identify your top 5 failure modes.

**Time:** 45 minutes (read with team).

---

### THEN: Build Team Execution Rituals

[**Chapter 9: Governance**](/book/reliability-survival-guide/000026-reliability-governance-adr-ledger-indicators)

How do you make reliability automatic, not aspirational? This chapter shows governance patterns.

**Time:** 45 minutes.

---

### THEN: Plan Quarterly Work

[**Chapter 10: Quarterly Execution**](/book/reliability-survival-guide/000027-reliability-execution-quarterly-plan)

How do you weave reliability into sprint planning? This chapter shows how to make it part of your normal cadence.

**Time:** 45 minutes.

---

### OPTIONAL: Specific Guidance

Based on your team's pain points:

- **If you have on-call burnout:** Read Chapter 0 + run gamedays using Appendix C
- **If you have identity issues:** Have an architect read Chapter 5a deeply
- **If you have data integrity issues:** Have a senior engineer read Chapter 6 deeply
- **If you have deployment issues:** Read Chapter 7b and evaluate your process

---

### Your Team Leadership Actions

After reading:

1. **Audit incentives:** Do you reward fast shipping or reliable shipping? (Both?)
2. **Communicate context:** Help your team understand why reliability matters
3. **Plan quarterly work:** Include reliability improvements in your backlog
4. **Build execution ritual:** Make incident response training part of your cycle
5. **Coach for resilience:** Use the chapters to help your team grow

---

## READING PATHS SUMMARY

| Role | Start Here | Key Chapters | Time |
|---|---|---|---|
| **On-Call Engineer** | Appendix A | Appendix C, Chapter 0 | 2-3 hours |
| **Architect** | Chapter 1 | Chapters 3, 5a, 6b, 7b | 4-5 hours |
| **CTO** | Chapter 1 | Chapters 2, 4, 9, 10 | 5-6 hours |
| **SRE Lead** | Chapter 0 | Appendices A/B/C + deep dives | 6-7 hours |
| **Team Lead** | Chapter 1 | Chapters 2, 3, 9, 10 | 3-4 hours |

---

## Starting Your Organization's Journey

**Month 1:**
- [ ] CTO reads Chapters 1-2, 4
- [ ] Architects read Chapter 3, pick one deep-dive (5a, 6b, or 7b)
- [ ] SRE lead reads Chapters 0-11, Appendix A

**Month 2:**
- [ ] Team leads read Chapters 1-2, 9
- [ ] Build Appendix B templates for your critical services
- [ ] Run first gameday using Appendix C

**Month 3:**
- [ ] Engineers read their role's reading path
- [ ] Conduct quarterly planning with reliability improvements in backlog
- [ ] Run second gameday (different scenario)

**Ongoing:**
- [ ] Monthly gamedays (one per scenario in Appendix C)
- [ ] Quarterly reliability improvements (from Chapter 10 execution plan)
- [ ] Incident reviews + feedback into templates (Appendix B)

---

*This is your roadmap. Pick your role. Start reading. Your reliability journey begins now.*
