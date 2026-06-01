# Framework Pack: BCDR for PostgreSQL

## BCDR Decision Matrix
| Need | Solution | Cost | RPO | RTO |
|------|----------|------|-----|-----|
| Corruption recovery | Built-in backups | Low | 1h | Manual restore time |
| Read scaling | Read replicas | Medium | Real-time | N/A (read-only) |
| Region failure | Geo-replication | High | Seconds | 1-5 min failover |

## Checklist This Week
1. Enable automated backups (35-day retention)
2. Test restore procedure (know your RTO)
3. Enable SSL/TLS for all connections
4. Document encryption strategy (TDE)
