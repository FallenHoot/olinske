# Framework Pack: FinOps with Azure Data Explorer

## Setup Template (30 Minutes)
1. Export from Cost Management to Storage (daily schedule)
2. Create ADX table for costs
3. Configure continuous ingestion from Storage
4. Pin dashboard to Azure Portal

## Common KQL Patterns

**Monthly spend by service:**
```kusto
CostData
| summarize TotalCost = sum(Amount) by ServiceName, bin(Date, 1d)
| order by Date desc
```

**Cost anomaly detection:**
```kusto
CostData
| make-series Cost=sum(Amount) on Date step 1d by ServiceName
| extend (anomalies, score) = series_decompose_anomalies(Cost)
```

## Checklist for Week 1
- [ ] Audit current cost visibility tool
- [ ] Export one month of cost data to test
- [ ] Set up ADX cluster
- [ ] Run baseline cost analysis query
- [ ] Share dashboard with finance team
