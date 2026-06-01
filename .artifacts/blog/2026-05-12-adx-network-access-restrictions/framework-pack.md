# Framework Pack: ADX Network Security

## Hybrid Approach
- Queries: Private endpoint (VNet isolation)
- Ingestion: Public endpoint (service bus, external connectors)
- Connections from VNet → private endpoint for queries
- External data sources → public endpoint for ingestion

## Configuration Checklist
1. [ ] Enable private endpoint for queries
2. [ ] Allow ingestors to use public endpoint
3. [ ] Test query access from VNet
4. [ ] Test ingestion from external sources
5. [ ] Document network topology
