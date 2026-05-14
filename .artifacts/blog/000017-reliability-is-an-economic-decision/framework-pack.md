# Framework Pack: Reliability ADR

## Position

Most organizations do not need a separate ADR system for reliability. They need to extend their existing ADRs so reliability trade-offs are visible, reviewable, and revisitable.

If the team already has an ADR template, add a short reliability section to it. If the team has no ADR practice, use the template below as the starting point.

## When to write a reliability ADR

Write or update an ADR when a team:

- sets or changes a service SLO
- chooses between single-region, multi-zone, multi-region, or active-active design
- weakens or strengthens observability retention or sampling
- accepts a longer RTO or RPO than the business previously expected
- removes resilience controls for cost reasons
- promises a customer-facing uptime or recovery target

## Reliability ADR template

```md
# ADR-0XX: Reliability target for <service name>

## Status
Proposed | Accepted | Superseded by ADR-0YY

## Context
- Business purpose of the service:
- Customer or revenue impact if unavailable:
- Current scale assumptions:
- Contractual or regulatory expectations:

## Decision
- Service tier:
- Target SLO:
- RTO:
- RPO:
- BR expectation:
- Chosen architecture posture:

## Reliability rationale
- Why this target and not a lower one:
- Why this target and not a higher one:
- Failure domains modeled:
- Controls funded to support this target:

## Alternatives considered
- Lower-cost alternative rejected:
- Higher-reliability alternative rejected:
- Reason each was rejected:

## Economic rationale
- Estimated direct outage cost per hour:
- Estimated indirect outage cost factors:
- Annual resilience premium accepted:
- Operational burden accepted:

## Consequences
- What becomes safer:
- What remains risky:
- What assumptions must remain true:

## Review triggers
- Revisit if ARR exceeds:
- Revisit if regulated customers increase:
- Revisit if incident severity threshold is crossed:
- Revisit if monthly reliability cost exceeds:

## Owner and approver
- Engineering owner:
- Product owner:
- Finance or leadership approver:
```

## Example: Why this product is 99.9% and not 99.99%

```md
# ADR-014: Reliability target for Internal Supplier Portal API

## Status
Accepted

## Context
- The API supports internal supplier onboarding and document lookup.
- It is business-important but not directly on the revenue path.
- Users can tolerate short interruptions during business hours.
- No external uptime commitment exists in customer contracts.

## Decision
- Service tier: Tier 2
- Target SLO: 99.9%
- RTO: 4 hours
- RPO: 4 hours
- BR expectation: No measurable external revenue impact after restoration
- Chosen architecture posture: Single region, zone-redundant application tier, daily backup, manual failover

## Reliability rationale
- 99.9% is high enough to prevent normal operational churn from becoming a business issue.
- 99.99% was rejected because the additional controls required cross-region failover, longer observability retention, and deeper on-call coverage that the business could not justify.
- 99.5% was rejected because repeated daytime interruptions would materially slow supplier operations and create procurement delays.
- Failure domains modeled: component, zone, region, identity dependency, and organizational dependency on one primary operator.
- Controls funded: zone redundancy, synthetic health check, 30-day logs, tested restore runbook, backup operator.

## Alternatives considered
- Lower-cost alternative rejected: single-zone deployment with backup-only recovery.
- Higher-reliability alternative rejected: multi-region active-passive with continuous replication.
- Lower-cost option rejected because zonal failure would likely exceed tolerated downtime.
- Higher-reliability option rejected because estimated annual resilience premium exceeded modeled business value.

## Economic rationale
- Estimated direct outage cost per hour: low, mostly internal productivity loss.
- Estimated indirect outage cost factors: supplier delay, support burden, procurement backlog.
- Annual resilience premium accepted: moderate.
- Operational burden accepted: normal business-hours support plus on-call escalation.

## Consequences
- Normal incidents can be recovered within funded operating capability.
- Regional outage remains a material residual risk.
- The model assumes the portal remains internal-only and does not become customer-facing.

## Review triggers
- Revisit if the portal becomes partner-facing.
- Revisit if supplier volume doubles.
- Revisit after two severity-2 incidents in two quarters.
- Revisit if cost of delays exceeds the premium required for multi-region protection.

## Owner and approver
- Engineering owner: Platform lead
- Product owner: Procurement systems manager
- Finance or leadership approver: Director of operations
```

## Example: Why this product is 99.99% and not 99.9%

```md
# ADR-021: Reliability target for Customer Checkout API

## Status
Accepted

## Context
- The API is directly on the revenue path.
- Outage immediately stops transactions and damages conversion.
- Enterprise customers expect continuity during peak periods.

## Decision
- Service tier: Tier 1
- Target SLO: 99.99%
- RTO: 15 minutes
- RPO: 5 minutes
- BR expectation: transaction throughput restored to baseline within 24 hours
- Chosen architecture posture: multi-zone primary region, warm secondary region, continuous replication, automated rollback, quarterly failover drill

## Reliability rationale
- 99.9% was rejected because the 8.76-hour annual budget was materially larger than tolerated revenue exposure.
- 99.999% was rejected because active-active global operation would have introduced a disproportionate cost and coordination burden relative to current revenue and contract profile.
- Failure domains modeled: zone, region, identity, edge routing, payment gateway, deployment pipeline, and operator coordination.
- Controls funded: regional recovery path, synthetic monitoring, higher retention for critical telemetry, dedicated on-call coverage, quarterly game day.

## Alternatives considered
- Lower-cost alternative rejected: primary region only with manual failover.
- Higher-reliability alternative rejected: multi-region active-active with sub-minute cutover.
- Lower-cost option rejected because expected outage exposure exceeded leadership risk tolerance.
- Higher-reliability option rejected because marginal cost was not justified by current contract mix.

## Economic rationale
- Estimated direct outage cost per hour: high, immediate lost transaction value.
- Estimated indirect outage cost factors: conversion drop, support surge, potential service credits, reputation damage.
- Annual resilience premium accepted: high.
- Operational burden accepted: 24/7 on-call, quarterly simulations, controlled deployment gates.

## Consequences
- Revenue-path outages should remain within funded recovery assumptions.
- Extreme provider-wide and payment-partner failures remain residual risk.
- The decision assumes current growth and contract concentration, not a future regulated environment.

## Review triggers
- Revisit if enterprise contractual uptime targets rise.
- Revisit if regional incident cost exceeds the active-active premium.
- Revisit if payment concentration risk increases.
- Revisit annually during planning.

## Owner and approver
- Engineering owner: Commerce platform lead
- Product owner: Checkout GM
- Finance or leadership approver: CTO and finance partner
```

## Practical rule

If a team cannot explain why a service is 99.9%, 99.99%, or 99.999% in one page with cost, risk, and review triggers, then the target is probably aspirational rather than governed.