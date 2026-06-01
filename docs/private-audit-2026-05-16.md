# Private vs Public Audit (2026-05-16)

## Scope
- Compared `private/main` against `origin/main`.
- Enforced rule: do not remove or modify anything under `content/**`.
- Goal: keep feature parity with public while preserving private-only security/editorial context.

## Summary
- Public-only commits ahead of private: `0`.
- Private-only commits ahead of public: `18`.
- Feature parity status: `paired`.
- Content safety status: `preserved` (no content removals in merge cleanup).

## Removed (Second Cleanup Pass)
- None in this pass.

## Removed Earlier in This Session
- `public-target` placeholder (obsolete submodule entry).

## Kept (Intentional Private-Only)
- `.artifacts/**`: editorial/review evidence and agent artifacts.
- `.github/agents/**`: private governance and agent behavior controls.
- `docs/**` private policy and editorial operations docs.
- `infra/**` private ops/infrastructure sources and workbook artifacts.
- `data/publish-queue.json` and related editorial workflow data.
- `scripts/git-sync-main.mjs`, `README.md`, `package.json` private-first workflow controls.

## Decision Rationale
- Files retained are either security-governance controls, editorial operations state, or internal artifacts.
- These files are not required in public repository output and are intentionally isolated.
- No additional files met the threshold of "outdated and no private value" with high confidence.

## Next Optional Cleanup (Requires Your Approval)
- Archive and remove old `.artifacts/blog/**` folders older than a selected cutoff date.
- Keep only latest artifact pack per post slug.
- Move deep historical policy snapshots under a dated `docs/archive/` path.
