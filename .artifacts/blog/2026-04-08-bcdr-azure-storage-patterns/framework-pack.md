# Framework Pack: BCDR for Azure Storage

## Redundancy Decision Matrix

| Need | Solution | Cost | RPO | RTO |
|------|----------|------|-----|-----|
| Single region | LRS | Low | N/A | N/A |
| Multi-region read | RA-GRS | Medium | 15min | 1-24h |
| Multi-region RTO <1h | Manual CFR | High | 0 | 30min |
| Multi-region auto-failover | GZRS + app logic | Very High | 60s | <60s |

## Failover Automation Pattern
1. Monitor secondary region health
2. On primary failure detected, point DNS/traffic to secondary
3. Promote secondary to primary (data sync lag acceptable)
4. Failback strategy for restored primary

## Action Items This Week
1. Audit current redundancy: What's deployed today?
2. Map RPO/RTO requirements by workload
3. Cost estimate for one tier up (GRS → GZRS)
4. Document manual failover runbook
