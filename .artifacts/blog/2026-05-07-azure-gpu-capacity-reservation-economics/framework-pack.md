# Framework Pack: Azure GPU Capacity Reservation Economics

## Framework Name

Fit, Fill, Fallback

## Memorable Takeaway

Reserve GPU capacity only when the workload is strategic enough to matter, steady enough to fill, and flexible enough to survive being wrong.

## 3-Part Decision Model

1. Fit
   - Is the workload revenue-linked, customer-facing, or contract-critical?
   - If delays create material business loss, reservation becomes a business continuity decision, not just a unit-cost decision.

2. Fill
   - Can you keep reserved GPUs meaningfully utilized across most weeks?
   - If utilization will be inconsistent, the discount can be erased by idle capacity.

3. Fallback
   - Do you have a plan for overflow, model changes, or region constraints?
   - Reservation works best when paired with a burst path, not when it becomes a trap.

## Decision Criteria Table

| Signal | Reserve | Hybrid | Stay On-Demand |
| --- | --- | --- | --- |
| Workload criticality | Production-critical | Important but not constant | Experimental or discretionary |
| Demand predictability | High | Moderate | Low |
| Expected utilization | High and sustained | Core steady load plus spikes | Spiky or uncertain |
| Cost of waiting | Material | Manageable | Low |
| Escape options | Strong burst/failover path | Partial backup path | Prefer flexibility over commitment |

## CTO / FinOps Diagnostic Questions

1. What is the business cost of not getting GPUs when the team needs them?
2. Which portion of demand is truly steady, and which portion is campaign, training, or launch-driven?
3. What utilization level do we realistically expect after model changes, retries, and idle windows are included?
4. Would a hybrid approach cover the stable baseline while keeping burst demand flexible?
5. What is our exit plan if the region, model mix, or provider economics change within the next two quarters?

## 30-Day Execution Checklist

- Quantify the business impact of GPU shortages: delay, lost throughput, missed revenue, or SLA exposure.
- Separate baseline demand from burst demand using the last 60 to 90 days of workload patterns.
- Estimate effective reserved utilization after maintenance, retries, and forecasting error.
- Compare three options: full reservation, baseline reservation plus burst, and pure on-demand.
- Set a review trigger for utilization drift, model shifts, and regional capacity changes.

## Assumptions and Boundary Conditions

- Assumes the team can measure workload demand, utilization, and business impact with reasonable accuracy.
- Best suited for production inference, regulated delivery commitments, or high-value internal platforms.
- Less useful for early experimentation, short-lived pilots, or workloads likely to move architectures quickly.
