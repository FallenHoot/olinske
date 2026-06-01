# Research Evidence Pack: FinOps Beyond the Quick Wins

**Researcher:** research-analyst
**Date:** 2026-04-29
**For post:** 000045-spring-cleaning-cloud-finops
**Confidence key:** HIGH = 2+ independent sources confirm | MEDIUM = single credible source | LOW = inferred or anecdotal | UNCERTAIN = conflicting data

---

## 1. The Economics Nobody Discusses

### 1.1 Is 29% waste real, or is it misleading?

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Cloud waste is 29% of IaaS/PaaS spend in 2026 | Self-reported estimate from survey respondents | Flexera 2026 State of the Cloud (N=753) | HIGH |
| This is UP for the first time in 5 years | "After five years of decline, wasted cloud spend increased slightly to 29%, reflecting growing cost complexity from AI and new IaaS and PaaS services." | Flexera 2026 | HIGH |
| Wasted cloud *software* spend also inched up 1pt | Separate metric from IaaS/PaaS waste | Flexera 2026 | HIGH |
| 8% of respondents are not tracking SaaS costs at all (up from 5%) | Opens the door to shadow IT; real waste is likely higher than reported | Flexera 2026 | HIGH |

**Why this is non-obvious:** The 29% figure is self-reported. Organizations that are already sophisticated enough to take a survey and measure waste are the ones most likely to have caught the low-hanging fruit. The actual waste in orgs that do not measure is almost certainly higher. The reversal of a 5-year downward trend is the real story: AI and SaaS sprawl are creating new waste faster than FinOps can govern it.

**Blog connection:** Zach's draft says "Flexera's 2026 report disagrees: cloud waste is at 29%, trending UP." This is correct. The deeper angle: the 29% number is *conservative* because it only captures what respondents think they waste. The 8% who do not track SaaS at all are invisible in this statistic.

### 1.2 The hidden cost of optimization itself

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Mature teams report diminishing returns on optimization | "We have hit the 'big rocks' of waste and now face a high volume of smaller opportunities that require more effort to capture." | State of FinOps 2026 (practitioner quote) | HIGH |
| One advanced practitioner reached 97% optimization in their Cost Optimization Hub, with remaining 3% intentionally not actioned | Explicit mention in survey results | State of FinOps 2026 | MEDIUM (single data point) |
| FinOps teams managing $100M+ average only 8-10 practitioners + 3-10 contractors | Team size data from survey | State of FinOps 2026 | HIGH |
| "The days of finding something that's grossly misconfigured are years ago" | Direct quote from advanced practitioner at large enterprise | State of FinOps 2026 | MEDIUM |
| Shift-left measurement is unsolved: "Once you fix it, it's gone. How do we give developers credit for shift-left activities?" | Top unsolved challenge cited multiple times | State of FinOps 2026 | HIGH |

**Why this is non-obvious:** Nobody calculates the engineering cost of optimization. If a team of 10 practitioners costs $2M/year in salary, and they save $5M, the net is $3M. The ratio deteriorates as easy wins disappear. The shift-left measurement problem means even when you prevent waste, you cannot prove you did.

**Blog connection:** Add a section: "The cost of cutting costs." Frame the 97% optimization example as the ceiling. The remaining 3% costs more to chase than it saves.

### 1.3 The optimization plateau

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Optimization as a priority is declining relative to other FinOps priorities | "Collectively, Scopes expansion, Governance/Policy, Organizational Alignment, and Forecasting outweigh optimization alone." | State of FinOps 2026 | HIGH |
| FinOps for AI is now the #1 forward-looking priority, ahead of optimization | 33% selected FinOps for AI; 25% selected workload optimization | State of FinOps 2026 priority rankings | HIGH |
| Many organizations are asked to self-fund AI investments through optimization savings | "Creating direct pressure to find efficiency gains that can be redirected toward AI initiatives" | State of FinOps 2026 | HIGH |

**Why this is non-obvious:** The "squeeze optimization to fund AI" dynamic creates a perverse incentive. Teams are expected to find savings in a landscape where the big rocks are gone, specifically so the money can be spent on AI workloads whose costs are unpredictable.

**Blog connection:** This is the perfect "what comes after spring cleaning" narrative. You prune the tree not to have less fruit, but to redirect energy to the branches that will produce AI workloads.

### 1.4 The commitment trap

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Fewer than half of organizations use any single commitment discount per provider | Explicit finding | Flexera 2026 | HIGH |
| Azure RI/SP adoption increased 4pts YoY; AWS RI increased 3pts | Modest growth but still <50% penetration | Flexera 2026 | HIGH |
| "Many organizations prioritize innovation and are reluctant to restrict engineers to specific resources" | Explanation for low commitment adoption | Flexera 2026 | HIGH |
| Azure Enterprise Agreement fell to 43% as Microsoft phases it out, transitioning to MCA-E | Market shift in agreement structures | Flexera 2026 | HIGH |

**Why this is non-obvious:** The commitment trap works both ways. Under-commitment means overpaying 30%+ on stable workloads. Over-commitment means paying for capacity you do not use. The fact that <50% use *any* discount suggests most organizations are stuck in the flexibility vs. savings trap.

**Blog connection:** Zach's draft covers commitment utilization. The deeper angle: the Azure EA-to-MCA-E transition is changing the game. Many customers are confused about what discounts they even qualify for under new agreement structures.

### 1.5 The real cost of multi-cloud

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| 73% of organizations operate hybrid estates (up 3pts YoY) | Survey data | Flexera 2026 | HIGH |
| Multi-cloud adoption up 2pts YoY | But only 14% are purely multi-cloud without private cloud | Flexera 2026 | HIGH |
| "Many organizations end up with complex cloud environments by happenstance rather than by design" | Mergers, acquisitions, siloed teams | Flexera 2026 | HIGH |
| Multi-cloud cost reporting is a priority for 14% of respondents | Among the lower-ranked priorities | State of FinOps 2026 | HIGH |
| Applications isolated in distinct environments remain the leading cause for multi-cloud setups | Not strategic workload placement | Flexera 2026 | HIGH |

**Why this is non-obvious:** Multi-cloud is mostly accidental, not strategic. The costs (egress, tooling duplication, team cognitive overhead) compound because nobody planned for it. Workload placement by design is the least common motivation.

**Blog connection:** A "multi-cloud is usually a mistake, not a strategy" angle would be contrarian and resonant. Most CTOs inherited multi-cloud through M&A, not choice.

---

## 2. AI's Impact on Cloud Economics

### 2.1 AI workloads break traditional FinOps

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| 98% of FinOps teams now manage AI spend (up from 63% in 2025 and 31% in 2024) | Two-year acceleration from niche to universal | State of FinOps 2026 | HIGH |
| AI cost management is the #1 skillset teams want to add | Across all organization sizes | State of FinOps 2026 | HIGH |
| Top challenge: visibility into AI costs (pricing models vary widely across providers) | Multi-select survey question | State of FinOps 2026 | HIGH |
| Second challenge: allocating AI costs to business units | Harder than traditional infrastructure | State of FinOps 2026 | HIGH |
| Third challenge: determining AI value/ROI ("Is your AI providing value? No one can answer that question yet.") | Direct practitioner quote | State of FinOps 2026 | HIGH |
| Granular monitoring of AI spend (tokens, LLM requests, GPU utilization) is the #1 missing tool capability | Top of the "what doesn't exist yet" list | State of FinOps 2026 | HIGH |
| Dynamic usage makes cost forecasting hard; rightsizing for cost and performance is a delicate balance; new pricing metrics make visibility a challenge | "Reminiscent of the top challenges in the early days of cloud" | Flexera 2026 | HIGH |
| 30% cite cost unpredictability as a top AI workload challenge | Equal to skills gaps | Flexera 2026 | HIGH |
| Only 12% say lack of AI-specific FinOps skills is a challenge | FinOps frameworks feel adequate; data and tooling do not | Flexera 2026 | HIGH |

**Why this is non-obvious:** The 98% figure (from 31% in two years) is the fastest scope expansion in FinOps history. FinOps practitioners feel they have the frameworks, but the tooling and data visibility have not caught up. Token-based billing is fundamentally different from compute-hour billing, and nobody has built the equivalent of Azure Advisor for LLM inference.

**Blog connection:** This is the strongest "what comes next" angle. Spring cleaning the existing compute is necessary, but AI spend is growing in a visibility vacuum. Zach should frame this as the new generation of "big rocks" that are invisible to traditional tools.

### 2.2 The "fund AI through savings" dynamic

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Many organizations are asked to self-fund AI investments through optimization savings | Multiple mentions in State of FinOps 2026 | State of FinOps 2026 | HIGH |
| "Squeeze more from existing footprint to create space for AI spend" | This accelerates optimization urgency even as traditional waste opportunities diminish | State of FinOps 2026 | HIGH |

**Why this is non-obvious:** Leadership says "find savings to pay for AI." FinOps teams are expected to find money where the big rocks are already gone, specifically to fund the most unpredictable cost category in cloud. This is a structural conflict.

### 2.3 Token-based vs. compute-based billing (UNCERTAIN — limited primary source data)

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| AI pricing models vary widely; token, inference, training hour, PTU are all different billing dimensions | Implicit in "visibility into AI costs" being the top challenge | State of FinOps 2026 + Zach's own PTU research | MEDIUM |
| FOCUS spec top expansion request is AI workloads | Practitioners want standardized AI billing data | State of FinOps 2026 | HIGH |

**Blog connection:** Reference Zach's earlier PTU vs TPM post. The billing fragmentation across AI services makes traditional FinOps tooling blind. FOCUS does not yet cover AI workloads, which means there is no standard way to normalize AI billing data.

---

## 3. Organizational Dysfunction

### 3.1 FinOps teams: where they sit matters

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| 78% of FinOps teams report to CTO/CIO (up 18pts vs 2023) | Definitive shift to technology org | State of FinOps 2026 | HIGH |
| Only 8% report to CFO | Down significantly | State of FinOps 2026 | HIGH |
| VP/SVP/C-suite engagement shows 2-4x more influence over technology selection vs. Director-only | Cloud service selection: 53% vs 24%; Cloud provider selection: 47% vs 16%; Cloud vs data center: 28% vs 12% | State of FinOps 2026 | HIGH |
| FinOps teams are "small central teams that drive standards, tooling, and governance while enabling distributed accountability through federated champions" | Dominant operating model | State of FinOps 2026 | HIGH |

**Why this is non-obvious:** The CFO-decline is striking. FinOps moved from "finance oversight" to "technology capability." Teams that report to engineering have more influence over decisions that matter. The 2-4x multiplier on technology selection influence is the most compelling argument for where FinOps should sit.

**Blog connection:** If Zach's audience is CTOs, the message is: "FinOps should report to you, not to finance. The data shows 2-4x more influence when it does."

### 3.2 The "acknowledge and move on" problem

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Cost optimization recommendations are available but not acted on | Zach's draft: "whether anyone acts on the recommendations or just acknowledges the notification and moves on" | Draft post (Zach's experience) | HIGH (firsthand) |
| Shift-left measurement unsolved: cannot credit developers for cost avoidance | "Once you fix it, it's gone" | State of FinOps 2026 | HIGH |
| Proposed solutions: FinOps in performance reviews, unit cost tracking with chargeback reductions, separate FinOps department budgets for recognition | Community discussion, not proven | State of FinOps 2026 | MEDIUM |
| 56% of orgs prioritize cost optimization over sustainability; 30% equal | Cost always wins when forced to choose | Flexera 2026 | HIGH |

**Why this is non-obvious:** The incentive structure is broken. Engineers are measured on feature delivery, not cost efficiency. Until FinOps shows up in performance reviews, recommendations will be acknowledged and filed.

### 3.3 Showback vs. chargeback

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Allocation is the #1 capability teams apply first to any new technology scope (SaaS, licensing, data center, data cloud) | Consistent across all technology types | State of FinOps 2026 | HIGH |
| Full allocation of cloud spending is a priority for 14% of respondents | Still unfinished for many | State of FinOps 2026 | HIGH |
| FinOps teams scaling through enablement and embedded champions, not headcount | 8-10 practitioners for $100M+ spend | State of FinOps 2026 | HIGH |

**Why this is non-obvious:** Allocation (knowing who spends what) is table stakes. Chargeback (making teams pay) is the behavior change mechanism. Most organizations are still at the showback stage. The data does not directly compare showback vs. chargeback effectiveness, which is itself telling: the industry has not proven which works better.

**Blog connection:** Zach could note that visibility without accountability is just expensive dashboards.

### 3.4 The Q4 budget problem (UNCERTAIN — limited primary data)

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| 17% exceeded their cloud budget last year | Survey data | Flexera 2026 | HIGH |
| 27% expect to increase cloud spending | Stable year over year | Flexera 2026 | HIGH |
| Q4 "use it or lose it" dynamics | Zach mentions this in his draft fiscal rhythm section | Zach's draft + general enterprise finance knowledge | MEDIUM |

**Blog connection:** Zach already has a strong Q4 section in his draft. The 17% budget overrun number supports the "accurate forecasting remains a persistent challenge" angle.

---

## 4. Data and Storage Economics

### 4.1 Observability costs: the hidden budget killer

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Observability bill may grow at 3x, 5x, or 10x the rate of traffic growth | Depends on how many telemetry tools (metrics, logs, traces, APM, RUM) collect overlapping data | Charity Majors / Honeycomb "The Cost Crisis in Observability Tooling" (updated Dec 2024) | MEDIUM (single vendor source, but technically sound) |
| "You're now paying to store telemetry five different ways, in five different places, for every single request" | 5x multiplier is the modest case | Charity Majors / Honeycomb | MEDIUM |
| A single custom metric can cost $30K/month | Anecdotal but illustrative of pricing opacity | Charity Majors / Honeycomb | LOW (anecdotal) |
| Metrics bills are "incredibly opaque (possibly by design)" | Vendor criticism, but widely acknowledged | Charity Majors / Honeycomb | MEDIUM |
| Data cloud platforms and AI are the most actively managed SaaS/PaaS areas, followed by observability and security tooling | FinOps attention gravitating to where spend grows fastest | State of FinOps 2026 | HIGH |
| Observability vendors (Datadog, Splunk) are among the top SaaS categories managed by FinOps | Implicit in "data cloud platforms" being top priority | State of FinOps 2026 | MEDIUM |

**Why this is non-obvious:** Observability is the meta-cost: you pay to watch yourself spend money. The multiplier effect (5x or more tools collecting overlapping data) means observability costs can silently exceed the cost of the infrastructure being observed. Most FinOps reports do not call out observability as a distinct spend category.

**Blog connection:** Strong angle for Zach: "You cannot optimize what you cannot see. But the cost of seeing is itself an optimization problem."

### 4.2 Data gravity and lock-in

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Workload and data repatriation each increased 2pts YoY | Organizations trying to leverage hybrid by placing workloads optimally | Flexera 2026 | HIGH |
| 73% operate hybrid cloud | Dominant architecture | Flexera 2026 | HIGH |
| Optimizing costs after migration fell from 3rd to 5th challenge; assessing on-prem vs cloud costs rose | Shift-left: considering costs before migration, not after | Flexera 2026 | HIGH |
| Understanding application dependencies is the #1 migration challenge | Technical feasibility is #2 | Flexera 2026 | HIGH |

**Why this is non-obvious:** The shift from "optimize after migration" to "assess costs before migration" is a maturity signal. But data gravity means the assessment is asymmetric: moving data in is easy (free ingress), moving data out is expensive (egress charges). The 2pt increase in repatriation is small but directionally significant.

---

## 5. Emerging FinOps Frontiers

### 5.1 FinOps for Kubernetes

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| Granular shared cost and container allocation is a top requested missing tool capability | Listed under "additional themes" for desired features | State of FinOps 2026 | HIGH |
| OpenCost is a CNCF incubating project for K8s cost allocation | Vendor-neutral, supported by Adobe, AWS, Google Cloud, Grafana, Kubecost, Microsoft, New Relic, Oracle | opencost.io | HIGH |
| OpenCost provides: real-time container-level allocation, dynamic asset pricing via AWS/Azure/GCP billing APIs, GPU/memory/load balancer/PV allocation | Feature list | opencost.io | HIGH |

**Why this is non-obvious:** Kubernetes cost attribution remains broken in practice because shared resources (nodes, load balancers, persistent volumes) do not map cleanly to namespace-level ownership. OpenCost is the closest thing to a standard, but it is still incubating. The gap between "we can allocate costs" and "we can charge back costs at the namespace level" is where organizations struggle.

**Blog connection:** For Zach's enterprise audience, K8s cost attribution is the next frontier after VM-level optimization. If you are running AKS, OpenCost + Azure Cost Management integration is the play.

### 5.2 FinOps for SaaS sprawl

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| 90% of FinOps teams now manage SaaS or plan to (up from 65% in 2025) | Massive scope expansion | State of FinOps 2026 | HIGH |
| 8% not tracking SaaS costs at all (up from 5%) | Shadow IT growing | Flexera 2026 | HIGH |
| Gartner reported 12% SaaS spending growth in 2025, forecasts 15% in 2026 | External validation | Flexera 2026 (citing Gartner) | HIGH |
| "Leadership identified SaaS as an area of 'sprawl' and that costs could really spiral out of control quickly" | Practitioner quote | State of FinOps 2026 | HIGH |
| SAM team involvement in cloud cost management grew from 6% to 15% | Software asset management joining the game | Flexera 2026 | HIGH |
| Wasted cloud software spend inched up despite more organizations managing it | The growth is outpacing governance | Flexera 2026 | HIGH |

**Why this is non-obvious:** SaaS is the new shadow IT. Every team can buy SaaS with a credit card. FinOps teams are being asked to govern a spend category they did not create and cannot control without organizational authority. The 8% who do not track SaaS at all are the canary.

### 5.3 FOCUS spec: what it solves and what it does not

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| FOCUS normalizes billing data across cloud providers | Core value proposition | focus.finops.org | HIGH |
| Supported by: AWS (v1.2), Azure (v1.2), GCP (v1.0), Oracle (v1.0), Tencent, Huawei, OVHCloud, Alibaba, Nebius | Multi-vendor adoption | focus.finops.org | HIGH |
| Top expansion requests: AI workloads, data center, broader SaaS/PaaS support | What FOCUS does NOT yet cover | State of FinOps 2026 | HIGH |
| FOCUS does not cover AI billing dimensions (tokens, inference, training) | Gap identified by practitioners | State of FinOps 2026 | HIGH |

**What FOCUS solves:** Cross-provider billing normalization. If you are multi-cloud, FOCUS means you can compare Azure and AWS costs in the same schema without building custom ETL.

**What FOCUS does NOT solve:** AI workload billing, SaaS normalization, data center cost modeling. These are the fastest-growing spend categories. FOCUS is building the road, but the traffic has already moved to highways it has not paved yet.

**Blog connection:** FOCUS is worth mentioning as a signal of maturity, but Zach should note it currently only covers traditional IaaS/PaaS. The AI billing gap is the biggest missing piece.

### 5.4 Sustainability as a FinOps dimension

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| 56% prioritize cost optimization over sustainability; 30% prioritize equally | Cost wins when forced to choose | Flexera 2026 | HIGH |
| Only 38% have a defined sustainability initiative with carbon tracking (up from 36%) | Low and flat adoption | Flexera 2026 | HIGH |
| European sustainability reporting requirements (CSRD) have been pushed out | Regulatory pressure relaxed | Flexera 2026 | HIGH |
| Reporting on cloud carbon is a priority for only 5% of FinOps teams | Dead last in priority rankings | State of FinOps 2026 | HIGH |
| European respondents: 47% have sustainability initiatives (up from 43%) | Higher than global but still minority | Flexera 2026 | HIGH |

**Why this is non-obvious:** Despite the narrative, sustainability is not yet a FinOps priority. It ranks dead last at 5%. The CSRD delays in Europe removed the regulatory urgency. For Zach's Norwegian audience, this may be different (Norway has strong ESG culture), but the global data says carbon-aware computing is still aspirational.

**Blog connection:** Worth a mention for European relevance. Zach could position carbon-aware computing as "the FinOps dimension nobody is prioritizing but everyone will have to." The 47% Europe figure is relevant for his audience.

---

## 6. Contrarian Takes

### 6.1 Is FinOps temporary? Will AI auto-optimize?

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| AI for FinOps is a top future priority (24% selecting it) | Teams want AI to help them do FinOps | State of FinOps 2026 | HIGH |
| Early AI use cases: anomaly detection, automated right-sizing, natural language cost querying, automated discount procurement, tagging | Starting as advantage for advanced teams | State of FinOps 2026 | HIGH |
| "AI is viewed as a capability amplifier, not a substitute for FinOps expertise" | Explicit framing | State of FinOps 2026 | HIGH |

**Contrarian assessment:** AI will automate the mechanical parts of FinOps (right-sizing recommendations, anomaly detection, tagging). It will not automate the organizational and political parts (getting teams to act, aligning budgets with business value, negotiating commitments). FinOps as a discipline will evolve, not disappear.

### 6.2 Are cloud providers incentivized to make optimization hard?

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| AWS generated over $5B in Q4 2022 profits alone | DHH citing CNBC | DHH blog post (June 2023) | HIGH (public financial data) |
| Commitment discount structures are complex enough that <50% adopt them | Flexera 2026 | HIGH |
| Azure EA phaseout to MCA-E adds transition complexity | Flexera 2026 | HIGH |
| Observability pricing is "incredibly opaque (possibly by design)" | Charity Majors | MEDIUM (opinion) |
| Free ingress / expensive egress is the universal cloud pricing structure | Well-known industry fact | HIGH |

**Contrarian assessment:** This is the hardest claim to make as a Microsoft employee. Zach should acknowledge the structural incentive without directly accusing any provider. The framing: "Cloud providers make money when you use more. Optimization tools exist, but the default path is growth." The free-ingress/expensive-egress asymmetry is the most defensible example of structural bias.

### 6.3 Cloud repatriation: is on-prem actually cheaper?

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| 37signals (DHH) saves $1.5M/year after $500K hardware buy | From $3.2M annual cloud spend | DHH blog (June 2023) | HIGH |
| Dropbox saved $74.6M over 2 years by building own infrastructure | SEC S-1 filing (2018) | GeekWire/SEC | HIGH |
| Dropbox still uses AWS for <10% of storage (Europe serving) | Hybrid exit, not total exit | GeekWire | HIGH |
| DHH: "The benefits [of cloud] have been vastly overstated. Cloud is often just as complicated as running things yourself, and it's usually ridiculously more expensive." | Opinion, not generalizable | DHH blog | MEDIUM (one company) |
| DHH: "Most established companies that can amortize capital investments over a few years should seriously reconsider the cloud craze" | Specific to stable, predictable workloads | DHH blog | MEDIUM |
| DHH: "We've been able to do this without changing the size of the operations team at all. Running our applications in the cloud never provided the promised productivity gains." | Counterpoint to cloud staffing argument | DHH blog | MEDIUM (one company) |
| Cloud-based workload repatriation increased 2pts YoY | Small but persistent trend | Flexera 2026 | HIGH |

**Contrarian assessment:** Repatriation works for specific profiles: stable workloads, predictable capacity, strong ops team, amortizable CapEx budget. DHH and Dropbox are real examples but not generalizable to enterprises with variable workloads, compliance requirements, or multi-region needs. The 2pt repatriation increase in Flexera is directionally interesting but still marginal compared to the 73% hybrid adoption.

**Blog connection:** Zach should acknowledge repatriation as legitimate for specific workloads, not dismiss it as contrarian noise. The framing: "Not everything belongs in the cloud. The question is whether you know which workloads should come home."

### 6.4 Does "unit economics" actually work?

| Claim | Evidence | Source | Confidence |
|-------|----------|--------|------------|
| 49% of organizations track a unit metric (up from 40%) | Growing adoption | Flexera 2026 | HIGH |
| Enterprises (53%) are much more likely than SMBs (32%) to measure unit economics | Resource-dependent capability | Flexera 2026 | HIGH |
| Defining unit economics is a rising priority (up 5 places in priority rankings) | Momentum | State of FinOps 2026 | HIGH |
| "Value delivered to business units" is now the top metric at 64% (up 12pts) | Shift from cost to value | Flexera 2026 | HIGH |
| Cost efficiency/savings as a metric dropped 6pts | Declining relative importance | Flexera 2026 | HIGH |

**Contrarian assessment:** Unit economics is gaining traction because it reframes cost as a ratio (cost per transaction, cost per customer), which is more useful than absolute cost. The shift from "we spend $X" to "it costs $Y per unit of business value" is real. The danger is that unit economics becomes a vanity metric if the unit is poorly defined.

---

## Source Quality Assessment

| Source | Type | Date | Quality | Bias Risk |
|--------|------|------|---------|-----------|
| State of FinOps 2026 | Survey (N=1192, $83B managed) | Feb 2026 | HIGH | Pro-FinOps (it's a FinOps Foundation survey) |
| Flexera 2026 State of Cloud | Survey (N=753) | Winter 2025 survey | HIGH | Pro-Flexera tools |
| DHH / 37signals | First-person blog | June 2023 | MEDIUM | Anti-cloud bias; one company's experience |
| Dropbox S-1 | SEC filing | Feb 2018 | HIGH | Historical; company-specific |
| Charity Majors / Honeycomb | Blog post | Updated Dec 2024 | MEDIUM | Pro-Honeycomb; but technically rigorous |
| OpenCost | Project website | Current | HIGH | Open source, CNCF-backed |
| FOCUS spec | Specification site | Current | HIGH | FinOps Foundation project |

---

## Suggested Additions to Zach's Draft

### Priority 1 (strongest material)

1. **The 29% paradox.** The waste number went UP for the first time in 5 years, driven by AI and SaaS. The draft mentions this but should emphasize: the five-year decline was the FinOps success story; the reversal is the warning.

2. **"Fund AI through savings."** The structural conflict: leadership demands optimization savings to pay for AI, but AI is the thing creating new unoptimizable spend. This is the most original angle in the research.

3. **AI visibility vacuum.** 98% manage AI spend, but the #1 tool gap is granular AI cost monitoring. FOCUS does not cover AI billing yet. Zach has firsthand PTU experience to draw on.

4. **FinOps reports to technology, not finance.** 78% CTO/CIO, only 8% CFO. The 2-4x influence multiplier. This is actionable for Zach's CTO audience.

5. **The observability cost paradox.** Paying 5x to store overlapping telemetry. Observability costs growing faster than the infrastructure being observed.

### Priority 2 (good supporting material)

6. **Multi-cloud is usually accidental.** Most hybrid/multi-cloud is from M&A, not strategy. The costs compound because nobody planned for it.

7. **SaaS sprawl is the new shadow IT.** 90% managing SaaS, but 8% not even tracking costs. SAM teams entering the picture.

8. **Kubernetes cost attribution still broken.** OpenCost is incubating but namespace-level chargeback remains unsolved.

9. **Repatriation is legitimate for specific workloads.** DHH saved $1.5M/year. Dropbox saved $74.6M. Flexera shows 2pt repatriation increase.

### Priority 3 (worth mentioning)

10. **FOCUS spec: road under construction.** Valuable for multi-cloud normalization but missing AI, SaaS, data center.

11. **Sustainability dead last at 5% priority.** Despite narrative, carbon-aware computing is aspirational. Norway/Europe may be different.

12. **The commitment discount adoption gap.** <50% use any discount, and Azure EA-to-MCA-E transition adds confusion.

---

## Open Questions (for Zach to decide)

1. **How much of his PTU experience to reference?** The AI economics section would be much stronger with firsthand Azure OpenAI observations, but the post is framed as "spring cleaning" not "AI cost management."

2. **How contrarian to go on cloud providers?** The "structural incentive to make optimization hard" angle is strong but requires careful framing as a Microsoft employee.

3. **Single post or series?** The material here supports a follow-up post: "What Comes After Spring Cleaning" or "The Hard Problems in FinOps Nobody Talks About."

4. **European angle?** 52% of European respondents run significant workloads on Azure (vs 41% AWS). 65% of European orgs have FinOps teams (up 9pts YoY). Norway/Nordics are underrepresented but the European data is relevant.

---

*Research completed 2026-04-29. All claims sourced from publicly available data. Pricing claims should be verified per the 30-day shelf life rule before publish.*
