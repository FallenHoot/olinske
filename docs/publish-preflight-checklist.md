# Publish Preflight Checklist

Use this checklist before running the promotion workflow from private repo to public repo.

## 1) Post readiness

- [ ] Post frontmatter status is `published`
- [ ] publishDate is correct
- [ ] Draft has passed human review
- [ ] Confidentiality review completed
- [ ] Voice editor review completed (AI filler removed, cadence reads human)
- [ ] Repetition gate passed (no unresolved repetitive opener warnings)
- [ ] First tag is exactly one primary category (cloud-architecture, legacy-systems, geospatial, engineering-culture, family-legacy, ai-strategy); enforce with `STRICT_CATEGORY_GATE=1`
- [ ] `coreQuestion` frontmatter is present and specific (recommended; required when `STRICT_QUESTION_GATE=1`)
- [ ] `bluf` frontmatter bullets are present and concise (recommended for AI/search readability)
- [ ] Published output does not contain a `## References` section
- [ ] Required agent artifacts exist and are non-empty

## 2) Private repo secrets

- [ ] `PUBLIC_REPO_PAT` has push access to public repo
- [ ] `PUBLIC_REPO` set to owner/repo (optional, defaults to FallenHoot/olinske)

## 3) Public repo secrets

- [ ] `AZURE_WEBAPP_NAME` set
- [ ] `AZURE_CLIENT_ID` set
- [ ] `AZURE_TENANT_ID` set
- [ ] `AZURE_SUBSCRIPTION_ID` set

## 4) Workflow run inputs

- [ ] postPath points to the exact published markdown file under content/posts
- [ ] approvalConfirmation is set to APPROVED

## 5) Post-promotion verification

- [ ] Public repo received new commit
- [ ] Public CI passed
- [ ] Azure deploy workflow passed
- [ ] Site page is live at canonical URL
- [ ] OG preview and metadata look correct

## 6) Rollback readiness

- [ ] Prior public commit hash noted
- [ ] Quick rollback plan defined (revert in public repo)
