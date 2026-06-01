param location string
param appInsightsResourceId string
param workbookName string = 'visitor-analytics-dashboard'

@description('Tags required by policy, including CostCenter=14.')
param workbookTags object = {
  CostCenter: '14'
  project: 'olinski-blog'
  environment: 'prod'
  'hidden-title': 'Visitor Analytics Dashboard'
}

var workbookResourceName = guid(resourceGroup().id, workbookName)

// Create a shared workbook for visitor analytics
resource workbook 'Microsoft.Insights/workbooks@2023-06-01' = {
  name: workbookResourceName
  location: location
  kind: 'shared'
  tags: workbookTags
  properties: {
    displayName: 'Visitor Analytics Dashboard'
    version: 'Notebook/1.0'
    serializedData: loadTextContent('./visitor-analytics-workbook.json')
    sourceId: appInsightsResourceId
    category: 'workbook'
  }
}

output workbookId string = workbook.id
output workbookName string = workbook.name
