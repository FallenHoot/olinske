# Capacity Is Not Usage: The Hidden Cost of Azure GPU Reservation

Azure Capacity Reservation solves a real problem. GPU availability is not guaranteed at deployment time, and that matters for business-critical workloads.

Capacity wars are not new. They have been part of cloud economics for years. The impact is uneven. Different customers get hit in different ways based on workload shape, region choice, and risk tolerance.

Customers should not need to track every ecosystem shock in detail. They do need a practical decision model for what is in their control and what is outside their control.

The misunderstanding starts right after that. Many teams treat Capacity Reservation like a safer form of pay-as-you-go compute. It is not. The moment you reserve capacity, the economics change.

Capacity Reservation buys certainty first. Usage economics pay off only if the workload is stable enough to fill that certainty.

This post focuses on customer operating decisions. For the broader ecosystem view of why capacity wars exist, see [Cloud Resource Hoarding: Why Elasticity Breaks Under Capacity Pressure](/posts/000014-resource-hoarding-cloud-capacity-supply-chain).

The moment you reserve capacity, you are no longer paying for what you use. You are paying for what you hold.

I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments. Any pricing figures in this post are illustrative estimates based on public pricing inputs and stated assumptions, not official quotes, guarantees, or capacity commitments.

## Start with the Azure terms

Azure has several concepts that get blended together in architecture reviews even though they solve different problems.

- Quota is permission to deploy.
- Capacity is the underlying infrastructure available for a given size in a given location.
- Capacity Reservation is the mechanism that can hold capacity for your use.
- Reserved Instances and Savings Plan are discount mechanisms. They do not create capacity guarantees by themselves.

That distinction matters because teams often compare these options as if they were interchangeable cost levers. They are not. Capacity Reservation is the control that changes whether the infrastructure is there for you. Discounts only change the rate you pay once you have decided to carry that footprint.

## Billing follows capacity, not activity

Microsoft documents Capacity Reservation very clearly. Azure bills capacity reservations at the same rate as the underlying VM size, at pay-as-you-go rates, whether the VM is provisioned or not. If a VM uses that reservation later, Azure does not charge you twice. You see billing for the VM plus any remaining unused reserved capacity at the same underlying VM rate.

That is the first principle many business cases miss.

This is not usage-based pricing. It is capacity-based pricing.

If the reservation exists, the meter is running.

## A synthetic planning example

Illustrative example only, made up on purpose.

To avoid mirroring a real customer footprint, use a synthetic design with about 1,920 reserved vCores split evenly across two abstract GPU VM shapes.

| VM shape | Reserved vCores | vCores per VM | Required VMs |
| --- | ---: | ---: | ---: |
| `GPU_Shape_A_64` | 960 | 64 | 15 |
| `GPU_Shape_B_32` | 960 | 32 | 30 |
| **Total** | **1,920** |  | **45** |

Assumptions used only for illustration:

- 730-hour month
- Public pay-as-you-go style price bands rather than negotiated pricing
- Linux-style pricing assumptions, not Windows licensing
- No Reserved Instance or Savings Plan discounts applied
- EUR values rounded for planning clarity

Illustrative hourly bands:

| VM shape | Illustrative hourly range |
| --- | ---: |
| `GPU_Shape_B_32` | EUR 2.9 to EUR 5.2 per hour |
| `GPU_Shape_A_64` | EUR 5.4 to EUR 8.1 per hour |

That yields this monthly reservation range:

- Lower bound: `(30 x 2.9 + 15 x 5.4) x 730 = EUR 122,640`
- Upper bound: `(30 x 5.2 + 15 x 8.1) x 730 = EUR 202,575`

Rounded for planning, that is about EUR 123k to EUR 203k per month.

The number itself will vary by region, operating system, date, currency, and discounts. The important point is what the number represents. It is the monthly cost of securing 45 GPU VM-equivalents of capacity, not a bill for how many productive GPU-hours your users or workloads actually consumed.

## The business-hours trap

An 8-hour business-day workload still pays for a 24-hour reservation day. A weekday-only workload may look heavily utilized during active hours and still look financially inefficient over a full month because the reservation bill reflects every hour the capacity was held.

If the business case assumes you pay only while users or jobs are active, Capacity Reservation is the wrong economic model.

## Scale-down is not a reversible assumption

Azure documents two separate facts:

- Capacity is reserved for your use until the reservation is deleted.
- A new reservation request can fail if sufficient capacity is not available when you ask for it.

The practical implication is straightforward. Deleting a reservation can reintroduce reacquisition risk.

In constrained regions, released capacity can be consumed quickly by other customers.

For constrained GPU workloads, scale-down is a strategic decision. You are saving money now by accepting deployment risk later.

## Discounts help price. They do not fix utilization.

Azure documents that both used and unused capacity reservation usage are eligible for Reserved Instance and Savings Plan discounts. That lowers the rate. It does not change the utilization math.

Discounts reduce the cost per unit. They do not reduce the amount of unused capacity.

If the reservation is oversized or underused, the organization is still paying for idle infrastructure. It is simply paying slightly less for it.

This creates a predictable pattern. Teams reserve capacity based on worst-case demand, operate at average demand, and carry the cost of that gap continuously.

## When Capacity Reservation is the right choice

There are cases where Capacity Reservation is exactly the right answer:

- The workload is revenue-linked or contract-critical.
- Missing GPU allocation would delay a launch or a customer commitment.
- Baseline demand is stable enough to keep the reserved estate meaningfully utilized.
- The cost of failed reacquisition is materially higher than the cost of carrying some idle reserved capacity.

If demand is still volatile, experimental, or weakly governed, reservation can become expensive anxiety with a better narrative around it.

## What you can control and what you cannot

Capacity planning gets easier when teams separate controllable decisions from uncontrollable market dynamics.

What you can control:

- Your reservation footprint, including VM count and shape mix.
- Your utilization discipline, including schedule, queueing, and workload routing.
- Your baseline versus burst policy.
- Your governance cadence for resize and release decisions.
- Your discount strategy after the baseline footprint is justified.

What you cannot control:

- Regional capacity availability at the exact moment you need to reacquire.
- Supply pressure from other customers in the same constrained region.
- Upstream infrastructure lead times and allocation dynamics.
- Platform-level scarcity cycles during high-demand periods.

The strategic rule is simple. Build operating discipline around what you can control, and design risk buffers for what you cannot.

This is a unique period in cloud history. Teams that separate controllable decisions from external constraints will perform better under uncertainty.

## Practical checklist

- Define the business consequence of failed GPU allocation.
- Separate quota analysis from capacity analysis.
- Translate vCore demand into exact VM counts and shapes.
- Model demand by hour, not by monthly average.
- Build the cost model with explicit assumptions.
- Show technical utilization and financial utilization side by side.
- Reserve only the portion of demand that truly requires guaranteed availability.
- Treat release as a governance event.
- Apply discounts only after the baseline footprint is justified.
- Review reservation fit on a fixed cadence.

## Executive takeaway

Azure Capacity Reservation is a useful tool for scarce GPU capacity. It can be the right architecture decision.

It is not elastic economics.

Capacity is not usage. If your organization does not understand that before reserving GPUs, it will understand it when the invoice arrives.