# Framework Pack: A2A Architecture
## Sync vs Async Comparison
| Pattern | Latency | Resilience | Complexity |
|---------|---------|-----------|-----------|
| Direct HTTP | <100ms | Low | Low |
| Service Bus async | 100-500ms | High | Medium |
| Event Grid | Variable | Very High | High |

## Container Apps Deployment Pattern
- Agent 1: Container App instance
- Agent 2: Container App instance
- Message transport: Service Bus topic/queue
- Discovery: Built-in Container Apps DNS

## Checklist This Week
1. Deploy 2 agents to Container Apps
2. Set up Service Bus topic for A2A
3. Test message routing between agents
4. Configure retry policy (exponential backoff)
