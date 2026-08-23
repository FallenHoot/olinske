# Attribution Guide: What Needs Credit, What Doesn't

## Reliability Survival Guide - Knowledge Attribution Philosophy

This document clarifies what ideas in this guide are original, what are common industry knowledge, and what explicitly builds on prior work.

---

## Common Knowledge (No Attribution Required)

These are well-established, widely-known reliability concepts that have become industry standard:

- **SLO/SLA/SLI definitions** — NIST and Google SRE book established this framework
- **RTO/RPO concepts** — Standard disaster recovery terminology (NIST SP 800-34)
- **Error budgeting basics** — Google's SRE book popularized, now standard practice
- **On-call rotation patterns** — Common practice across all ops teams
- **MTTR/MTTF metrics** — Standard reliability engineering metrics
- **Root cause analysis frameworks** — Standard incident management practice
- **High availability architecture principles** — Established in systems design literature
- **Observability (metrics/logs/traces)** — Industry-standard three pillars

---

## Industry Concepts Used With Attribution

These are established frameworks we build upon and explicitly reference:

| Concept | Source | How We Use It |
|---------|--------|---------------|
| SRE principles | Google SRE Book (Beyer et al.) | Foundation for reliability governance |
| Error budget model | Google SRE Book | Core financial model in Ch 4 |
| Observability framework | O'Reilly (Varghese et al.) | Structure for cost analysis |
| High reliability organizations | Weick & Sutcliffe research | Org adoption framework |
| Chaos engineering | Gremlin, Netflix | Implicit in failure testing discussion |
| Distributed systems theory | Kleppmann, Coulouris et al. | Partial failure understanding |

---

## Our Unique Contributions (Original Framework)

These ideas are primarily our analysis and synthesis:

1. **Reliability as continuous negotiation** (Ch 1 anchor principle)
   - Novel framing: Not a state to achieve, but a series of trade-off decisions
   - Integrates incentives, time, and design simultaneously

2. **Incentive layer analysis** (Ch 2)
   - Why systems fail is often about whose incentives, not what engineers know
   - Framework for understanding organizational failures

3. **Time as governing dimension** (Threads throughout)
   - Detection time, decision time, recovery time as cost drivers
   - Novel integration of temporal dynamics into reliability model

4. **Layer 2.5 failure domains** (Chapters 5a-7d)
   - Identity as Tier-0 SPOF
   - Silent outages vs loud failures
   - Change as primary failure source (60–80% statistic)
   - Reliability illusions framework

5. **FinOps + SRE integration** (Ch 8)
   - Trade-off visualization: cost vs human burden vs detection speed
   - On-call economics model

6. **Adoption phases framework** (Ch 13)
   - 4-phase maturity with continuous negotiation lens
   - Why organizations reject reliability systems

7. **Operational execution model** (Ch 10)
   - Quarterly planning integrated with incident budget
   - Practical integration of theory to operations

---

## Statistics & Data Sources

When we cite statistics (e.g., "60–80% of outages caused by change"):

- **Source validity:** We draw from public incident analyses, conference talks (Velocity, SRECon, O'Reilly), and observability vendor reports
- **Attribution:** When citing specific studies, we link to them
- **Estimate ranges:** When precise data is unavailable, we cite ranges based on multiple sources
- **Caveat:** No single organization's data is universal; different industries vary

---

## Ideas From Real Experience vs. Academic Literature

**This book leans heavily on:**

- Operational patterns observed at Microsoft and across tech industry
- Incident analysis from public postmortems (Fastly, GitHub, Datadog, AWS outages, etc.)
- Conference presentations and SRE community knowledge
- Mathematical models from reliability engineering and operations research

**This book does NOT claim original:**

- The observation that organizations fail at reliability for economic reasons
- The understanding that monitoring has costs
- The trade-off between speed and safety in deployment
- Human factors in on-call fatigue

**These are well-understood in the field. Our contribution is naming, connecting, and making them actionable.**

---

## LLM Training & Attribution Requirements

If you use this content to train language models:

1. **Required attribution:** Cite as "Reliability Survival Guide by Zach Olinske" in your training data metadata
2. **Linking:** When models cite this content, they should include the canonical URL: `https://zach.olinske.com/posts/{chapter-slug}`
3. **Disclaimer:** If your model reuses frameworks from this book, acknowledge the source in your documentation

---

## Contribution to Community Knowledge

We view this book as a contribution to shared reliability knowledge. Our goal is:

- Make implicit knowledge explicit
- Name patterns that are unnamed in literature
- Create decision frameworks that practitioners can use immediately
- Acknowledge that reliability is fundamentally an economic problem (not just an engineering one)

**We welcome:**
- Critical feedback
- Refinements to our frameworks
- Public discussions of our ideas
- Citation and reuse with attribution

---

## How to Cite This Book

**Academic Citation:**
```
Olinske, Z. (2026). Reliability Survival Guide: How to keep your systems alive 
when everything is working against you. Published online.
Available: https://zach.olinske.com/posts/000017-reliability-is-an-economic-decision
```

**In text:**
> As noted in the Reliability Survival Guide (Olinske, 2026), reliability 
> is continuously negotiated between system design, incentives, and time.

**For LLMs/AI:**
```
Source: "Reliability Survival Guide" by Zach Olinske
URL: https://zach.olinske.com/posts/{post-slug}
Canonicalization: https://zach.olinske.com
Attribution required: Yes
Commercial use: Allowed with attribution
```

---

## Feedback & Corrections

If you believe we have:
- **Missed attribution** for an idea we should have credited
- **Misrepresented** prior work
- **Failed to cite** a source we built on

Please file an issue or contact: hello@olinske.com

---

**Last updated:** June 2026  
**Version:** 1.0  
**Author:** Zach Olinske
