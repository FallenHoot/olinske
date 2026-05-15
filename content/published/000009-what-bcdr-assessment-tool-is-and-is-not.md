---
title: "What the BCDR Assessment Tool Is, and Is Not"
description: "This post explains how to use the BCDR Assessment tool correctly, where provider SLAs fit, and where teams must define their own SLO and customer commitment."
publishDate: 2026-05-15
tags:
  - cloud-architecture
  - bcdr
  - reliability
  - sla
  - slo
coreQuestion: "How should teams interpret outputs from the BCDR Assessment tool without confusing provider SLA with product commitments?"
bluf:
   - The BCDR Assessment tool models dependency-level availability and commitment risk. It does not define your customer SLA on its own.
   - Cloud provider SLAs are inputs to architecture decisions, not a direct template for your own contractual promise.
   - Every team still needs explicit policy decisions on maintenance windows, exclusions, outage definitions, and recovery expectations.
status: draft
---

I built this BCDR Assessment tool because I needed a practical way to force better reliability conversations.

Most teams discuss resilience in broad terms. Few teams turn those discussions into explicit targets, assumptions, and tradeoffs.

This tool is my attempt to change that.

If you are using it, this post explains exactly what it is and what it is not.

## What the tool is

The tool is a decision aid.

It helps you:

- Model dependency-level availability across Azure, AWS, GCP, and OCI.
- Estimate downtime budgets from selected service assumptions.
- Check whether a proposed customer commitment is supportable by the selected dependency model.
- Surface BCDR and reliability gaps that need architecture or operational action.

In short, it gives structure to reliability design discussions.

## What the tool is not

The tool is not a legal SLA generator.

The tool is not a replacement for architecture review.

The tool is not proof that your final customer commitment is correct.

If you only read one line in this post, read this one:

Provider SLA is not your product SLA.

## The common mistake

A common mistake is to take cloud provider SLA numbers and map them directly into a customer-facing commitment.

Microsoft, AWS, and other providers are clear about scope, exclusions, and service-specific conditions. Those SLAs are useful inputs. They are not your final promise.

Your workload has additional risk that provider SLA tables do not fully represent:

- Application defects
- Deployment risk
- Operational readiness
- Human response time
- Change management quality
- Dependency coupling and correlated failures

This gap is exactly why a modeled dependency estimate is useful, and also why it is not enough by itself.

## SLA, SLO, and commitment in plain terms

Use this framing:

- **Customer SLA:** The contractual promise your company makes.
- **Internal SLO:** The internal target you operate to.
- **Dependency estimate:** A model of what your selected architecture components suggest under stated assumptions.

A healthy pattern is straightforward:

1. Build dependency estimate from selected architecture.
2. Define internal SLO that reflects operational reality and risk appetite.
3. Set customer SLA with sufficient margin, legal review, and policy alignment.

When these are collapsed into one number, teams usually overpromise.

## Questions every team must answer

Before publishing any customer commitment, answer these questions explicitly:

1. Do we count planned maintenance as downtime for the customer promise?
2. Which exclusions apply, and how are they communicated?
3. Who defines outage severity and service unavailability in incident practice?
4. What is the measurement window and evidence source?
5. What recovery behavior do we guarantee versus best effort?

If these answers are not written down, the commitment is weak regardless of how clean the math looks.

## How to use the tool correctly

Use the tool as a forcing function.

- Model only critical-path dependencies.
- Treat the dependency output as an estimate, not a commitment.
- Use the estimate to test options and reveal weak links.
- Translate output into architecture work, operational work, and policy decisions.
- Validate assumptions with drills, not only spreadsheets.

The objective is not to produce a pretty number. The objective is to make better reliability decisions before incidents force them.

## Final point

A BCDR tool should reduce blind spots, not hide them.

This one is built to start the right conversation. It is still your job to define what your company promises, what your teams can sustain, and what your customers should expect.

If this helps your team move from vague resilience talk to explicit decisions, then it is doing its job.

I work at Microsoft. The views expressed here are my own and based solely on publicly available information. This content is for educational purposes and does not represent official Microsoft guidance or commitments.
