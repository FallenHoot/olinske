# Visitor Analytics Workbook Setup

## Overview

A custom **Visitor Analytics Dashboard** has been created in Application Insights to provide real-time insights into your blog traffic and user engagement.

The workbook is deployed as part of the Bicep infrastructure when you run `azd deploy` or `az deployment group create`.

## Dashboard Contents

The workbook includes 10 pre-built visualizations:

| Visualization | Purpose |
|---|---|
| **Unique Visitors (7d)** | Count of distinct users in last 7 days |
| **Total Page Views (7d)** | Sum of all page views in last 7 days |
| **Sessions (7d)** | Number of user sessions |
| **Avg Session Duration** | Average time spent per session (seconds) |
| **Top Pages** | Most visited pages ranked by views |
| **Traffic by Browser** | Pie chart of visitor browsers (Chrome, Safari, Edge, etc.) |
| **Traffic by Region** | Geographical distribution of visitors |
| **Daily Page Views Trend** | Line chart of page views over time |
| **Daily Unique Users Trend** | Column chart of unique users per day |
| **API Performance** | Endpoint latency and failure rates |

## Accessing the Dashboard

### Option 1: Azure Portal (Recommended)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your **Application Insights** resource: `appi-olenske-prod`
3. In the left sidebar, select **Workbooks**
4. Find **Visitor Analytics Dashboard** in the list
5. Click to open and interact

### Option 2: Direct Portal Link

```
https://portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/e0c2992e-e755-4da6-bf52-3514fdce93cf/resourceGroups/rg-techblog/providers/microsoft.insights/workbooks/visitor-analytics-dashboard
```

## Key Metrics Explained

### Unique Visitors
- Tracks distinct users by session ID
- Resets after 30 minutes of inactivity
- Does not identify individual users (privacy-first)

### Page Views vs Sessions
- **Page Views**: Total number of times any page was viewed
- **Sessions**: Number of distinct browsing sessions (one user may have multiple sessions)

### Avg Session Duration
- Measured in seconds
- Includes time spent on all pages within a session
- Updates every few minutes

### API Performance
- Shows latency (ms) for server endpoints like `/api/vote`
- Includes failure rate percentage
- Helps identify performance bottlenecks

## Customizing the Dashboard

The workbook is built with KQL (Kusto Query Language) queries that can be edited:

1. Open the workbook
2. Click **Edit** button (pencil icon)
3. Click on any visualization to modify its KQL query
4. Save changes

### Example: Change Time Range

All queries use `| where timestamp > ago(7d)` to filter last 7 days.
To change to 30 days, replace with `| where timestamp > ago(30d)`.

## Sample KQL Queries

Below are standalone queries you can run in **Application Insights → Logs**:

### Top 10 most visited posts
```kql
pageViews
| where timestamp > ago(30d)
| summarize Views = count() by name
| order by Views desc
| limit 10
```

### Bounce rate (sessions with only one page view)
```kql
pageViews
| where timestamp > ago(7d)
| summarize PageCount = count() by session_Id
| where PageCount == 1
| count
```

### Visitors by device type
```kql
pageViews
| where timestamp > ago(7d)
| summarize Views = count() by client_Type
```

### Average time on page (requires custom events)
```kql
pageViews
| where timestamp > ago(7d)
| summarize AvgDuration = avg(duration) by name
| order by AvgDuration desc
```

## Retention & Billing

- **Retention**: 365 days (set in Bicep parameters)
- **Billing**: Billed per GB of data ingested (included in your Application Insights plan)
- **Workbooks**: No additional cost for workbooks themselves

## Troubleshooting

### No data in dashboard?
- ✅ Ensure your Web App is deployed and receiving traffic
- ✅ Allow 5-10 minutes for telemetry to appear in Application Insights
- ✅ Check Application Insights is enabled in your App Service app settings

### Dashboard appears empty or slow?
- Application Insights may need time to ingest and process telemetry
- Run `npm run build && npm run start` locally to generate test traffic
- Workbooks refresh data every 2-5 minutes by default

### Need real-time metrics?
Use **Application Insights → Live Metrics Stream** for real-time dashboard (separate from workbooks).

## Next Steps

1. Deploy infrastructure: `azd deploy`
2. Access workbook in Azure Portal after 5-10 minutes
3. Monitor visitor patterns and top content
4. Use insights to guide future blog posts and technical decisions

## File References

- **Workbook JSON**: `infra/visitor-analytics-workbook.json`
- **Workbook Bicep**: `infra/workbook.bicep`
- **Main Infrastructure**: `infra/main.bicep` (includes workbook module)
