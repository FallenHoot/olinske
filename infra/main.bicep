// =============================================================================
// Zach Olinske Blog — Infrastructure as Code
// Reverse-engineered from live resources in rg-techblog (Norway East)
// Subscription: Online (e0c2992e-e755-4da6-bf52-3514fdce93cf)
//
// Resources captured:
//   - Log Analytics Workspace (law-olinske-prod)
//   - Application Insights    (appi-olinske-prod)
//   - App Service Plan        (pgmsvlpkvyw4khostingplan)  S1 Standard, Windows
//   - Web App                 (pgmsvlpkvyw4kwebsite)
//   - Storage Account [NEW]   (stoliniskevotes)  — for thumbs vote persistence
//
// AVM modules: https://azure.github.io/Azure-Verified-Modules/
// Pin versions before each deployment: az bicep registry list
// =============================================================================

targetScope = 'resourceGroup'

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

@description('Azure region for all resources. Matches existing deployment.')
param location string = 'norwayeast'

@description('App Service Plan resource name.')
param appServicePlanName string = 'pgmsvlpkvyw4khostingplan'

@description('Web App resource name.')
param webAppName string = 'pgmsvlpkvyw4kwebsite'

@description('Application Insights resource name.')
param appInsightsName string = 'appi-olinske-prod'

@description('Log Analytics Workspace resource name.')
param logAnalyticsWorkspaceName string = 'law-olinske-prod'

@description('Storage Account name for vote Table Storage. Must be 3-24 lowercase alphanumeric.')
@minLength(3)
@maxLength(24)
param storageAccountName string = 'stoliniskevotes'

@description('SITE_URL injected into the Astro build for og: and canonical URLs.')
param siteUrl string = 'https://zach.olinske.com'

// ---------------------------------------------------------------------------
// Log Analytics Workspace
// Existing resource — captured from live.
// ---------------------------------------------------------------------------

module logAnalytics 'br/public:avm/res/operational-insights/workspace:0.11.0' = {
  name: 'logAnalyticsDeployment'
  params: {
    name: logAnalyticsWorkspaceName
    location: location
    skuName: 'PerGB2018'
    dataRetention: 90
    // Telemetry opt-in (AVM default). Set to false to disable.
    enableTelemetry: true
  }
}

// ---------------------------------------------------------------------------
// Application Insights
// Existing resource — workspace-based, 365-day retention.
// ---------------------------------------------------------------------------

module appInsights 'br/public:avm/res/insights/component:0.4.2' = {
  name: 'appInsightsDeployment'
  params: {
    name: appInsightsName
    location: location
    workspaceResourceId: logAnalytics.outputs.resourceId
    kind: 'web'
    applicationType: 'web'
    retentionInDays: 365
    enableTelemetry: true
  }
}

// ---------------------------------------------------------------------------
// App Service Plan
// Existing resource — S1 Standard, Windows (not Linux/reserved).
// Downgrade to F1 for dev; upgrade to P1v3 for production scale.
// ---------------------------------------------------------------------------

module appServicePlan 'br/public:avm/res/web/serverfarm:0.4.1' = {
  name: 'appServicePlanDeployment'
  params: {
    name: appServicePlanName
    location: location
    skuName: 'S1'
    skuCapacity: 1
    reserved: false     // false = Windows; set true for Linux
    enableTelemetry: true
  }
}

// ---------------------------------------------------------------------------
// Storage Account — NEW (does not exist in live yet)
// Used by the vote API (POST /api/vote) for thumbs up/down persistence.
// Table: "votes"  |  PartitionKey: slug  |  RowKey: "totals"
// ---------------------------------------------------------------------------

module storageAccount 'br/public:avm/res/storage/storage-account:0.19.0' = {
  name: 'storageAccountDeployment'
  params: {
    name: storageAccountName
    location: location
    skuName: 'Standard_LRS'
    kind: 'StorageV2'
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    // Enable Table Storage and pre-create the votes table
    tableServices: {
      tables: [
        { name: 'votes' }
      ]
    }
    // Grant the web app's system-assigned identity access via RBAC
    // Role: Storage Table Data Contributor (0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3)
    roleAssignments: [
      {
        principalId: webApp.outputs.?systemAssignedMIPrincipalId ?? ''
        roleDefinitionIdOrName: 'Storage Table Data Contributor'
        principalType: 'ServicePrincipal'
      }
    ]
    enableTelemetry: true
  }
}

// ---------------------------------------------------------------------------
// Web App
// Existing resource — Windows, Node 20 LTS, HTTPS-only, TLS 1.2, HTTP/2.
// System-assigned managed identity added for keyless storage access.
// ---------------------------------------------------------------------------

module webApp 'br/public:avm/res/web/site:0.15.1' = {
  name: 'webAppDeployment'
  params: {
    name: webAppName
    location: location
    kind: 'app'
    serverFarmResourceId: appServicePlan.outputs.resourceId
    httpsOnly: true
    // System-assigned identity — used for Storage Table Data Contributor RBAC
    managedIdentities: {
      systemAssigned: true
    }
    siteConfig: {
      minTlsVersion: '1.2'
      http20Enabled: true
      ftpsState: 'Disabled'
      alwaysOn: false           // S1 supports alwaysOn; enable if cold-start is an issue
      nodeVersion: '~20'
      // clientAffinityEnabled matches live (true); set false if stateless
    }
    appSettingsKeyValuePairs: {
      // Observability
      APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.outputs.connectionString
      ApplicationInsightsAgent_EXTENSION_VERSION: '~3'

      // Runtime
      WEBSITE_NODE_DEFAULT_VERSION: '20-lts'
      NODE_ENV: 'production'
      WEBSITE_WEBDEPLOY_USE_SCM: 'true'

      // Astro canonical/OG URL
      SITE_URL: siteUrl

      // Vote storage — uses managed identity via DefaultAzureCredential.
      // No connection string needed; only the account name is required.
      AZURE_STORAGE_ACCOUNT_NAME: storageAccountName
    }
    enableTelemetry: true
  }
}

// ---------------------------------------------------------------------------
// Application Insights Workbook — Visitor Analytics Dashboard
// ---------------------------------------------------------------------------

module workbook 'workbook.bicep' = {
  name: 'visitor-analytics-workbook'
  params: {
    location: location
    appInsightsResourceId: appInsights.outputs.resourceId
    workbookName: 'visitor-analytics-dashboard'
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

@description('Web App default hostname.')
output webAppHostname string = webApp.outputs.defaultHostname

@description('Application Insights instrumentation key (for local dev .env).')
output appInsightsInstrumentationKey string = appInsights.outputs.instrumentationKey

@description('Application Insights connection string.')
output appInsightsConnectionString string = appInsights.outputs.connectionString

@description('Storage Account name — set as AZURE_STORAGE_ACCOUNT_NAME app setting.')
output storageAccountName string = storageAccount.outputs.name

@description('Web App system-assigned identity principal ID — used in role assignments.')
output webAppPrincipalId string = webApp.outputs.?systemAssignedMIPrincipalId ?? ''
@description('Visitor Analytics Workbook resource ID.')
output workbookId string = workbook.outputs.workbookId
