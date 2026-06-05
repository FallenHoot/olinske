---
title: 'Spring Cleaning Your Cloud: Past the Quick Wins Into the Hard Questions'
description: >-
  Quick wins are table stakes. For mature cloud customers, the real question is
  not where is the waste. It is what are we choosing to spend money on, and is
  that choice still justified. Here are the hard questions that make people
  uncomfortable.
publishDate: '2026-04-19'
tags:
  - cloud-architecture
  - finops
  - azure
  - governance
status: published
---

I have a multi-grafted apple tree in my yard. Three different varieties on one rootstock. I also have a plum tree and a few berries. Every spring I cut back the growth so the fruit does not bend the branches so far they touch the ground. Cut what grows straight up. Cut what crosses. Keep what grows outward where the fruit can hang without breaking the branch.

Then I talk with hundreds of FinOps mindset people every month and they all explain the same challenges. Growth that nobody pruned. Resources that were needed last year and are costing money today. Things that made sense when they were deployed and do not make sense anymore.

I always joke that we can delete everything in Azure and just walk away. The business will not love it when the company stops working tomorrow. So instead, we ask the hard questions.

## The quick wins are table stakes

I work with the largest companies in Norway and several international ones as well. I have FinOps meetings with a variety of these customers every month. The patterns overlap. Legacy disk SKUs nobody revisited. 365 days of backups nobody has ever restored. Orphaned resources from deleted VMs. Compute running at 5% utilization. Dev/test environments running 24/7. Storage sitting in Hot tier that nobody touches.

Cloud waste is at 29% and trending UP for the first time in five years (Flexera 2026). The FinOps Foundation's State of FinOps 2026 survey (1,192 respondents managing $83 billion in cloud spend) confirms it. AI and SaaS sprawl are creating new waste faster than teams can govern it.

Every FinOps practitioner knows this. Every framework starts here. Visibility, tagging, dashboards, anomaly detection, commitment hygiene, cleanup.

That is pruning dead branches. It is necessary. It is not sufficient.

## The question changes for mature customers

For mature customers with tagging, dashboards, showback, anomaly detection, RI/Savings Plan hygiene, and the obvious cleanup already done, the question is no longer:

> "Where is the waste?"

The real question becomes:

> "What are we choosing to spend money on, and is that choice still justified?"

Those are not optimization questions. They are architecture, product, and operating model questions. They are the questions that make people uncomfortable because they force tradeoffs, ownership, and strategy.

The conversation moves from right sizing, reservations, zombie resources, dashboards, and "better hygiene" to product economics, architecture rationalization, resiliency scope, data gravity, ownership, incentives, standardization, and governance with teeth.

I structure these around four lenses.

## Lens 1: Cost of architecture choices

This gets past "cost per resource" and into cost per design decision.

**Which parts of this architecture are expensive by design, not by accident?** Most mature cloud architectures have deliberate cost. Multi-region active-active is expensive on purpose. The question is whether the business requirement that justified it still holds.

**What would we redesign if we had to cut 30% of run cost without harming customer outcomes?** This is the forcing function. When you take away the option of doing nothing, the real priorities surface. The answers reveal which costs are structural and which are inertia.

**Which resilience decisions are real business requirements, and which are engineering assumptions?** I see this constantly. Teams design for five-nines availability on workloads where the business would not notice a 30-minute outage. The cost difference between 99.9% and 99.99% is not incremental. It is often 3-5x.

**Are we using premium SKUs to hide poor design or weak performance engineering?** The most uncomfortable version of this question. Sometimes the answer is yes. A bigger VM is faster to provision than a performance investigation.

**What would break if we moved from always-on to event-driven or async patterns?** The answer is often "nothing". The pattern exists because it was the default when the service was built, not because it was the right choice.

## Lens 2: Cost of product choices

This is where mature FinOps moves from cloud cost to unit economics.

**Which workloads generate clear business value, and which are just politically protected?** Every enterprise has workloads that survive because someone senior sponsors them, not because they produce measurable outcomes. Nobody wants to be the person who asks this question out loud.

**Can we express cloud cost per customer, per transaction, per site, per business unit, or per product feature?** 49% of organizations now track unit metrics, up from 40% (State of FinOps 2026). The other 51% cannot answer this question. If you cannot express cost in business terms, you cannot have a business conversation about cost.

**Which products are growing cloud spend faster than revenue, adoption, or margin?** This is the question that connects cloud cost to the P&L. If spend grows at 40% and revenue grows at 15%, someone needs to explain the gap. Not the FinOps team. The product owner.

**What is the most expensive thing we do that nobody would approve if it showed up as a separate invoice line to the business owner?** I ask this in every mature customer session. The room goes quiet. Then someone names it.

**If we launched this product today from scratch, would we still choose this cost structure?** The answer is almost always no. That gap between today's architecture and what you would build now is the cost of inertia.

## Lens 3: Cost of data choices

For mature customers, this is often where the real money sits.

**Why is this data moving at all?** The simplest question with the most expensive answers. Cross-region transfers, cross-zone replication, ETL pipelines that move data between systems because teams do not trust each other's data stores. Every byte moved has a cost. Most of it is never questioned.

**Does this data need to move in real time, or did we just never challenge the assumption?** I have seen customers paying for real-time replication on datasets that get queried once a day. The architecture decision was made three years ago. Nobody revisited it.

**What data retention choices are compliance-driven versus fear-driven?** This is the backup question but bigger. Compliance requires specific retention for specific data. Fear says "keep everything forever because someone might ask". The cost difference between those two policies is enormous.

**Which datasets are duplicated across platforms because teams do not trust each other's systems?** Data gravity is real. Once data lands in a cloud, moving it costs more than keeping it. Duplicating it across multiple platforms because of organizational dysfunction costs even more.

**Where is analytics architecture causing repeated compute spend for the same answer?** Multiple teams running the same queries on the same data in different tools. Nobody coordinated. Nobody centralized. The compute bill tells the story.

## Lens 4: Cost of organizational choices

This is where most "mature" customers are still less mature than they think.

**Who actually has authority to stop cost growth, not just report on it?** The State of FinOps 2026 shows 78% of FinOps teams report to the CTO or CIO, and teams with VP+ executive engagement show 2-4x more influence over technology selection. Influence is not authority, though. Can someone say no to a deployment that exceeds budget? If the answer is "it depends", the answer is no.

**Are our FinOps reviews producing decisions, or just observations?** Which dashboard has existed for a year without changing behavior? If the monthly FinOps review ends with "interesting" instead of "here is what we are changing", it is a meeting that should be an email.

**Do engineering leaders feel cloud cost personally, or is it still a central problem?** Showback shows people their costs. Chargeback makes them feel it. The State of FinOps data suggests chargeback changes behavior faster, but most organizations default to showback because it is less politically painful.

**Where does optimization work die?** Architecture review, procurement, product leadership, or engineering backlog? Tracking where recommendations go to die is more useful than generating more recommendations.

**What are we unwilling to stop doing, even though we know it is economically wrong?** Every organization has at least one of these. The answer reveals the real power structure.

## The AI cost question nobody has solved

Very relevant now, especially for customers leaning into data, analytics, and AI.

Two years ago, 31% of FinOps teams managed AI spend. Today it is 98% (State of FinOps 2026). The number one missing tool capability is still granular AI cost monitoring — tokens, LLM requests, GPU utilization. The FOCUS spec does not cover AI billing yet. Nobody has built "Azure Advisor for LLM inference."

Organizations are being told to self-fund AI investments through optimization savings. Squeeze money from a landscape where the big rocks are gone, specifically to fund the most unpredictable cost category in cloud. That is a structural conflict.

**Are we measuring the business value of AI workloads against their actual infrastructure and inference cost?** Most are not. AI spend is still categorized as "innovation" even when it has quietly become permanent run cost.

**Which AI workloads are experiments that became permanent?** I see this with GPU-backed services. The proof of concept got funding. It worked. Now it runs in production with the same oversized SKU from the experiment phase because nobody revisited the sizing.

**What is our fallback strategy when premium AI capacity is unavailable, and what does that do to cost?** PTU capacity sells out. Customers hoard allocations at low utilization because releasing them means losing them. The pay-as-you-go alternative has zero allocation in some regions. The cloud was supposed to let you scale what you need and give back the rest. That promise breaks when the allocation model creates artificial scarcity.

## Where ADRs become cost controls

I wrote previously about [why CTOs need to mandate Architecture Decision Records](/posts/architecture-decision-records-cto). In that post, the argument was about preserving context. Here is the extension: for mature customers, ADRs are one of the few artifacts that can absorb these hard FinOps questions without creating a parallel governance process.

Cost is not an optimization concern for mature customers. It is a consequence of architectural intent. An ADR is the right place to capture that intent.

The shift: ADRs should not just record what we chose. They should explicitly record what cost tradeoffs we accepted and why.

A mature ADR answers four cost-relevant questions:

1. **What cost do we accept by design?** "We chose multi-region active-active knowing it introduces higher steady-state run cost, which is acceptable because it enables the SLA we committed to."
2. **What alternative cost paths did we reject?** "Single-region active-passive was cheaper. Rejected because recovery time would exceed business tolerance." This matters later when someone asks "why is this so expensive?". The answer is in the ADR, not institutional memory.
3. **What assumptions drive cost growth?** "Traffic growth will be linear. Data retention requirements will not change". Most mature-cloud cost overruns come from invalidated assumptions, not bad initial decisions. Calling them out gives FinOps and architecture a shared trigger to reopen decisions.
4. **When should this decision be revisited?** "If cost exceeds $X per unit per month, this decision must be revisited." This is the most powerful and least-used part of ADRs.

If a customer says "cost does not belong in ADRs", they are implicitly saying cost is someone else's problem later. Mature customers do not believe that. They just have not formalized the discipline yet.

ADRs become the mechanism that prevents re-litigating cost after the money is already spent. FinOps reviews ask "why is this expensive?" ADRs answer "we chose this expense, for these reasons, under these assumptions". That difference reduces defensive conversations, prevents hindsight bias, surfaces political versus technical decisions, and gives leadership a place to challenge tradeoffs before cost shows up.

## Do not run the cloud like a Ferrari

I always tell people: do not run the cloud like a Ferrari, because nobody can afford the maintenance. Run it like a Toyota Corolla. A car that just works, is not fancy, and does not cost a fortune to keep on the road.

Flexera's 2026 report shows that 64% of organizations now measure success by value delivered to business units, up 12 points year over year. The goal is not the lowest possible cloud bill. It is the best return on every dollar spent.

Spring cleaning is not about cutting everything to the bone. It is about cutting the waste so the budget goes where it creates value. For mature customers, it is also about asking whether the choices that created the cost structure still make sense.

## This week

If you have not done the quick wins, start there. Enable cost tagging, audit your managed disks, question your backup retention, find the orphans, check commitment utilization, shut down dev/test off-hours.

If you have done all that and still feel like you are not making progress, the problem is not hygiene. The problem is that you are optimizing within a cost structure that nobody has questioned.

Pick one of the four lenses and bring it to your next architecture review:

1. **Cost of architecture choices.** What are we paying for because of design?
2. **Cost of product choices.** What are we paying for because of what the business asked for?
3. **Cost of organizational choices.** What are we paying for because ownership is unclear or duplicated?
4. **Cost of inertia.** What are we paying for because change is harder than overspend?

The harder question is what happens after the review. Someone needs to act on what you find. In my next post, I write about who that someone is, and how agentic AI can bridge the gap between seeing a cost problem and actually fixing it.

Like my apple tree. A multi-grafted semi-dwarf can set 500 to 800 fruit after pollination. Without thinning, most of them stay small, compete for the same nutrients, and half drop before they ripen. The ones that survive attract wasps and codling moth larvae that spread to the healthy fruit. The tree exhausts itself producing apples nobody will eat and then has nothing left for next year.

Orchardists thin 50 to 70% of that fruit on purpose. The "waste" is deliberate. It makes the remaining apples larger, healthier, and prevents alternate bearing where you get one good year followed by one terrible year.

I would rather have 200 good apples than 800 bad ones. The cloud works the same way. I would rather have every resource producing value than 10,000 resources where nobody can tell which ones matter.

I prune so the tree produces enough for my family, the extended family, and the neighbors. Enough to eat fresh. Enough to make apple butter, apple cider, apple pie, apple sauce, and still have a box to give away. That is not scarcity. That is the right amount of growth for the capacity I have.

The cloud estate works the same way. If every resource runs unchecked, the waste spreads. If every cost decision goes unquestioned, the waste is structural. Pruning dead branches is not enough. You have to ask, did I prune the tree correctly this year.

The good thing about an apple tree is that mistakes are recoverable. Cut the wrong branch, and new growth comes back next season. Have a bad harvest, and you learn what to prune differently next year. I could remove that tree entirely, but it has been producing for over 20 years. It is well established. It just needs to be managed with intention.

The tree wants to grow. It wants to feed the whole neighborhood. Left unchecked, it will try. It will set 800 fruit, exhaust its root system, split its branches, and produce nothing worth picking. My job is not to stop it from growing. My job is to make it grow smart. Trim what does not produce. Keep what does. Make sure the energy goes where the yield is.

That is the CTO's job with cloud spend. The infrastructure wants to grow. Teams want to build. The business wants to scale. None of that is wrong. The question is whether anyone is pruning with intention, or whether the tree is just growing in every direction because nobody told it not to.

---

**Disclaimer:** I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
