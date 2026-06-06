export interface ReliabilityTrack {
  id: string;
  title: string;
  audience: string;
  slugs: string[];
}

export const RELIABILITY_CHAPTER_LABELS: Record<string, string> = {
  '000018-reliability-is-an-economic-decision': 'Chapter 1: Economic Decision',
  '000019-systems-fail-according-to-incentives': 'Chapter 2: Incentives',
  '000020-shared-responsibility-accountability-vacuum': 'Chapter 3b: Accountability Vacuum',
  '000021-reliability-equation-financial-model': 'Chapter 4: Financial Model',
  '000022-provider-failures-status-pages': 'Chapter 5: Provider Constraints',
  '000023-partial-failure-control-plane-failures': 'Chapter 6: Partial Failure',
  '000024-hidden-cost-reliability-tooling': 'Chapter 7: Tooling Cost',
  '000025-reliability-tradeoffs-on-call-finops': 'Chapter 8: Trade-offs',
  '000026-reliability-governance-adr-ledger-indicators': 'Chapter 9: Governance',
  '000027-reliability-execution-quarterly-plan': 'Chapter 10: Quarterly Plan',
  '000028-reliability-operating-artifacts-and-policy-templates': 'Appendix: Templates',
  '000029-reliability-pricing-saas-margin-trap': 'Chapter 12: Pricing and Margin',
  '000030-reliability-maturity-organizational-adoption': 'Chapter 13: Adoption',
  '000031-the-things-that-actually-break': 'Chapter 3: What Breaks',
  '000032-identity-tier-zero-spof': 'Chapter 5a: Identity Tier-0',
  '000033-silent-outages-data-corruption': 'Chapter 6b: Silent Outages',
  '000034-reliability-illusions': 'Chapter 7b: Reliability Illusions',
  '000035-change-primary-failure-source': 'Chapter 7d: Change Failure',
  '000036-sovereignty-myth-scale-reality-digital-readiness': 'Chapter 14: Sovereignty Reality',
};

export const RELIABILITY_TRACKS: ReliabilityTrack[] = [
  {
    id: 'rapid-orientation',
    title: 'Rapid Orientation (2 hours)',
    audience: 'Leaders and architects who need the core model fast.',
    slugs: [
      '000018-reliability-is-an-economic-decision',
      '000019-systems-fail-according-to-incentives',
      '000021-reliability-equation-financial-model',
      '000035-change-primary-failure-source',
    ],
  },
  {
    id: 'weekend-system-read',
    title: 'Weekend System Read',
    audience: 'Readers working the full end-to-end argument.',
    slugs: [
      '000018-reliability-is-an-economic-decision',
      '000019-systems-fail-according-to-incentives',
      '000031-the-things-that-actually-break',
      '000020-shared-responsibility-accountability-vacuum',
      '000021-reliability-equation-financial-model',
      '000022-provider-failures-status-pages',
      '000023-partial-failure-control-plane-failures',
      '000024-hidden-cost-reliability-tooling',
      '000025-reliability-tradeoffs-on-call-finops',
      '000026-reliability-governance-adr-ledger-indicators',
      '000027-reliability-execution-quarterly-plan',
    ],
  },
  {
    id: 'on-call-tonight',
    title: 'On-Call Tonight',
    audience: 'Engineers actively handling incidents and noisy signals.',
    slugs: [
      '000033-silent-outages-data-corruption',
      '000024-hidden-cost-reliability-tooling',
      '000023-partial-failure-control-plane-failures',
      '000034-reliability-illusions',
    ],
  },
  {
    id: 'program-builder',
    title: 'Reliability Program Builder',
    audience: 'Platform leaders building repeatable reliability governance.',
    slugs: [
      '000018-reliability-is-an-economic-decision',
      '000019-systems-fail-according-to-incentives',
      '000021-reliability-equation-financial-model',
      '000026-reliability-governance-adr-ledger-indicators',
      '000027-reliability-execution-quarterly-plan',
      '000028-reliability-operating-artifacts-and-policy-templates',
    ],
  },
  {
    id: 'cto-leadership',
    title: 'CTO / Leadership Track',
    audience: 'Executives balancing reliability, margin, and adoption risk.',
    slugs: [
      '000018-reliability-is-an-economic-decision',
      '000019-systems-fail-according-to-incentives',
      '000025-reliability-tradeoffs-on-call-finops',
      '000029-reliability-pricing-saas-margin-trap',
      '000030-reliability-maturity-organizational-adoption',
    ],
  },
];
