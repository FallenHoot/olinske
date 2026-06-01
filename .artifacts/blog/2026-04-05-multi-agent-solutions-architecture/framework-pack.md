# Framework Pack: Multi-Agent Solutions Architecture

## Decision Matrix: Orchestrated vs Decentralized

| Factor | Orchestrated | Decentralized |
|--------|-------------|---------------|
| Agent Count | <50 agents | >50 agents |
| Compliance | High requirements | Low requirements |
| Team Maturity | New to agents | Experienced with agents |
| Latency Tolerance | Strict SLA | Flexible timing |
| Cost Model | Predictable (central controller) | Variable (distributed) |

## Hub-and-Spoke Routing Pattern
```
Client → API Gateway → Orchestrator Agent → Task Agents
                                         → Search Agent
                                         → Integration Agent
```

## Mesh Routing Pattern
```
Client → Task Agent ↔ Search Agent ↔ Integration Agent
            ↑            ↓              ↑
         [Message Queue / Service Bus]
```

## Migration Checklist
1. Start orchestrated (simpler for small teams)
2. Monitor agent call patterns (find bottlenecks)
3. At 30+ agents, evaluate decentralized model
4. Create service mesh layer for routing
5. Migrate agents incrementally

## Reference
- [Azure Foundry Agent Coordination](https://learn.microsoft.com/azure/ai-foundry)
- [LangGraph Multi-Agent Examples](https://github.com/langchain-ai/langgraph)
