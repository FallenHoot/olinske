---
title: "When AI Cannot Read the Source: The Hidden Failure in AI Scraping"
description: "A model can fail to access a primary source, silently switch to secondary context, and still answer with high confidence. This is a provenance failure, not just a quality issue."
tags: [ai-strategy, llm, retrieval, data-provenance, prompt-engineering]
status: idea
source: "Author field observation using https://ai-watch.ec.europa.eu/countries_en as a blocked-source example"
---

## Angle
Most AI failure conversations focus on hallucination. This post focuses on a more dangerous pattern: source substitution under confidence. When a model cannot access the requested page, it may pivot to adjacent sources and still produce fluent output that appears authoritative.

## Why this fills a gap
Many teams assume a model used the URL they provided. In practice, dynamic rendering, anti-bot controls, robots restrictions, or session requirements can block access. The answer quality can still look strong, which hides evidence quality risk.

## Proposed structure

1. Incident narrative: the blocked scrape on an EU policy page
2. What actually failed: access path, not language generation
3. Failure chain: no primary source, fallback retrieval, confident synthesis
4. Why this is high risk for leaders: false certainty in decision workflows
5. Operational controls: source-access checks, citation requirements, abstain policy
6. Practical prompt and system patterns to reduce source substitution risk
7. A lightweight governance checklist for teams using AI research workflows

## Working terms to define clearly
- Primary source access
- Retrieval failure
- Source substitution
- Provenance chain
- Confidence masking

## Strong thesis line
If the model did not read the source, the model should not be trusted to summarize the source.

## Evidence notes
- Keep the EU example as a concrete opener.
- Add one or two additional reproducible cases before final draft.
- Mark uncertain technical causes as Needs verification until validated.

## CTA
Audit one high-impact AI workflow this week. Require the model to prove source access and timestamped citations, or force abstain behavior when primary access fails.
