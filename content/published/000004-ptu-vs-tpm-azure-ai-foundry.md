---
title: "Azure AI Foundry: The PTU Trap Behind TPM Scarcity"
description: "When pay-as-you-go capacity is effectively unavailable, enterprises get pushed into PTU long before utilization justifies it. That turns AI capacity into stranded cost and breaks the cloud's elasticity promise."
publishDate: 2026-05-02
tags:
  - cloud-architecture
  - finops
  - ai-strategy
  - azure
status: published
---

The cloud was built on a promise: use what you need, give back the rest, pay for what you consumed.

That promise was always idealized. Cloud never meant infinite elasticity. You still buy VM sizes, storage tiers, and commitments. Reserved capacity has always existed. That is not the problem.

The problem starts when the practical path to AI capacity stops being pay-as-you-go and starts being reservation first.

That is the pattern I keep seeing with Azure AI Foundry.

I am not speaking for Microsoft here. This is my interpretation of what I see working with large enterprises across regions.

A customer asks for AI capacity in a region. They want the normal cloud model: start on Standard deployment, pay per token, learn the traffic shape, then optimize later. Instead, the answer comes back that pay-as-you-go capacity is effectively unavailable in that region and the realistic path is PTU.

Sometimes PTU availability disappears quickly as well. The result is that customers buy committed capacity before they have committed demand.

That is not a pricing detail. That is a design problem.

## The thesis

When capacity is tight, PTU optimizes for allocation certainty. TPM optimizes for utilization efficiency. If the system over-optimizes for certainty, customers are pushed into reserving throughput long before their workload justifies it.

Once that happens, rational customers hoard.

Azure's own documentation makes the incentive clear: if you scale down or delete a provisioned deployment, the capacity is released and there is no guarantee you will get it back later.

That single rule changes behavior. Capacity stops behaving like cloud elasticity and starts behaving like scarce inventory.

This creates a control plane vs data plane mismatch. Capacity is allocated based on reservation, not actual usage. When those diverge, efficiency collapses.

## What PTU and TPM actually are

For the business leader reading this who needs the short version:

**PTU (Provisioned Throughput Units)** is committed inference capacity. You reserve throughput, pay for it whether you use it or not, and get more predictable performance and latency.

**TPM (Tokens Per Minute, Standard deployment)** is the pay-as-you-go path. You pay per token consumed, stay on shared capacity, and accept throttling risk instead of commitment risk.

| | PTU | TPM (Standard) |
|---|---|---|
| Pricing model | Fixed hourly or reserved commitment | Per-token consumption |
| Capacity model | Dedicated reserved throughput | Shared pool |
| Best fit | Stable, high, predictable demand | Early, bursty, uncertain demand |
| Main risk | Paying for idle capacity | Throttling or regional scarcity |
| Main benefit | Predictability | Flexibility |

This is why the debate matters. PTU is not just another SKU. It changes the operating model.

## The real economic problem

The strongest argument against early PTU adoption is not ideological. It is mathematical.

In early enterprise deployments, utilization is usually much lower than people expect. Teams work business hours. Many copilots are used intermittently. Pilots launch with optimistic forecasts and real traffic arrives in bursts.

Across the enterprise patterns I see, single-digit utilization is common in the early phase. Approximately 6% is a representative midpoint, not a universal law.

This is not a published benchmark, just a consistent pattern I see in early enterprise deployments.

The math is straightforward. A team that actively uses a workload only during working hours is already using only a fraction of the week. If actual request volume inside those hours is bursty rather than continuous, the effective utilization of reserved throughput collapses fast.

That is how you end up with a terrible but rational sentence: "We are barely using it, but we cannot give it back."

Using a GPT-4o class example with a 15 PTU minimum and roughly 51K TPM of provisioned capacity, the economics look like this:

| Utilization | Standard token cost | PTU reservation | Effective overpay |
|---|---|---|---|
| 100% | ~$3,856 | $4,290/month | 1.1x |
| 60% | ~$2,314 | $4,290/month | 1.9x |
| 25% | ~$964 | $4,290/month | 4.5x |
| 10% | ~$386 | $4,290/month | 11.1x |
| 6% | ~$242 | $4,290/month | 17.7x |

The exact break-even point varies by model, token mix, and reservation term. The decision shape does not. PTU only starts to look financially attractive when demand is both high and steady.

That is why early PTU adoption so often turns into stranded cost.

## The allocation trap

This is the part most public writing misses.

The question is not only, "Which pricing model is cheaper?" The harder question is, "Which model actually has usable capacity in my region, for my subscription, when I need it?"

When Standard capacity is constrained and PTU becomes the only practical option, customers get pulled into a commitment model earlier than their workload maturity warrants.

Once they secure PTU, they stop thinking like elastic cloud consumers and start thinking like holders of scarce inventory. Releasing capacity becomes risky. Over-reserving becomes understandable. Utilization drops. New customers face longer waits. The ecosystem gets less efficient with every rational local decision.

The second-order effect matters more than the first. As more customers over-reserve, effective capacity for everyone else decreases, even if total infrastructure grows.

That is why I call this a market failure inside a cloud.

Nobody has to behave badly for the system to produce bad outcomes.

## When PTU actually makes sense

PTU is not wrong. It is just easy to buy too early.

Choose PTU when most of these are true:

1. Demand is already proven in production.
2. Your baseline traffic is high for most of the day.
3. Latency predictability matters more than pure cost efficiency.
4. You can measure sustained throughput, not just projected demand.
5. You are prepared to operate spillover, retries, and utilization monitoring as first-class concerns.

Choose TPM first when most of these are true:

1. The workload is new, seasonal, or still learning its traffic shape.
2. Demand is spiky or heavily tied to business hours.
3. You need flexibility more than deterministic latency.
4. You are still testing prompts, model choice, or user adoption.
5. You do not yet have enough real production data to size PTU with confidence.

The practical answer for many teams is hybrid: keep a measured PTU baseline only after usage is real, then route bursts or non-critical traffic to Standard deployments where available.

## How this compares with AWS and GCP

I hear from multi-cloud customers that Azure creates this scarcity dynamic more often than AWS Bedrock or GCP Vertex AI.

The broad pattern in public guidance is this:

| Feature | Azure PTU / Standard | AWS Bedrock | GCP Vertex AI |
|---|---|---|---|
| Default mental model | Mix of Standard and provisioned | On-demand first | Pay-as-you-go first |
| Commitment option | PTU reservations | Provisioned throughput | Provisioned throughput |
| Main enterprise question | Is Standard capacity usable in my region? | Do I need provisioned capacity yet? | Do I need a commitment yet? |

I cannot verify the internal allocation logic of other hyperscalers. I can verify that Azure customers I work with hit the "capacity first, economics second" conversation more often than they expect.

That distinction matters. The best pricing model on paper is irrelevant if it is not practically available.

## My position

I favor TPM as the default starting point for most enterprise AI workloads.

The cloud promise is not that everything is free or infinitely elastic. The promise is that you can start small, observe real demand, and scale commitment only after the workload earns it.

PTU breaks that sequence when customers are pushed into reservation before they have utilization.

Customers are not the problem. Product teams are not the problem. The incentive structure is the problem.

If releasing capacity is risky, hoarding is rational.

If utilization is low, PTU becomes stranded cost.

If enough customers do that at once, the system gets worse for everyone else.

## What I would change

If I could influence the model, I would change four things:

1. **Reserve a real floor for Standard capacity.** Every region should keep some meaningful percentage of AI capacity available for pay-as-you-go usage.
2. **Make PTU easier to step down.** If utilization stays low, customers should have a cleaner path to reduce committed capacity without effectively exiting the market.
3. **Publish better utilization signals.** Customers should be able to see enough aggregate data to judge whether commitment is justified.
4. **Shorten commitment friction.** In a market where model pricing and capability move fast, long commitment windows create unnecessary lock-in risk.

## What to do this week

If you are a CTO, platform lead, or procurement owner evaluating Azure AI capacity, do this now:

1. **Do not buy PTU on forecast alone.** Use real token data wherever possible.
2. **Calculate utilization honestly.** Measure active throughput against total reserved time, not against the business case slide.
3. **Ask a capacity question before a pricing question.** Is Standard deployment actually usable in your target region and model family?
4. **Separate baseline from burst.** Do not reserve peak demand if most of your traffic is intermittent.
5. **Treat PTU as an architectural commitment.** This is not just billing. It affects routing, failover, monitoring, and release decisions.
6. **Revisit the decision often.** Model prices, throughput ratios, and capacity conditions change faster than traditional infrastructure contracts.
7. **Model your failure mode.** What happens when PTU saturates or TPM throttles? Design for it.

The AI infrastructure shortage is real. Capacity constraints are real. None of that changes the core point.

A cloud platform should not teach customers to hoard.

If the safest behavior is to hold unused capacity because reacquiring it is too risky, the elasticity model is no longer working the way customers think it is.

If your safest move is to hold unused capacity, is that still cloud?

---

**Disclaimer:** I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
