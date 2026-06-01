# Contrarian Review: BCDR for AKS

## Counter-Arguments

**"Multi-region AKS is overkill for most teams"**
- Valid—start with single-region with multi-AZ nodes
- Multi-region only needed for region-failure scenarios

**"GitOps doesn't solve data recovery"**
- Correct—databases/volumes need separate BCDR
- Cluster config recovery is only half the problem
