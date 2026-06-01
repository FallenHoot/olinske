# Framework Pack: SRE Agent FinOps

## Agent Workflow for Cost Anomaly
1. Cost alert triggered (threshold exceeded)
2. Agent queries Azure Cost Management for anomaly details
3. Agent correlates with last 24h deployments/changes
4. Agent creates incident summary with findings
5. Human SRE reviews and acts

## Checklist This Week
1. Set up cost anomaly alerts in Azure Cost Management
2. Define threshold for agent investigation (e.g., >15% daily increase)
3. Build simple investigation agent (Python + Azure SDK)
4. Test on historical anomalies
