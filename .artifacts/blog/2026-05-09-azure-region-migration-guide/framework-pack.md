# Framework Pack: Region Migration

## Phase Timeline
- Week 1-2: Assessment + planning
- Week 3-4: Infrastructure setup in target region
- Week 5-6: Data replication + validation
- Week 7: Parallel run + cutover
- Week 8+: Cleanup and decommission

## Service-Specific Replication
| Service | Method | Duration |
|---------|--------|----------|
| Storage | GRS/geo-replication | 15min (built-in) |
| Database | Farm replication | Hours (per size) |
| AKS | Config + PV export | Hours (depends on data) |

## Checklist This Week
1. Audit all services in current region
2. Check region support in target
3. Estimate replication time per service
4. Plan parallel run window
