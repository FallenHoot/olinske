---
title: "Appendix: Reliability Operating Artifacts and Policy Templates"
description: "Drop-in templates for SLO and SLI specifications, error budget policy, tiering criteria, CUJ measurement, ADRs, debt ledger, provider incident playbook, and board scorecard."
publishDate: 2026-06-23
tags:
  - cloud-architecture
  - reliability
  - governance
  - finops
status: draft
---

*← [Chapter 12: Reliability Pricing and the SaaS Margin Trap](/posts/000029-reliability-pricing-saas-margin-trap)*

---

This appendix exists to close the implementation gap.

The core chapters define the doctrine. This section provides the operational artifacts required to execute that doctrine in a real enterprise.

## Adoption maturity levels

Most organizations cannot execute this appendix at full fidelity immediately. This system assumes organizational maturity that takes time to build.

Use these levels to assess starting posture and plan progressive adoption.

### Level 1: Service-level SLO (foundational)

- Services have business impact tiers (Tier 1, 2, 3)
- Each Tier 1 service has a defined SLO target (e.g., 99.5%)
- Error budget is calculated but may not gate releases yet
- ADRs exist but may not be formally reviewed monthly

Target timeline: 1-2 quarters to establish across top 20 services.

### Level 2: Journey-level SLI (measurement driven)

- SLI is defined per critical customer journey, not per service
- SLI measurement infrastructure exists (logging, tracing, query capability)
- Burn-rate gating is active for Code Red (feature freeze)
- Burn-rate policy covers Yellow and Orange as advisory (not yet enforced)

Target timeline: 2-3 quarters to build measurement and establish discipline.

### Level 3: Governed system (enforcement ready)

- All four burn-rate levels are active with named consequences
- Reliability ADRs are reviewed monthly with explicit risk acceptance
- Correctness indicators are measured alongside availability
- Debt ledger is tracked with remediation assignments and deadlines

Target timeline: 3-4 quarters to harden governance and build muscle memory.

### Level 4: Economics-optimized (mature)

- Tier-based pricing reflects measured reliability differences
- Customer SLAs are contractual commitments with published SLOs backing them
- Reliability investment decisions are made against ROI, not aspiration
- Provider incident response is practiced and timed

Target timeline: 4+ quarters after governance is solid.

**Guidance:** Most organizations are between Level 1 and Level 2. Do not attempt Level 3 until Level 2 is operationally stable. Enforce maturity progressively, not all at once.

## One-page operating system

Use this page as the default operating contract across leadership, engineering, and finance.

| Layer | Required metric | Consequence if out of bounds |
|---|---|---|
| customer journey | journey SLI and error budget burn | release gating for non-critical changes |
| recovery | RTO and BR target attainment | remediation sprint commitment |
| correctness | reconciliation lag and duplicate rate | data integrity incident path activation |
| governance | debt severity trend and ADR freshness | executive escalation |
| economics | reliability premium versus avoided loss | funding decision refresh |

## Executive summary template

Use this one-page structure for leadership review.

### Reliability stack snapshot

- market constraints
- business risk appetite
- organizational incentives
- architecture posture
- operations posture
- observability posture

### Five non-negotiables

1. Every Tier 1 service has an approved SLO, RTO, RPO, and business recovery target.
2. Every Tier 1 service has a measured customer-journey SLI.
3. Every Tier 1 service has a tested scenario in the last quarter.
4. Burn-rate thresholds have explicit release-gating consequences.
5. Reliability debt is reviewed monthly with named owners.

### Quarterly operating loop

- Month 1: leading-indicator and burn-rate review
- Month 2: simulation and runbook exercise
- Month 3: ADR refresh and executive funding decisions

### Board scorecard fields

- revenue at risk per hour for top three journeys
- error-budget burn by tier
- tested failover coverage by tier
- backup operator coverage for Tier 1 services
- top five concentration risks
- top five reliability debt exposures

## Tiering policy template

### Classification criteria

Use measurable criteria first, then technical context.

#### Tier 1

Classify as Tier 1 if any condition is true:

- estimated business impact exceeds $100,000 per hour of outage
- outage creates legal, regulatory, or contractual breach risk
- outage blocks a primary customer revenue journey

#### Tier 2

Classify as Tier 2 if service degradation is painful but survivable and outage impact is between $10,000 and $100,000 per hour.

#### Tier 3

Classify as Tier 3 if interruption is tolerable with bounded recovery and business impact is below $10,000 per hour.

### Anti-inflation rule

If everything is Tier 1, nothing is Tier 1. Escalations above 30% Tier 1 footprint require executive sign-off with incremental funding.

## SLI specification template

Use this exact skeleton for each SLI.

| Field | Required value |
|---|---|
| SLI name | unique identifier |
| Customer journey | named journey this SLI protects |
| Numerator | successful events count |
| Denominator | eligible events count |
| Inclusion rules | request classes included |
| Exclusion rules | expected exclusions |
| Aggregation window | 1 minute, 5 minute, or 1 hour |
| Data source | telemetry source of record |
| Owner | accountable team |
| Review cadence | weekly or monthly |

## SLO specification template

| Field | Required value |
|---|---|
| Service and tier | service name and approved tier |
| SLO target | percentage target and window |
| Linked SLI | SLI ID from specification |
| Error budget | allowed failure amount and units |
| RTO | maximum recovery time |
| RPO | maximum data loss window |
| BR target | business recovery expectation |
| Risk assumptions | top five assumptions |
| Mitigation controls | controls required to support target |
| Release-gating policy | thresholds and action |
| Owner and approver | engineering owner and business approver |

## Error budget and burn-rate policy template

### Burn-rate thresholds

| Condition | Trigger | Action |
|---|---|---|
| Code Yellow | 7-day projected burn > 50% of monthly budget | freeze risky releases, increase incident review frequency |
| Code Orange | 7-day projected burn > 75% of monthly budget | require director approval for non-critical changes |
| Code Red | monthly budget exhausted | feature freeze for Tier 1, execute recovery and hardening plan |

### Release-gating policy

No major change for Tier 1 services without:

- approved SLO and SLI specification
- tested rollback procedure
- current runbook with named incident roles
- at least one simulation in the previous quarter

### Bypass rule

No enforcement is perfect. Teams will occasionally need to ship a change during a Code Red or Code Orange condition because:

- customer churn risk from feature delay exceeds reliability risk
- strategic deadline is non-negotiable
- incident recovery is time-critical

Bypass is allowed. Bypass must be recorded.

Every bypass decision must:

1. be documented in a reliability ADR with explicit risk statement
2. be signed by both engineering and business leadership
3. include the business justification (customer impact, deadline, recovery plan)
4. trigger a post-mortem review within 5 business days

Repeated bypasses of the same threshold indicate the threshold is misaligned with business reality. Escalate to executive leadership for policy reset.

## Critical user journey measurement template

Define journey-level reliability explicitly.

| Field | Required value |
|---|---|
| Journey name | checkout, sign-in, provisioning, settlement |
| Business criticality | Tier 1, Tier 2, Tier 3 mapping |
| Journey SLI | completion success ratio |
| Journey latency SLI | P95 and P99 target |
| Dependencies | mandatory and optional dependencies |
| Degraded mode definition | minimum acceptable customer behavior |
| Journey error budget | allowed journey disruption budget |
| Coverage KPI | percentage of Tier 1 journeys with full telemetry |

## Availability is not enough: correctness failure

Reliability must include correctness controls. A system can be up and still produce damaging outcomes.

Track at least these correctness indicators for Tier 1 journeys:

- duplicate transaction rate
- reconciliation lag
- stale read exposure window
- idempotency failure rate
- irreversible correction events

Each indicator must be tied to business impact.

- **Duplicate rate:** One duplicate per 10,000 transactions = estimated fraud loss of $5k per month at checkout scale. Escalates if rate increases 10 percent month-over-month.
- **Reconciliation lag:** Lag > 24 hours = customer cannot trust settlement reports. Escalates immediately for payment services.
- **Stale read exposure:** Cached data older than 5 minutes = customer sees outdated balance. Acceptable for account dashboard, not for balance-based decisions.
- **Idempotency failure:** If a retry creates a duplicate instead of returning the original result, it becomes a correctness breach. Measure and escalate alongside availability.

Correctness breaches should use the same escalation path as availability breaches when estimated customer or financial impact exceeds a named threshold (e.g., $10k potential loss for checkout).

## Reliability ADR template

### Header

- ADR ID
- service and tier
- date
- owner
- approver

### Decision

Chosen SLO, RTO, RPO, and BR targets.

### Alternatives considered

At least two options with rationale for rejection.

### Reliability premium

Estimated annual incremental cost by category:

- architecture and redundancy
- observability and telemetry
- operations and on-call
- simulation and governance

### Failure domains covered

- component
- zone
- region
- control plane
- third party
- organization

### Failure domains not covered

Document explicit accepted risk.

### Review triggers

- budget change above 20%
- sustained burn-rate breach
- major dependency change
- incident severity threshold

## Reliability debt ledger template

| Debt ID | Service | Tier | Failure mode amplified | Estimated outage cost | Estimated remediation cost | Owner | Target quarter | Status |
|---|---|---|---|---|---|---|---|---|
| REL-001 | checkout-api | Tier 1 | control-plane failover untested | $280,000 | $45,000 | platform lead | 2026-Q3 | open |

## Provider incident response playbook template

Track tested versus assumed actions.

| Event class | Immediate action | Customer communication action | Recovery action | Tested or assumed |
|---|---|---|---|---|
| Control plane degraded | stop risky changes, enable manual override | publish 30-minute updates | shift to manual control path | tested |
| Region impaired | execute regional failover decision tree | publish impact by journey | run failover or degraded mode plan | tested |
| Status unclear | use internal telemetry as source of truth | communicate uncertainty explicitly | activate conservative traffic policy | assumed |

## Observability retention and sampling policy template

### Retention baseline by tier

| Tier | Logs indexed retention | Logs archive retention | Full trace retention | Sampled trace retention |
|---|---|---|---|---|
| Tier 1 | 30 days | 180 days | 14 days | 90 days |
| Tier 2 | 14 days | 90 days | 7 days | 45 days |
| Tier 3 | 7 days | 30 days | 3 days | 21 days |

### Guardrail

Do not cut retention below the mean time between incidents for that incident class.

### Calculating mean time between incidents

Use the last 12 months of incident history.

**Example:** A checkout service experienced 8 severe incidents in the past 12 months.

- Mean time between incidents (MTBI) = 12 months / 8 incidents = 45 days
- Minimum logs retention for diagnosis = 45 days (indexed logs must be searchable for that duration)
- Minimum full trace retention = 30 days (enough to correlate traces across a typical incident window)
- Archive retention = 6+ months (for post-incident analysis and trend detection)

If you have fewer than 3 incidents in 12 months, use 90 days as the minimum.

If you cannot calculate MTBI because incident records are missing, use 30 days as the safe default for Tier 1.

**Cost discipline rule:** Other observability (dashboards, sampled traces, secondary logs) can be cut aggressively. SLI-critical retention cannot.

## Worked financial example template

### Inputs

- Journey: digital checkout
- Estimated outage impact: $180,000 per hour
- Current expected severe outage exposure: 4 hours per year
- Proposed reliability premium: $220,000 annually

### Expected loss comparison

- current expected annual outage loss = $180,000 x 4 = $720,000
- expected annual loss after controls (1.5 hours) = $180,000 x 1.5 = $270,000
- gross avoided loss = $450,000
- net benefit after premium = $450,000 - $220,000 = $230,000

### Decision rule

Adopt if net benefit is positive and concentration risk is reduced in critical domains.

## Reliability week entry and exit criteria

### Entry criteria

- tiering list refreshed in last 30 days
- Tier 1 ownership confirmed
- runbooks available for scoped services
- simulation scenarios pre-approved

### Exit criteria

- all scenarios executed or explicitly deferred with owner
- risk decisions documented in ADR updates
- debt ledger updated with remediation commitments
- executive package reviewed and approved

### Failure handling rule

If exit criteria are not met, quarter-end status is red and leadership must approve either:

- immediate remediation funding
- documented risk acceptance with expiration date

## Implementation sequence

1. Apply tiering policy to top 20 services.
2. Publish SLI and SLO specifications for all Tier 1 services.
3. Activate burn-rate gating policy.
4. Stand up reliability debt ledger and monthly review.
5. Run reliability week and publish executive scorecard.

This appendix is meant to be copied, adapted, and used immediately.
