# Repository Split Strategy

## Goal

Keep editorial operations private while publishing only approved, public-safe content.

## Recommended topology

1. Private repo (this repo): editorial operations
- drafts
- research notes
- agent artifacts
- prompts and orchestration specs
- internal scripts and policies

2. Public repo: production website only
- published posts
- public assets
- deployment workflow

## Promotion flow

1. Run publish gate with human approval.
2. Export public-safe files from private repo.
3. Push export output to public repo.
4. Deploy public repo.

## Safety controls

- Private repo remains private.
- Export includes only published posts.
- Agent artifacts and internal docs are excluded by default.
- Promotion is manual by default.

## Required secrets for GitHub Actions promotion

- `PUBLIC_REPO`: target repo in owner/name format (optional if using default below)
- `PUBLIC_REPO_PAT`: personal access token with push rights to target repo

Default target repository configured in workflow:

- `FallenHoot/olinske`

## Required secrets in the public repo

- `AZURE_WEBAPP_NAME`: Azure Web App name
- `AZURE_CLIENT_ID`: Azure AD application client ID for GitHub OIDC federation
- `AZURE_TENANT_ID`: Azure tenant ID
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID

## OIDC setup notes (no long-lived secrets)

Use GitHub OpenID Connect federation for Azure login in the public deployment workflow.

1. Create or reuse an Azure AD application.
2. Add a federated credential for your public repo and branch/environment.
3. Grant least-privilege role assignment scoped to the blog resource group.
4. Store only `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` in GitHub secrets.

## Public repo bootstrap

`npm run export:public` now includes baseline public-repo files automatically:

- `README.md`
- `.gitignore`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-azure-webapp.yml`

## Local dry run

`npm run export:public`

Single-post export:

`npm run export:public -- --post content/posts/<slug>.md`
