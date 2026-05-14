# Framework Pack: Fit, Fill, Fallback

## One-Sentence Takeaway

Reserve GPU capacity only when the workload is strategic enough to matter, steady enough to fill, and flexible enough to survive being wrong.

## Three-Part Decision Model

1. Fit
   - Is the workload revenue-linked, customer-facing, or contract-critical?
   - If delays create material business loss, reservation becomes a continuity decision, not just a unit-cost decision.

2. Fill
   - Can the team keep reserved GPUs meaningfully utilized across most weeks?
   - If utilization is inconsistent, discounted idle capacity can still be expensive.

3. Fallback
   - Is there a plan for burst demand, model changes, or region constraints?
   - Reservation works best when paired with an explicit fallback path.

## Diagnostic Questions For CTO And FinOps Review

1. What is the business cost of not getting GPUs when the team needs them?
2. Which portion of demand is steady, and which portion is launch-driven or bursty?
3. What utilization level is realistic after maintenance windows, retries, and idle hours are included?
4. Would a hybrid approach cover the baseline while keeping burst demand flexible?
5. What is the exit plan if region conditions, model mix, or economics change next quarter?