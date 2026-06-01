# Outline

Post slug: 2026-04-02-ptu-vs-tpm-azure-ai-foundry

## Core thesis

Enterprises facing PTU vs TPM decision need a data-driven framework, not vendor messaging. Start with TPM, gather 6-12 months of data, then decide based on utilization and variance.

## Section flow

1. Why this matters: This breaks 30-year consumption-based cloud pattern
2. What changed: Both models now production-ready; discovery gap is real
3. Model breakdown: PTU structure, TPM structure, trade-offs
4. Framework or model: Decision tree based on utilization data and variance
5. Practical implementation: Start TPM, model PTU after 6 months
6. Risks and trade-offs: Commitment risk vs runaway cost risk
7. What to do this week: Calculate variance, model both scenarios

## Counter-position to address

"PTU is always cheaper for production workloads."

Response: Only if utilization is >60% and forecasts are accurate. High variance or forecast errors make TPM better even at scale.

## Evidence plan

- Reference public Azure Learn pricing documentation
- Use Forrester TEI as external validation for cost modeling
- No internal cost tables
