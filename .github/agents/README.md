# zachsBlog Agents

This folder contains the multi-agent blogging system used by the blog pipeline.

## Agents

- `blog-orchestrator` - Coordinates the full workflow and quality gates
- `microsoft-signals-scout` - Tracks latest Microsoft Blog + Microsoft Learn signals with compliance-safe summaries
- `watchlist-signals-scout` - Scans curated watchlist blogs for similar topics, external takes, and staleness risk
- `audience-problem-miner` - Mines recurring audience pains and demand signals
- `topic-strategist` - Defines angle, thesis, and headlines
- `research-analyst` - Produces evidence pack and source map
- `outline-architect` - Builds section structure and flow
- `draft-writer` - Creates first full draft
- `contrarian-reviewer` - Pressure-tests thesis and assumptions
- `framework-distiller` - Produces reusable decision frameworks and checklists
- `fact-risk-reviewer` - Blocks unsafe or weak content
- `voice-editor` - Aligns tone and readability
- `seo-distribution-editor` - Metadata, SEO, and LinkedIn variants
- `design-ux-director` - Visual direction, UX polish, and Astro theme inspiration
- `image-director` - Visual concepts and alt text
- `freshness-maintainer` - Audits published posts for staleness and broken links
- `publisher-agent` - Final publish packaging after approval

## Workflow Summary

1. Idea or issue intake
2. Microsoft + watchlist signal scans plus audience/problem mining, angle, and research
3. Outline and draft
4. Fact/risk, contrarian, and framework review (must pass)
5. Voice + SEO + design/UX + image refinement
6. Human approval gate
7. Publish packaging and deployment

## Repository Execution Model

- Run publish orchestration and LinkedIn workflows from `FallenHoot/olinske-editorial`.
- Use `FallenHoot/olinske` as the public mirror/deploy repo.
- Cross-repo promotion is intentional and uses `PUBLIC_REPO_PAT` from editorial secrets.
- LinkedIn secrets (`LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_URN`) are maintained in editorial repo secrets.
- Default working context is always private editorial (`FallenHoot/olinske-editorial`).
- Drafts, queued posts, research, internal docs, agent artifacts, workflows, and infra files must stay in editorial only.
- Public repo must contain only public-safe website assets and published content.
- Do not push directly to public from local day-to-day work; use the editorial promotion/export flow.
## Artifact Contract

For each post slug, the publish workflow expects required artifacts in `.artifacts/blog/<slug>/`.

See `docs/agent-artifact-contract.md` for required files and validation details.

## Non-negotiable Rules

- No fabricated claims or references
- No confidential customer/internal details
- Human approval is mandatory before publish
