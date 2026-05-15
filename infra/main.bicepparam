// =============================================================================
// main.bicepparam — production parameter values for infra/main.bicep
// Target subscription: Online (e0c2992e-e755-4da6-bf52-3514fdce93cf)
// Target resource group: rg-techblog
//
// Deploy command:
//   az deployment group create \
//     --subscription e0c2992e-e755-4da6-bf52-3514fdce93cf \
//     --resource-group rg-techblog \
//     --template-file infra/main.bicep \
//     --parameters infra/main.bicepparam \
//     --what-if        # dry-run first
// =============================================================================

using './main.bicep'

param location              = 'norwayeast'
param appServicePlanName    = 'pgmsvlpkvyw4khostingplan'
param webAppName            = 'pgmsvlpkvyw4kwebsite'
param appInsightsName       = 'appi-olinske-prod'
param logAnalyticsWorkspaceName = 'law-olinske-prod'
param storageAccountName    = 'stoliniskevotes'
param siteUrl               = 'https://zach.olinske.com'
