---
title: "Azure AI Foundry: The PTU vs TPM Debate You Can't Ignore"
description: "Procurement and platform teams at enterprises are caught between Provisioned Throughput Units (PTU) and Pay-As-You-Go (TPM) models. Here is how to decide which fits your business."
publishDate: 2026-04-02
tags:
  - finops
  - ai
  - azure
  - procurement
status: draft
---

If you are an enterprise evaluating Azure AI Foundry, you are facing a simple question that does not have a simple answer:

Should you commit to Provisioned Throughput Units (PTU) or pay per token (TPM)?

The spreadsheet models will not tell you.
Your vendor will support both.
Your finance team is waiting on your call.

This is not a technical debate.
It is a business model decision that cascades through infrastructure, procurement, tooling, and team accountability.

## Why this matters

Most enterprises have spent years optimizing for consumption-based cloud pricing (pay for what you use, optimize aggressively).

PTU breaks that 30-year pattern.
PTU says: buy capacity upfront, commit to throughput, and optimize utilization instead of consumption.

This is back to the pre-cloud world: you reserved database licenses, you committed to server capacity, you planned quarterly renewal cycles before you could add more.

The difference is that AI model performance and pricing change quarterly.
Your PTU decision might be outdated within 6 months.

But TPM (token-based, pay-as-you-go) has its own risk: cost spirals if an agent or application goes into a loop and runs up a $50k bill in 24 hours.

## What changed

One year ago, Azure offered only TPM (Provisioned Throughput, but rare in practice).
Today, both models are production-ready.

The gap that opened is discovery: most enterprises do not yet know which model they need.

Vendors describe PTU as "cost optimization."
They describe TPM as "flexibility."

Both descriptions are true and misleading.

Here is what actually matters:

### PTU (Provisioned Throughput Units)

**Cost structure:** Commit to a throughput level (PTU units), pay upfront or monthly.

**Actual behavior:**
- You are buying tokenized, reserved capacity.
- You own the utilization risk: if you buy 100K TPM of capacity and use only 30K, the wasted 70K is lost money.
- Pricing is better *if* utilization is consistently high (>60%).
- You lock in pricing for the commitment period; if token prices drop, you are stuck.

**Best for:**
- Production workloads with predictable token volume.
- Workloads where cost volatility is your biggest risk.
- Teams with strong forecasting and change-control discipline.

### TPM (Token-based, Pay-as-You-Go)

**Cost structure:** Pay per token consumed, usage-based billing.

**Actual behavior:**
- You own the runaway cost risk: a misbehaving agent or loop can cause spikes.
- Pricing is transparent and granular (you see token count × rate).
- You have flexibility to scale up or down without procurement cycles.
- If token prices drop, you benefit immediately.

**Best for:**
- Development and testing (variable, unpredictable workloads).
- Proof-of-concepts and new use cases.
- Workloads where usage varies month-to-month.
- Teams without strong forecasting or where AI volume is emerging.

## Framework or model

Use this decision tree:

1. **Do you have 12 months of production token history for this workload?**
   - No → Use TPM. Too much unknown to commit.
   - Yes → Continue.

2. **Is your token volume consistent within 20% month-to-month?**
   - No → Use TPM. Volatility makes PTU risky.
   - Yes → Continue.

3. **Is your team's cost threshold for runaway usage higher than your PTU savings?**
   - No → Use PTU. Cost certainty is worth the commitment.
   - Yes → Continue.

4. **Can your procurement process handle quarterly or semi-annual PTU reviews?**
   - No → Use TPM. PTU needs active governance.
   - Yes → Use PTU if utilization is >60%.

## Practical implementation

Start with TPM.

Most enterprises do, whether they admit it or not.
TPM removes unknown risk and lets teams experiment without finance friction.

After 6 months of production data:

1. Calculate actual average token use and variance.
2. Model PTU cost at different commitment levels.
3. Compare to projected TPM cost over the same period.
4. Include 20% headroom for forecast error in your PTU estimate.
5. Present both options to finance and pick the one with lower expected total cost of ownership.

Example:
- Last 6 months: 500M tokens/month average, 20% monthly variance.
- Projected 12-month cost on TPM: $250k (at $0.50 per 1M tokens).
- PTU capacity needed for >90% availability: 700K TPM (accounting for variance) = $90k/month = $1.08M/year.
- Decision: TPM is better even with 2x projected growth. Revisit in 12 months when you have more data.

## Risks and trade-offs

PTU locks you in to throughput and pricing for the commitment term.
If the AI landscape shifts (better model cheaper, your forecasts miss), you are committed anyway.

TPM gives you flexibility, but you bear the runaway cost risk.
Without spending guardrails (alerts, quotas, daily reviews), a misconfigured agent can cost you.

The middle path is a hybrid: use TPM for dev/test, but run production critical workloads on PTU with a tight, reviewed utilization forecast.

## What to do this week

If you are evaluating model:

1. Get 3 months of token usage data from your current work.
2. Calculate average and monthly variance (std dev / mean).
3. If variance > 30%, use TPM and revisit in 6 months.
4. If variance < 20% and utilization is >60%, run a PTU cost model.
5. Present both scenarios to finance and pick based on risk appetite.

The answer you arrive at today might change in 6 months.
That is normal and expected as AI pricing and efficiency improve.

What matters is making the decision data-driven instead of based on vendor guidance or fear.

I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
