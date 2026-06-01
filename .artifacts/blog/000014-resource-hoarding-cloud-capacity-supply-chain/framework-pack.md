# Framework Pack: Constrained Elasticity Operating Model

## Model

### 1. Capacity Risk Segmentation
- Mission-critical
- Revenue-adjacent
- Experimental/batch

### 2. Capacity Class Design
- Committed baseline
- Protected burst
- Reclaimable discretionary

### 3. Reacquisition Readiness
- Primary region expansion path
- Secondary region fallback path
- Graceful degradation path
- Workload shedding thresholds

### 4. Joint Governance
- One weekly FinOps + SRE review pack
- Shared metrics: utilization, rejection rates, delayed allocations, risk-adjusted unit cost

## Decision Rule
If expected failure cost from reacquisition risk exceeds holding cost, maintain reserve capacity with explicit expiry and review controls.

## Anti-Patterns
- Single-region hard dependency
- Cost optimization without reliability constraints
- Static overprovisioning without release policy
- Separate FinOps and SRE governance loops
