---
title: 'The Reliability Survival Guide - Complete Table of Contents'
description: >-
  The complete structure of the Reliability Survival Guide. Choose your reading
  path based on your role, or read sequentially for the full philosophy.
publishDate: '2026-06-06'
tags:
  - cloud-architecture
  - reliability
  - guide
status: published
---

# The Reliability Survival Guide

**A philosophy for building systems that survive.**

This guide contains everything you need to understand reliability economics, design for failure, respond to incidents, and build operational excellence.

**Book overview:** [Reliability Survival Guide](/reliability-survival-guide/)

---

## Quick Start: Choose Your Path

**Not sure where to begin?** Pick your role:

| Role | Start Here | Time |
|---|---|---|
| **On-Call Engineer** | [Appendix A: Crisis Cards](/posts/APPENDIX-A-crisis-reference-cards) → [Appendix C: Playbooks](/posts/APPENDIX-C-field-playbooks) → [Chapter 0](/posts/000036-first-24-hours-incident-triage) | 2-3 hrs |
| **Architect** | [Chapter 1](/posts/000017-reliability-is-an-economic-decision) → [Chapter 3](/posts/000031-the-things-that-actually-break) → [Chapters 5-7](/posts/000032-identity-tier-zero-spof) | 4-5 hrs |
| **CTO / Leader** | [Chapter 1](/posts/000017-reliability-is-an-economic-decision) → [Chapter 2](/posts/000019-systems-fail-according-to-incentives) → [Chapter 9](/posts/000026-reliability-governance-adr-ledger-indicators) | 5-6 hrs |
| **SRE / Platform** | [Full reading path](/posts/READING-PATHS#role-4-sre-lead--platform-engineer) | 6-7 hrs |
| **Team Lead** | [Full reading path](/posts/READING-PATHS#role-5-team-lead--engineering-manager) | 3-4 hrs |

**→ See [Reading Paths](/posts/READING-PATHS) for detailed role-based guides.**

---

## PART 1: The Economics Foundation

Why you invest in reliability at all.

### [Chapter 1: Reliability is an Economic Decision](/posts/000017-reliability-is-an-economic-decision)

Start here. Reliability is not virtuous or aspirational. It is an investment with a clear cost-benefit analysis. This chapter shows you how to do it.

- Why reliability costs money
- How downtime loses money
- The break-even threshold
- When to invest, when to skip

---

### [Chapter 2: Systems Fail According to Incentives](/posts/000019-systems-fail-according-to-incentives)

Your team is not building unreliable systems. Your incentives are rewarding unreliable systems. This chapter reveals the structural problems.

- How incentive misalignment breeds failure
- Common organizational anti-patterns
- What to measure
- How to align for reliability

---

### [Chapter 4: The Reliability Equation—A Financial Model](/posts/000021-reliability-equation-financial-model)

Put numbers to reliability. Calculate ROI.

- Revenue per minute of uptime
- Cost of different SLAs
- Multi-region economics
- When to take the bet

---

## PART 2: What Breaks and Why

The failure modes you will actually encounter.

### [Chapter 3: The Things That Actually Break](/posts/000031-the-things-that-actually-break)

Not theories. Real incidents. Real outages.

- Silent failures
- Cascade failures
- Hidden dependencies
- Provider failures

---

### [Chapter 5: Identity—The System Kill Switch](/posts/000032-identity-tier-zero-spof)

Identity failures disable everything downstream. Most teams miss identity as a primary failure domain.

- Why identity is Tier-0
- Token refresh cascades
- Fallback architectures
- Detection and monitoring
- 2-hour degraded mode implementation

---

### [Chapter 6: Silent Outages—When Data Corruption Looks Like Success](/posts/000033-silent-outages-data-corruption)

Your system returns 200 OK. Your data is corrupted.

- Six silent failure patterns
- 50+ detection queries (PostgreSQL, MySQL, DynamoDB, Redis, SQS)
- Consistency verification
- Real incident examples
- Monitoring frequency models (Tier 1/2/3)

---

### [Chapter 7a: How You See (and Miss) Reality](/posts/000034-reliability-illusions)

Your monitoring is incomplete. Here is why and what to do.

- Observability vs. reliability
- Common blind spots
- Metric design patterns
- Alarm thresholds

---

### [Chapter 7: Change—The Failure You Deploy Yourself](/posts/000035-change-primary-failure-source)

Most outages are caused by change. Deployments, config updates, migrations. Design for it.

- Safe deployment checklist (3-phase, 40+ checks)
- Rollback decision matrix (by deployment age vs. metrics)
- Deployment kill switches (blue-green, canary, rolling, feature flag)
- 4 deployment patterns with examples
- Detection metrics that matter

---

## PART 3: Incidents and Crises

When things go wrong, use these immediately.

### [CRISIS REFERENCE: Chapter 0 – The First 24 Hours](/posts/000036-first-24-hours-incident-triage)

**Your North Star for incident response.**

Use this when the pager goes off.

- 2-minute triage tree (yes/no questions)
- Minutes 0-10 procedures
- Incident roles and authority (IC, Tech Lead, Comms)
- Decision matrices (rollback, failover)
- Escalation procedures
- Common playbooks
- Recovery validation checklist

---

### [ADVANCED: Chapter 11 – Incident Triage & Response Protocols](/posts/000037-incident-triage-response-protocols)

Advanced incident response patterns.

- OODA loop application (Observe → Orient → Decide → Act)
- Medical triage classification (RED/YELLOW/GREEN/BLACK)
- Escalation criteria
- Detailed decision matrices with postmortem examples
- Role clarity in practice
- Communication patterns

---

### [APPENDIX A: Crisis Reference Cards](/posts/APPENDIX-A-crisis-reference-cards)

**Print these. Laminate them. Put them on your desk.**

11 one-page quick-reference cards for war room use:

1. Incident triage tree
2. Escalation ladder
3. Deployment decision tree
4. Service failure triage
5. Latency triage
6. Traffic loss diagnosis
7. Data corruption response
8. Cascade failure handling
9-11. Role cards (IC, Tech Lead, Comms)

Plus symptom index and recovery validation checklist.

---

### [APPENDIX C: Field Playbooks—Scenario-Specific Response](/posts/APPENDIX-C-field-playbooks)

Five specific failure scenarios with step-by-step procedures.

1. **Identity System Down** → degraded mode activation, recovery validation
2. **Database Replication Lag** → blockage detection, kill long queries
3. **Cascade Failure** → identify root cause, isolate, fix bottom-up
4. **Bad Deployment** → rollback decision matrix, execution, validation
5. **Provider Regional Outage** → failover decision, DNS cutover, gradual failback

---

## PART 4: Building Operational Excellence

How to make reliability automatic, not aspirational.

### [Chapter 8: Tradeoffs—On-Call Burden, FinOps, and When to Invest](/posts/000025-reliability-tradeoffs-on-call-finops)

The trade-offs you have to make.

- On-call costs
- FinOps and reliability alignment
- Sunk cost fallacies
- When NOT to invest

---

### [Chapter 9: Governance, ADRs, and Risk Ledgers](/posts/000026-reliability-governance-adr-ledger-indicators)

How to make reliability decisions stick.

- Architecture decision records (ADRs)
- Risk audit logs
- Early warning indicators
- Governance that scales

---

### [Chapter 10: Quarterly Execution](/posts/000027-reliability-execution-quarterly-plan)

How to weave reliability into your sprint planning.

- Quarterly planning framework
- Reliability work prioritization
- Metrics that matter
- Tracking and review

---

### [APPENDIX B: Operational Artifacts & Templates](/posts/APPENDIX-B-operational-artifacts)

Copy-paste ready templates for building your operational runbooks.

1. **Service Runbook** – Quick facts, overview, diagnosis trees, incident procedures, escalation
2. **Dependency Map** – Inbound/outbound services, failure modes, cascades, deployment implications
3. **SPOF Inventory** – Current single points of failure, redundancy status, ROI analysis
4. **Silent Failure Detection Checklist** – 7 SQL queries, daily schedule, alert conditions
5. **Post-Incident Recovery Validation** – 10-min technical, 30-min data integrity, 60-min operational checks
6. **Economics Decision Card** – ROI matrix for infrastructure investments
7. **Escalation Contact Card** – Print & laminate, all contacts and procedures

---

## READING ORDER BY ROLE

### For On-Call Engineers:
1. [Appendix A: Crisis Cards](/posts/APPENDIX-A-crisis-reference-cards) (30 min)
2. [Appendix C: Field Playbooks](/posts/APPENDIX-C-field-playbooks) (1 hour)
3. [Chapter 0: First 24 Hours](/posts/000036-first-24-hours-incident-triage) (1.5 hours)

**Total: 2-3 hours to master incident response.**

---

### For Architects:
1. [Chapter 1: Economics](/posts/000017-reliability-is-an-economic-decision) (1 hour)
2. [Chapter 3: Things That Actually Break](/posts/000031-the-things-that-actually-break) (45 min)
3. [Chapter 5b: Identity](/posts/000032-identity-tier-zero-spof) (1 hour)
4. [Chapter 6b: Silent Outages](/posts/000033-silent-outages-data-corruption) (1.5 hours)
5. [Chapter 7b: Change](/posts/000035-change-primary-failure-source) (1.5 hours)

**Total: 4-5 hours to design reliable systems.**

---

### For CTOs & Leaders:
1. [Chapter 1: Economics](/posts/000017-reliability-is-an-economic-decision) (1 hour)
2. [Chapter 2: Incentives](/posts/000019-systems-fail-according-to-incentives) (45 min)
3. [Chapter 4: Financial Model](/posts/000021-reliability-equation-financial-model) (1 hour)
4. [Chapter 9: Governance](/posts/000026-reliability-governance-adr-ledger-indicators) (1 hour)
5. [Chapter 10: Quarterly Execution](/posts/000027-reliability-execution-quarterly-plan) (45 min)

**Total: 5-6 hours to set organizational strategy.**

---

### For SRE Leads & Platform Engineers:
Read the full book over 1-2 weeks. Focus on Appendices A/B/C for operational artifacts.

---

### For Team Leads:
1. [Chapter 1: Economics](/posts/000017-reliability-is-an-economic-decision)
2. [Chapter 2: Incentives](/posts/000019-systems-fail-according-to-incentives)
3. [Chapter 3: Things That Break](/posts/000031-the-things-that-actually-break)
4. [Chapter 9: Governance](/posts/000026-reliability-governance-adr-ledger-indicators)
5. [Chapter 10: Quarterly Execution](/posts/000027-reliability-execution-quarterly-plan)

**Total: 3-4 hours to coach your team.**

---

## COMPLETE CHAPTER LIST

| # | Title | File | Purpose |
|---|---|---|---|
| 0 | The First 24 Hours—Incident Triage | [000036](/posts/000036-first-24-hours-incident-triage) | Immediate action procedures |
| 1 | Reliability Is an Economic Decision | [000017](/posts/000017-reliability-is-an-economic-decision) | Foundational thesis |
| 2 | Systems Fail According to Incentives | [000019](/posts/000019-systems-fail-according-to-incentives) | Organizational alignment |
| 3 | The Things That Actually Break | [000031](/posts/000031-the-things-that-actually-break) | Real failure modes |
| 3b | Shared Responsibility, Accountability Vacuum | [000020](/posts/000020-shared-responsibility-accountability-vacuum) | Accountability structure |
| 4 | The Reliability Equation | [000021](/posts/000021-reliability-equation-financial-model) | Financial modeling |
| 5a | Provider Failures as System Constraints | [000022](/posts/000022-provider-failures-status-pages) | External dependency risk |
| 5b | Identity—The System Kill Switch | [000032](/posts/000032-identity-tier-zero-spof) | Tier-0 architecture |
| 6a | Partial Failure and Control Plane Failures | [000023](/posts/000023-partial-failure-control-plane-failures) | Failure behavior |
| 6b | Silent Outages—Data Corruption | [000033](/posts/000033-silent-outages-data-corruption) | Detection patterns |
| 7a | How You See (and Miss) Reality | [000034](/posts/000034-reliability-illusions) | Observability blind spots |
| 7b | Change—The Failure You Deploy | [000035](/posts/000035-change-primary-failure-source) | Safe deployment |
| 7c | The Hidden Cost of Reliability Tooling | [000024](/posts/000024-hidden-cost-reliability-tooling) | Tooling economics |
| 8 | Reliability Trade-offs | [000025](/posts/000025-reliability-tradeoffs-on-call-finops) | Cost, burnout, and reliability |
| 9 | Reliability Governance | [000026](/posts/000026-reliability-governance-adr-ledger-indicators) | Organizational systems |
| 10 | Reliability Execution | [000027](/posts/000027-reliability-execution-quarterly-plan) | Planning and tracking |
| 11 | Incident Triage and Response Protocols | [000037](/posts/000037-incident-triage-response-protocols) | Advanced procedures |
| 12 | Reliability Pricing and the SaaS Margin Trap | [000029](/posts/000029-reliability-pricing-saas-margin-trap) | Commercial model |
| 13 | Reliability Maturity and Organizational Adoption | [000030](/posts/000030-reliability-maturity-organizational-adoption) | Adoption strategy |

---

## APPENDICES

| Name | File | Purpose |
|---|---|---|
| A | Crisis Reference Cards | War room quick reference |
| B | Operational Artifacts | Templates for your services |
| C | Field Playbooks | Step-by-step procedures |

---

## SUPPLEMENTARY GUIDES

| Name | Purpose |
|---|---|
| [Reading Paths](/posts/READING-PATHS) | Role-based entry points and sequencing |
| [Table of Contents](#) | This document |

---

## How to Use This Guide

**If you have 30 minutes:**
- Read [Chapter 1: Economics](/posts/000017-reliability-is-an-economic-decision)

**If you have 1 hour:**
- Grab [Appendix A: Crisis Cards](/posts/APPENDIX-A-crisis-reference-cards)
- Bookmark it for next incident

**If you have 3 hours:**
- Follow your role's reading path (see above)

**If you have a week:**
- Read the entire guide sequentially
- Your reliability thinking will fundamentally change

---

## Getting Started

1. **Pick your role** (on-call, architect, CTO, SRE, team lead)
2. **Go to [Reading Paths](/posts/READING-PATHS)**
3. **Follow the suggested order**
4. **Share with your team**

---

*The Reliability Survival Guide © 2026 Zach Olinski. All rights reserved.*
