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
- Trigger: scheduled daily at 11:00 Europe/Oslo (DST-safe dual UTC cron entries)
- Manual trigger: workflow_dispatch with optional slug input

Local scripts are for local validation and debugging only. They do not replace GitHub Actions scheduling.

## Required secrets

- AZURE_WEBAPP_NAME: Azure Web App name
- AZURE_CLIENT_ID: Azure AD application (service principal) client ID with federated credential
- AZURE_TENANT_ID: Azure tenant ID
- AZURE_SUBSCRIPTION_ID: Azure subscription ID

## Export metadata

Latest export details are in EXPORT-METADATA.json.

## Git safety

This repository enforces a local pre-push check to prevent accidental local-only changes.

1. Install dependencies once (or run `npm run hooks:install`) to activate hooks.
2. Use `npm run git:sync -- "your commit message"` to stage all changes, commit, and push to `origin/main`.
3. If there are no changes, the sync command exits safely.
