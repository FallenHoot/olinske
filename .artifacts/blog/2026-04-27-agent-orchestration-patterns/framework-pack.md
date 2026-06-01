# Framework Pack: Agent Orchestration Patterns

## Routing Decision Tree
1. <10 agents? → Use rule-based routing (hardcode)
2. 10-50 agents? → Semantic routing (LLM-based classification)
3. >50 agents? → Hierarchical orchestration (group agents by domain)

## Orchestrator Agent Pattern
```
Request → Orchestrator Agent (analyzes request, picks best agent)
       → Chosen Agent (executes task)
       → Response back to user
```

## Checklist This Week
1. Map your current agent count and responsibilities
2. Define routing rules (which agent for which request type?)
3. Implement logging for routing decisions
4. Monitor routing accuracy (did we pick the right agent?)
