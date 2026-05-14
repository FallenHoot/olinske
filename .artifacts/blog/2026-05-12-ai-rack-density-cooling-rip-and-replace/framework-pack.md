# Framework Pack: AI Rack Density and the Rip-and-Replace Problem

**Slug:** 2026-05-12-ai-rack-density-cooling-rip-and-replace

---

## Core Framework: The Four-Domain Infrastructure Lock

AI cluster deployment is not a server procurement decision. It is a four-domain infrastructure decision. All four must be resolved concurrently because they are mutually constraining.

| Domain | Legacy state | AI cluster requirement | Why it does not upgrade incrementally |
|---|---|---|---|
| Power | 8-15kW per rack, PDU and UPS sized accordingly | 60kW+ depending on GPU density | PDU, breaker, UPS, and utility interconnect are all capacity-gated hardware. No software path. |
| Cooling | Air cooling (CRAC/CRAH units, hot-aisle containment) | Closed-loop liquid cooling for high-density nodes | Air cooling has a practical ceiling in many enterprise facilities; above that threshold coolant loops are required, not optional. [Verify specific threshold] |
| Network | Standard spine-leaf Ethernet, typical 100GbE uplinks | Ultra-low-latency lossless fabric (InfiniBand or high-bandwidth RoCEv2 Ethernet) at scale | Oversubscription ratios and latency tolerances for GPU collective operations are fundamentally different from general workloads. |
| Floor and structure | Standard raised floor rated for traditional rack weight | Heavier racks, floor cutouts for coolant distribution manifolds, higher load-bearing requirements | Structural changes require facilities engineering sign-off and are not reversible without major work. |

---

## Workload Tier Map

Not every AI workload triggers the same infrastructure requirement. Use this map to scope conversations:

| Tier | Example workloads | Approximate density need | Infrastructure implication |
|---|---|---|---|
| Inference at scale | LLM serving, copilot backends | 20-40kW per rack | May fit upgraded existing facilities with enhanced cooling |
| Fine-tuning and small training | Domain adaptation, RLHF runs | 30-60kW per rack | Often requires cooling upgrade and network redesign |
| Large-scale pre-training | Foundation model development | 60kW+ per rack | Requires full four-domain redesign or purpose-built facility |

*Note: Specific kW figures are illustrative ranges based on publicly available GPU configurations. Verify against actual hardware spec sheets before using in capacity planning.*

---

## The Three Lease Timing Traps

1. **Existing colo lease renewal without renegotiation:** Standard renewal preserves the power envelope that was contracted. Bringing AI workloads into an existing colo at the same rack density terms fails before the first node is racked.

2. **Lead time blind spot:** AI-ready colo facilities that can deliver 60kW+ per rack, liquid cooling infrastructure, and lossless network fabric are capacity-constrained. The decision window for 2027 capacity is now.

3. **The staged upgrade fantasy:** Planning to upgrade cooling and power in the existing facility while AI workloads run is operationally complex and often impossible without significant downtime. Most enterprises that attempt in-flight upgrades extend their deployment timelines by six to twelve months.

---

## The Cloud Alternative Test

Before committing to a high-density private or colo infrastructure build, answer these three questions:

1. Is your AI workload genuinely blocked from cloud GPU? (Sovereignty, data residency, latency, or contractual constraints?)
2. Is your AI compute need stable and predictable enough to justify long-term facility commitment?
3. Have you modeled the all-in cost including facility, power, cooling infrastructure, operational staffing, and commissioning against a cloud reservation commitment?

If any answer is unclear, cloud GPU capacity should remain in the architecture until the answer is clear.

---

## The Procurement Conversation Guide

Questions to ask your colo provider or facilities team this quarter:

- What is the maximum committed kW per rack your facility can deliver today and in your next build phase?
- Do you have closed-loop liquid cooling infrastructure installed, or is it available only in new build phases?
- What is your lead time from contract to operational capacity for a high-density AI-class build?
- What is your current network interconnect available in the relevant cage or suite?
- What floor load rating applies to the target space, and have you accommodated coolant manifold cutouts before?

---

## Distilled Principle

The enterprise data center assumption embedded in most existing contracts is incompatible with modern GPU cluster requirements. The failure mode is not that the hardware does not fit — it is that the facility was never designed to support it. Auditing facility constraints before hardware procurement is now a pre-condition for AI deployment, not an afterthought.
