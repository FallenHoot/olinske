# Olinske

Public production repository for olinske.com.

This repository is promoted from a private editorial repository after human approval and publish-gate validation.

## Deploy model

1. Promotion from private editorial repo updates this repository.
2. CI validates Astro build health.
3. Azure Web App workflow deploys production.

## Publishing automation

Publishing schedule is controlled by GitHub Actions.

- Workflow: .github/workflows/promote-and-linkedin.yml
- Trigger: every Thursday at 10:00 Europe/Oslo (CET/CEST, DST-aware)
- Manual trigger: workflow_dispatch with optional slug input

Local scripts are for local validation and debugging only. They do not replace GitHub Actions scheduling.

## Required secrets

- AZURE_WEBAPP_NAME: Azure Web App name
- AZURE_CLIENT_ID: Azure AD application (service principal) client ID with federated credential
- AZURE_TENANT_ID: Azure tenant ID
- AZURE_SUBSCRIPTION_ID: Azure subscription ID

## Export metadata

Latest export details are in EXPORT-METADATA.json.

## Full-text search (Pagefind)

Keyword search is powered by Pagefind static indexing.

1. Build first to generate or refresh the search index:
	- npm run build
2. Start development server after build:
	- npm run dev -- --host

Notes:

- Pagefind indexes compiled files in dist/pagefind.
- If you add new content and search does not find it yet, run npm run build again.
- Global keyword search routes to /search/ and supports query-string priming with ?q=.

## Git safety

This repository enforces a local pre-push check to prevent accidental local-only changes.

1. Install dependencies once (or run `npm run hooks:install`) to activate hooks.
2. Use `npm run git:sync -- "your commit message"` to stage all changes, commit, and push to `private/main` by default.
3. Public updates are intentional and happen through export and publish flow, not day-to-day direct push.
4. If there are no changes, the sync command exits safely.

## Security isolation model

1. Feature parity: code and product behavior are developed in private first.
2. Isolation: drafts, internal notes, research, and operational artifacts stay private.
3. Public promotion: only approved, sanitized, published content is exported to public.
4. Enforcement:
	- pre-push hook blocks direct public pushes unless explicitly overridden.
	- `git:sync` defaults to the private remote.
	- publish scripts perform explicit editorial-to-public promotion.
