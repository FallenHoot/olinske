# Multi-Agent Solutions - Artifacts

## audience-signals.md
- Enterprise teams deploying orchestrated agentic workflows
- Platform leads designing coordination layers for multiple agents
- DevOps teams managing multi-agent state and failures

## research-evidence.json
```json
{
  "sources": [
    "https://learn.microsoft.com/ - Agent Framework and orchestration patterns",
    "https://devblogs.microsoft.com/ - Multi-agent system design posts",
    "https://azure.microsoft.com/blog/ - Enterprise agent coordination announcements"
  ],
  "claims": [
    {
      "claim": "Multi-agent coordination requires explicit state management, not just composition patterns.",
      "confidence": "High",
      "sources": ["Learn documentation on agent frameworks"]
    },
    {
      "claim": "Failure modes in multi-agent systems cascade without defined boundaries.",
      "confidence": "High",
      "sources": ["General distributed systems practice"]
    }
  ]
}
```

## outline.md
- Why single agents scale, multi-agents do not without coordination
- Layer model: charter, state, coordination, boundaries, observability, testing
- Two-agent example implementation
- Team-scoped testing approach

## draft.md
- [Complete in main draft file]

## fact-risk-report.json
- Low risk; no confidential implementation details shared
- Framework is generic and practice-based

## contrarian-review.md
- Counter: "Multi-agent complexity is not worth the benefit"
- Response: Single agent becomes monolith; multi-agent design enables specialization

## framework-pack.md
- Layered coordination model
- State store decision tree
- Failure mode checklist
- Weekly testing cadence
