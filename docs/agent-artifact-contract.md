# Agent Artifact Contract

Purpose: enforce consistent, reviewable artifacts before publish.

## Artifact path

For post slug `<slug>`, create artifacts in:

`.artifacts/blog/<slug>/`

## Required files for publish gate

- `audience-signals.md`
- `research-evidence.json`
- `outline.md`
- `draft.md`
- `fact-risk-report.json`
- `contrarian-review.md`
- `framework-pack.md`

## Notes

- Files must exist and contain non-empty content.
- Publish gate fails if required artifacts are missing.
- Keep sensitive internal/customer details out of artifacts.
