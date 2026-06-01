# Framework Pack: BCDR for AKS

## Disaster Scenarios & Recovery Times

| Scenario | Impact | Recovery Time |
|----------|--------|----------------|
| Single node fails | Pod eviction, reschedule | <1 min (automatic) |
| Full cluster fails | All workloads down | <10 min (GitOps redeploy) |
| Region fails | All workloads + data | 1-24h (data dependent) |

## GitOps Disaster Recovery Pattern
- Cluster config stored in Git
- Helm templates + Kustomize for env-specific values
- ArgoCD pulls config, redeploys to new cluster

## Checklist This Week
1. Ensure all cluster config is in Git (no manual configs)
2. Test cluster redeployment from Git (simulate disaster)
3. Audit which workloads have persistent data
4. Map data replication strategy per workload
