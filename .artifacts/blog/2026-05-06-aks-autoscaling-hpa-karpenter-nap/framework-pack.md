# Framework Pack: AKS Autoscaling

## Decision Matrix: HPA vs Karpenter vs NAP
| Factor | HPA+VMSS | Karpenter | NAP (Azure) |
|--------|---------|-----------|-------------|
| Setup complexity | Low | Medium | Low |
| Cost efficiency | Baseline | -15% | -12% |
| Node utilization | 60-70% | 75-85% | 75-85% |
| Cloud dependency | None | High | Azure-specific |

## Migration Path
1. Current: HPA + VMSS autoscaling
2. Step 1: Enable NAP on existing AKS cluster
3. Step 2: Monitor cost savings (usually 10-15% reduction)
4. Step 3: Consider Karpenter if more features needed

## Checklist This Week
1. Audit current node utilization (run kubectl top nodes)
2. Calculate VMSS autoscaling costs
3. Enable NAP on pilot cluster
4. Compare node utilization after 1 week
