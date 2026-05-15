# Infrastructure

AVM Bicep code for `rg-techblog` (Norway East, subscription: Online).

Reverse-engineered from the live deployment on 2026-05-14.

## Resources

| Resource | Name | SKU | Notes |
|---|---|---|---|
| Log Analytics Workspace | `law-olinske-prod` | PerGB2018, 90-day retention | Existing |
| Application Insights | `appi-olinske-prod` | Workspace-based, 365-day | Existing |
| App Service Plan | `pgmsvlpkvyw4khostingplan` | S1 Standard, Windows | Existing |
| Web App | `pgmsvlpkvyw4kwebsite` | Node 20 LTS, HTTPS-only | Existing |
| Storage Account | `stoliniskevotes` | Standard_LRS, StorageV2 | **New** — for vote persistence |

## AVM module versions

Pin versions before each deployment. Check current versions at:  
<https://azure.github.io/Azure-Verified-Modules/indexes/bicep/bicep-resource-modules/>

| Module | Pinned version in `main.bicep` |
|---|---|
| `avm/res/operational-insights/workspace` | `0.11.0` |
| `avm/res/insights/component` | `0.4.2` |
| `avm/res/web/serverfarm` | `0.4.1` |
| `avm/res/web/site` | `0.15.1` |
| `avm/res/storage/storage-account` | `0.19.0` |

## Deploy

```bash
# Dry-run first
az deployment group create \
  --subscription e0c2992e-e755-4da6-bf52-3514fdce93cf \
  --resource-group rg-techblog \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam \
  --what-if

# Apply
az deployment group create \
  --subscription e0c2992e-e755-4da6-bf52-3514fdce93cf \
  --resource-group rg-techblog \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

## Security notes

- The web app uses a **system-assigned managed identity** with `Storage Table Data Contributor` RBAC on the storage account. No connection strings or keys are stored anywhere.
- Custom domain TLS certificates (`zach.olinske.com`, `www.olinske.com`) are managed outside this Bicep. Re-bind them after any recreation of the web app resource.
- The GitHub Actions OIDC federated credential (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`) is not managed here. It lives in the Entra ID app registration.
