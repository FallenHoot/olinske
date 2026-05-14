# EOU Seller Playbook: Azure Capacity

Prepared for field conversations
Date: 2026-05-11

## One-line pitch

Quota lets you try.
Capacity lets you succeed.
Reservations make it cheaper.

## The reality to lead with

Most Azure delivery issues are capacity issues, not pricing issues.

Capacity risk is usually tied to one combination:
region + availability zone + SKU + time.

## Three Gates Model

| Gate | Question | Outcome if no |
| --- | --- | --- |
| Gate 1: Quota | Are we allowed to deploy this much? | Deployment fails |
| Gate 2: Capacity | Does Azure have room right now for this exact workload? | Deployment fails |
| Gate 3: Pricing | Are we paying optimized rates? | It still runs, but it costs more |

Key insight: Gate 2 is the launch-readiness gate.

## Seller behavior model

### Step 1: Qualify risk early

Ask:
- Is this mission-critical?
- Is launch timing fixed?
- Is architecture tied to specific region, zone, or SKU?
- What happens if deployment fails at launch?

If yes to any, treat as capacity risk.

### Step 2: Position the right control

| Need | Primary control |
| --- | --- |
| Enable deployment permission | Quota increase |
| Secure deployment availability | On-demand Capacity Reservation |
| Reduce steady-state cost | Azure Reservations |

Important:
- Reservations are not a capacity guarantee.
- Quota approval is not deployment success.

### Step 3: Sequence correctly

1. Secure quota.
2. Validate region, zone, and SKU availability.
3. Reserve capacity when failure risk is unacceptable.
4. Optimize cost with Reservations.

Most common mistake:
Buying Reservations before securing capacity.

## When to use On-demand Capacity Reservation

Use On-demand Capacity Reservation when:
- Missed deployment has business impact.
- Launch date is fixed.
- DR or failover readiness is mandatory.
- GPU or high-demand SKUs are involved.
- Zone-specific architecture is required.

Seller line:
If this must run at a specific time, secure capacity before launch.

## Escalation reality

When capacity is constrained:
- Validate alternative region and SKU paths.
- Propose multi-region design where possible.
- Raise formal escalation when the blocker threatens delivery timelines.

Capacity is planned and managed, not assumed.

## Future direction: FRS mindset

Today capacity management is reactive.
Future Reservation Service introduces forward planning for capacity windows.

Seller message:
We are moving from hope capacity exists to planning capacity ahead of deployment.

## Final takeaway

You do not deploy into Azure in the abstract.
You deploy into available capacity.
