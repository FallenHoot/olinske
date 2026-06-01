// Extended BCDR Assessment Features
// This module adds: critical flow mapping, team readiness, executive conditions, cost-benefit simulator

export function initializeExtendedFeatures(state) {
  const { interviewInputs, criticalFlows, postureData, render } = state;
  
  // Team Readiness Scoring
  state.evaluateTeamReadiness = () => {
    const oncallOwner = interviewInputs.oncallOwner.value;
    const lastExec = interviewInputs.lastExec.value;
    const teamRtoCapable = interviewInputs.teamRtoCapable.value;
    const backupExpertise = interviewInputs.backupExpertise.value;
    
    let score = 100;
    const findings = [];
    
    // Oncall owner scoring
    if (oncallOwner === 'yes') score += 0; // Baseline
    else if (oncallOwner === 'rotating') score -= 10;
    else { score -= 25; findings.push('No named on-call responder.'); }
    
    // Last execution scoring
    if (lastExec === 'recent') score += 0;
    else if (lastExec === 'semi') score -= 15;
    else if (lastExec === 'old') score -= 30;
    else { score -= 40; findings.push('Recovery procedure never executed in production.'); }
    
    // Team RTO capability
    if (teamRtoCapable === 'yes') score += 0;
    else if (teamRtoCapable === 'unsure') score -= 20;
    else { score -= 40; findings.push('Team unlikely to meet stated RTO under load.'); }
    
    // Backup expertise
    if (backupExpertise === 'dedicated') score += 0;
    else if (backupExpertise === 'shared') score -= 10;
    else if (backupExpertise === 'one-person') score -= 35;
    else { score -= 45; findings.push('Backup/restore expertise is external only.'); }
    
    return { score: Math.max(0, score), findings };
  };

  // Critical Flow Mapping
  state.addFlow = () => {
    const flowId = ++state.nextFlowId;
    criticalFlows.push({ flowId, name: `Flow ${flowId}`, description: '', serviceIds: new Set() });
    render();
  };

  state.removeFlow = (flowId) => {
    const idx = criticalFlows.findIndex(f => f.flowId === flowId);
    if (idx >= 0) {
      criticalFlows.splice(idx, 1);
      render();
    }
  };

  state.updateFlow = (flowId, name, description) => {
    const flow = criticalFlows.find(f => f.flowId === flowId);
    if (flow) {
      flow.name = name;
      flow.description = description;
      render();
    }
  };

  state.toggleFlowService = (flowId, serviceId) => {
    const flow = criticalFlows.find(f => f.flowId === flowId);
    if (flow) {
      if (flow.serviceIds.has(serviceId)) {
        flow.serviceIds.delete(serviceId);
      } else {
        flow.serviceIds.add(serviceId);
      }
      render();
    }
  };

  state.getFlowCoverage = (selections) => {
    const selectedServiceIds = new Set(
      selections
        .map(sel => state.getServiceById(sel.serviceId))
        .filter(s => s)
        .map(s => s.id)
    );
    
    const coverage = {
      unmappedServices: [...selectedServiceIds].filter(sid =>
        !criticalFlows.some(f => f.serviceIds.has(sid))
      ),
      uncoveredFlows: criticalFlows.filter(f => f.serviceIds.size === 0),
      totalFlows: criticalFlows.length,
      totalMappings: [...new Set(
        [...criticalFlows].flatMap(f => [...f.serviceIds])
      )].length,
    };
    
    return coverage;
  };

  // Cost-Benefit Simulator
  state.generatePostureComparison = () => {
    const rto = Number(interviewInputs.rto.value);
    const currentPosture = interviewInputs.recoveryPosture.value;
    
    const rows = [];
    for (const [posture, data] of Object.entries(postureData)) {
      const rtoMatch = data.rtoMinutes >= rto ? '✓' : '✗';
      const isCurrentPosture = posture === currentPosture;
      rows.push({
        posture: isCurrentPosture ? `${data.label || posture} (current)` : (data.label || posture),
        costMonthly: `$${data.costMonthly.toLocaleString()}`,
        rtoMinutes: `${data.rtoMinutes}`,
        rtoMatch,
        complexity: data.complexity,
        riskScore: data.riskScore,
        annualCost: `$${(data.costMonthly * 12).toLocaleString()}`,
      });
    }
    
    return rows;
  };

  // Enhanced Executive Summary with Conditions
  state.buildExecutiveSummaryWithConditions = (snapshot) => {
    const interview = snapshot.interview ?? {};
    const plan = snapshot.plan ?? {};
    const posture = interviewInputs.recoveryPosture.value;
    const teamReadiness = state.evaluateTeamReadiness();
    const flowCoverage = state.getFlowCoverage(snapshot.selections ?? []);
    
    const conditions = [];
    
    // Recovery posture conditions
    if (posture === 'backup-only') {
      conditions.push('backup-and-restore recovery is tested monthly');
    } else if (posture === 'cold-standby') {
      conditions.push('cold-standby failover is validated quarterly');
    } else if (posture === 'warm-standby') {
      conditions.push('warm-standby synchronization is verified every 6 months');
    } else if (posture === 'active-active') {
      conditions.push('active-active failover is tested continuously');
    }
    
    // Team capability conditions
    if (teamReadiness.score >= 80) {
      conditions.push('team has executed recovery procedures in the past 3 months');
    } else if (teamReadiness.score >= 60) {
      conditions.push('team readiness requires attention before production deployment');
    } else {
      conditions.push('team readiness must be improved before this commitment is valid');
    }
    
    // Monitoring conditions
    const monitoring = interviewInputs.monitoring.value;
    if (monitoring === 'flow') {
      conditions.push('critical-flow monitoring and alerting are in place');
    } else if (monitoring === 'component') {
      conditions.push('component-level monitoring is supplemented with synthetic flow tests');
    } else {
      conditions.push('monitoring must be enhanced to flow-level before this commitment');
    }
    
    // Flow mapping conditions
    if (flowCoverage.unmappedServices.length === 0 && flowCoverage.uncoveredFlows.length === 0) {
      conditions.push('all critical paths are documented and mapped to service selections');
    } else if (flowCoverage.uncoveredFlows.length > 0) {
      conditions.push(`${flowCoverage.uncoveredFlows.length} defined flow(s) lack service mapping`);
    }
    
    // Feasibility condition
    if (!plan.feasible) {
      conditions.push('this commitment exceeds current modeled composite availability');
    }
    
    const riskLine = interview.score == null
      ? 'Resilience posture is still being assessed.'
      : `Current readiness is ${interview.score}%, with ${interview.highGaps ?? 0} high and ${interview.mediumGaps ?? 0} medium gap(s).`;
    
    const commitmentLine = plan.feasible
      ? `Commitment target of ${Number(document.getElementById('company-sla')?.value ?? '99.90').toFixed(2)}% is achievable.`
      : `Commitment target exceeds what the dependency model supports.`;
    
    return {
      summary: `${riskLine} ${commitmentLine}`,
      conditions,
      conditionStatement: conditions.length > 0
        ? `This commitment is valid IF: ${conditions.join('; ')}.`
        : 'No conditional constraints identified.',
      teamReadiness: teamReadiness.score,
      flowCoverage,
    };
  };
}
