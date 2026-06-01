# Audience Signals: BCDR for Azure Storage

## Audience Problem
Enterprises building disaster recovery strategies for Azure Storage face unclear RPO/RTO trade-offs. Teams are unclear on when to use geo-redundancy (GRS) vs read-access geo-redundancy (RA-GRS) vs manual failover (CFR). This leads to:
- Recovery times worse than committed SLAs
- Unnecessary storage costs from over-replication
- Data loss during failures exceeding expected RPO

## Key Signals
- Azure Storage GRS failover incidents (Azure blog, GitHub issues)
- Growing adoption of Application Gateway for multi-region failover
- Third-party BCDR tools gaining traction for Storage gaps

## Audience Alignment
- Infrastructure architects designing multi-region storage
- Platform teams building BCDR templates
- FinOps teams optimizing replication costs
