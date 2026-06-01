import fs from 'node:fs';
import path from 'node:path';

const postsDir = path.resolve('content/linkedin/posts');

const rewrites = {
  '000006-bcdr-azure-storage-patterns.md': `A recovery exercise looked great on paper until we asked one question: "What restores first when storage is the bottleneck?"

That is where most BCDR plans crack.

Teams usually protect compute first, data second, and business flow last. Real incidents punish that order.

I broke down the storage patterns that hold under pressure, and the anti-patterns that pass review but fail recovery.

If your primary region went down right now, which storage dependency would slow your recovery first?`,

  '000007-finops-azure-data-explorer.md': `A finance lead told me, "Your dashboard says one thing, engineering says another. Who is wrong?"

Nobody was wrong. The model was incomplete.

Raw cost data without ownership, deployment context, and workload intent creates arguments instead of decisions.

This post shows how to use Azure Data Explorer to join technical and financial context so cost conversations become operational decisions.

Where does cost context break down most in your organization today?`,

  '000009-ai-foundry-container-apps-a2a.md': `A multi-agent demo looked perfect until one agent slowed down.

Then the entire chain stalled.

Synchronous handoffs look clean in demos and fail hard in production when one dependency drifts.

I mapped the Agent-to-Agent pattern with Foundry and Container Apps that keeps agents decoupled, retry-safe, and observable under load.

What is your biggest failure mode today: timeout chains, retries, or missing agent-level ownership?`,

  '000010-bcdr-for-aks-what-fails-and-what-does-not.md': `An architecture review told me, "Kubernetes handles failover. We are covered."

Stateless services might be. Stateful recovery often is not.

AKS recovery breaks in places teams do not rehearse enough: state movement, control-plane assumptions, and regional cutover sequencing.

This post isolates what survives, what collapses, and what VM-era instincts get wrong in AKS BCDR design.

Has your team tested a real AKS regional failure scenario end to end?`,

  '000011-mcp-protocol-enterprise-agents.md': `Every enterprise agent pilot sounds the same at first: "We just need tool integration."

Integration is easy until auth, error boundaries, and change control show up.

MCP is promising because it standardizes the interface layer, but protocol standardization alone does not remove enterprise operating risk.

I unpacked what MCP solves immediately, where it still needs maturity, and how to evaluate it without hype.

What would block MCP adoption first in your environment: security, governance, or reliability?`,

  '000012-spring-cleaning-cloud-finops.md': `I asked leaders one question in a FinOps workshop: "What is the most expensive thing you run that nobody would approve as a net-new purchase?"

That question changed the room.

Quick wins are easy. Structural spend is where strategy lives.

This post walks through the hard cost questions teams avoid, and why avoiding them keeps cloud spend permanently misaligned with business value.

Which cost line would your team challenge first if it had to be re-approved this quarter?`,

  '000013-azure-sre-agent-honest-assessment.md': `Most FinOps teams can see the problem and cannot execute the fix.

That gap is where waste compounds.

Cost insights without operational authority become backlog noise, not system change.

I shared how I bridged FinOps and SRE workflows so recommendations move from dashboards to safe execution.

In your environment, where do FinOps actions stall most: ownership, access, or operating bandwidth?`,

  '000014-resource-hoarding-cloud-capacity-supply-chain.md': `A CTO asked why costs stayed high after aggressive rightsizing.

The answer was not waste. It was fear.

Teams hoard capacity when they do not trust reacquisition during demand spikes.

This post reframes resource hoarding as a reliability signal tied to supply-chain constraints, not just a budgeting failure.

How does your team balance utilization targets against reacquisition risk today?`,

  '000015-sovereign-cloud-history.md': `I used to believe sovereign-only cloud models would become the default for regulated enterprise.

Reality changed my view.

Many teams still need global services, global talent, and global interoperability while meeting strict control requirements.

I traced the historical logic behind sovereign models and why separate platform strategy often breaks on economics and delivery speed.

Is your organization still evaluating sovereign-only infrastructure, or converging on control-first architecture on global platforms?`,

  '000016-sovereign-cloud-buzzword-controls.md': `I hear "sovereign cloud" in strategy meetings and ask the same follow-up every time: "Which control do you actually need?"

Most teams cannot answer clearly.

Data residency, legal jurisdiction, operator access, and auditability are different problems that require different controls.

This post explains why buying the label creates false confidence, and how to buy verifiable controls instead.

Which sovereignty control is currently non-negotiable in your architecture decisions?`,

  '000017-reliability-is-an-economic-decision.md': `Most teams treat reliability as a technical objective.

Budget decisions prove otherwise.

The Reliability Survival Guide starts from one premise: outages are often funded long before they are detected.

This kickoff post maps the full series and the operating decisions behind reliability that leadership teams can actually govern.

Who in your company owns the trade-off when reliability conflicts with cost targets?`,

  '000018-reliability-is-an-economic-decision.md': `An outage review usually starts with symptoms.

Chapter 1 starts with incentives.

Reliability outcomes are shaped by funding models, recovery assumptions, and architecture constraints long before on-call gets paged.

I break down how to connect reliability targets to explicit budget and governance choices.

Does your current availability target have real funding behind it?`,

  '000019-systems-fail-according-to-incentives.md': `Teams say reliability is shared responsibility.

Their incentive model often says something else.

When speed and short-term cost are rewarded more than survivability, failure is predictable.

This chapter explains how scorecards, ownership, and escalation design create the exact reliability behavior you see in production.

What behavior is your operating model rewarding right now when delivery pressure rises?`,

  '000020-shared-responsibility-accountability-vacuum.md': `"Shared responsibility" sounds good until an incident asks a simple question: who owns this failure?

That is where many teams freeze.

Cloud boundaries are clear in theory and blurry in operations when ownership is not explicit.

This chapter maps where provider scope ends, where customer accountability starts, and where teams assume coverage that does not exist.

Where is your biggest accountability gap today?`,

  '000021-reliability-equation-financial-model.md': `Reliability debates get easier when finance and engineering use the same language.

Most organizations still do not.

This chapter introduces a practical equation that ties service objectives to architectural design and budget commitment.

Once those variables are explicit, reliability decisions become governable instead of political.

Is your reliability target currently modeled as an economic decision, or only an engineering aspiration?`,

  '000022-provider-failures-status-pages.md': `Status pages are not just communication artifacts.

They are architecture evidence.

Provider incidents expose dependency risk, recovery assumptions, and operational blind spots that design reviews miss.

This chapter shows how to translate incident patterns into concrete architecture and resilience decisions.

How often does your design process use real provider incident evidence?`,

  '000023-partial-failure-control-plane-failures.md': `The most dangerous outages are not full outages.

They are partial failures that look healthy at a glance.

Control-plane disruption and degraded dependencies create silent customer impact while dashboards still look acceptable.

This chapter focuses on designing for degraded states, not ideal states.

When your dependencies destabilize, what fails first in your stack?`,

  '000024-hidden-cost-reliability-tooling.md': `Reliability spending usually grows faster than reliability confidence.

That mismatch is expensive.

Tooling, telemetry, and redundancy can become budget sinkholes when teams do not define meaningful SLIs and cost ceilings.

This chapter shows how to make reliability tooling spend measurable, defensible, and aligned to real customer journeys.

Which critical journey in your system still lacks a clear SLI?`,

  '000025-reliability-tradeoffs-on-call-finops.md': `Reliability trade-offs are not only technical.

They are human and economic.

On-call load, burnout risk, and cost pressure interact in ways most planning models ignore.

This chapter connects reliability architecture to operating conditions so the system can sustain both uptime and team health.

What hidden human cost is your reliability model currently ignoring?`,

  '000026-reliability-governance-adr-ledger-indicators.md': `Heroics can save incidents. They cannot scale reliability.

Governance does.

Without ADR discipline, debt visibility, and leading indicators, reliability decisions become memory instead of policy.

This chapter lays out the governance layer that keeps reliability strategy executable over time.

Which reliability decision in your environment still has no written owner?`,

  '000027-reliability-execution-quarterly-plan.md': `Strategy sounds strong in annual planning.

Execution is tested in the next quarter.

Reliability programs fail when cadence, ownership, and measurement are not operationalized into routine work.

This chapter closes with a quarterly execution rhythm teams can run repeatedly.

What is one reliability commitment your team can deliver this quarter without adding new headcount?`,

  '000028-reliability-operating-artifacts-and-policy-templates.md': `Most teams agree on reliability principles.

Execution breaks on missing artifacts.

Templates for SLOs, incident policy, debt tracking, and governance make reliability repeatable instead of personality-driven.

This appendix packages the operating artifacts that convert intent into daily behavior.

Which artifact is currently missing from your reliability operating model?`,

  '000029-reliability-pricing-saas-margin-trap.md': `A SaaS team raises prices to fund reliability and loses customers.

Was that responsible leadership or strategic self-harm?

This chapter introduces a break-even churn model that quantifies when a reliability-driven price increase helps or hurts margin.

The answer is often different from intuition.

How does your team currently test pricing moves against churn risk before funding reliability upgrades?`,

  '000030-reliability-maturity-organizational-adoption.md': `Reliability programs fail less from bad ideas and more from organizational resistance.

Adoption is the real design problem.

This chapter maps a phased maturity path that aligns reliability change with incentives, capacity, and leadership behavior.

The first move is small and measurable, not a reorganization.

What is the first customer journey your team can measure with discipline this month?`,

  '000031-the-things-that-actually-break.md': `Most reliability writing describes ideal behavior.

Production teaches something else.

This chapter captures the failure patterns teams keep underestimating: identity fragility, partial failure, human bottlenecks, and capacity as a failure domain.

The goal is practical realism, not abstract doctrine.

Which recurring failure pattern has taught your organization the hardest lesson?`,

  '000032-identity-tier-zero-spof.md': `Identity is often treated as a shared utility.

In incidents, it behaves like a system kill switch.

When token flows, federation paths, or session dependencies fail, customer impact can become total within minutes.

This chapter breaks down the identity failure modes teams skip in resilience planning and how to design fallback paths.

What is your fallback when your primary identity path fails?`,

  '000033-silent-outages-data-corruption.md': `Some of the worst outages return successful responses.

That is why they spread.

Data corruption, replication drift, and idempotency mistakes can propagate for hours while standard uptime metrics stay green.

This chapter focuses on detecting failures that look like success before customers discover them first.

How does your team detect silent data corruption today?`,

  '000034-reliability-illusions.md': `Long uptime can create dangerous confidence.

Confidence without verification is a reliability illusion.

This chapter examines six illusions that repeatedly mislead teams, from SLA theater to untested recovery and cost-optimized fragility.

Reliable systems are built by testing assumptions until they fail, then correcting them.

Which reliability assumption in your environment remains untested?`,

  '000035-change-primary-failure-source.md': `Most outages are deployed, not discovered.

Change is still the dominant failure source in production systems.

Teams often optimize for deployment speed without equal investment in deployment safety, rollback integrity, and dependency coordination.

This chapter details the failure modes behind change-driven incidents and what disciplined release engineering looks like.

What is your strongest deployment safety control today?`,

  '000036-sre-agents-pattern-models-not-logic-models.md': `I keep hearing the same promise: autonomous SRE agents will solve incident response.

The gap is reasoning quality under novel failure.

LLMs are excellent pattern systems. Production incidents routinely produce conditions that do not match known patterns.

This post separates where AI genuinely helps SRE today from where marketing claims outrun operational reality.

What evidence convinces you that an AI reliability tool can handle unknown failure modes?`
};

const files = fs.readdirSync(postsDir).filter((name) => name.endsWith('.md'));
let updated = 0;

for (const file of files) {
  const fullPath = path.join(postsDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!match) {
    console.warn(`Skipping ${file}: frontmatter not found`);
    continue;
  }

  const body = rewrites[file];
  if (!body) {
    console.warn(`Skipping ${file}: no rewrite provided`);
    continue;
  }

  const next = `${match[0]}\n${body.trim()}\n`;
  fs.writeFileSync(fullPath, next, 'utf8');
  updated += 1;
}

console.log(`Updated ${updated} LinkedIn posts.`);
