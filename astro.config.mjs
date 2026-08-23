import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: process.env.SITE_URL || 'https://zach.olinske.com',
  output: 'static',
  integrations: [pagefind()],
  redirects: {
    '/posts/000003-ai-agent-governance-framework': '/posts/ai-agent-governance-starting-point',
    // Legacy book chapter URLs — redirected to new /book/ namespace
    '/posts/000000-table-of-contents': '/book/reliability-survival-guide/000000-table-of-contents/',
    '/posts/000017-reliability-is-an-economic-decision': '/book/reliability-survival-guide/000017-reliability-is-an-economic-decision/',
    '/posts/000018-reliability-is-an-economic-decision': '/book/reliability-survival-guide/000017-reliability-is-an-economic-decision/',
    '/posts/000019-systems-fail-according-to-incentives': '/book/reliability-survival-guide/000019-systems-fail-according-to-incentives/',
    '/posts/000020-shared-responsibility-accountability-vacuum': '/book/reliability-survival-guide/000020-shared-responsibility-accountability-vacuum/',
    '/posts/000021-reliability-equation-financial-model': '/book/reliability-survival-guide/000021-reliability-equation-financial-model/',
    '/posts/000022-provider-failures-status-pages': '/book/reliability-survival-guide/000022-provider-failures-status-pages/',
    '/posts/000023-partial-failure-control-plane-failures': '/book/reliability-survival-guide/000023-partial-failure-control-plane-failures/',
    '/posts/000024-hidden-cost-reliability-tooling': '/book/reliability-survival-guide/000024-hidden-cost-reliability-tooling/',
    '/posts/000025-reliability-tradeoffs-on-call-finops': '/book/reliability-survival-guide/000025-reliability-tradeoffs-on-call-finops/',
    '/posts/000026-reliability-governance-adr-ledger-indicators': '/book/reliability-survival-guide/000026-reliability-governance-adr-ledger-indicators/',
    '/posts/000027-reliability-execution-quarterly-plan': '/book/reliability-survival-guide/000027-reliability-execution-quarterly-plan/',
    '/posts/000028-reliability-operating-artifacts-and-policy-templates': '/book/reliability-survival-guide/000028-reliability-operating-artifacts-and-policy-templates/',
    '/posts/000029-reliability-pricing-saas-margin-trap': '/book/reliability-survival-guide/000029-reliability-pricing-saas-margin-trap/',
    '/posts/000030-reliability-maturity-organizational-adoption': '/book/reliability-survival-guide/000030-reliability-maturity-organizational-adoption/',
    '/posts/000031-the-things-that-actually-break': '/book/reliability-survival-guide/000031-the-things-that-actually-break/',
    '/posts/000032-identity-tier-zero-spof': '/book/reliability-survival-guide/000032-identity-tier-zero-spof/',
    '/posts/000033-silent-outages-data-corruption': '/book/reliability-survival-guide/000033-silent-outages-data-corruption/',
    '/posts/000034-reliability-illusions': '/book/reliability-survival-guide/000034-reliability-illusions/',
    '/posts/000035-change-primary-failure-source': '/book/reliability-survival-guide/000035-change-primary-failure-source/',
    '/posts/000036-first-24-hours-incident-triage': '/book/reliability-survival-guide/000036-first-24-hours-incident-triage/',
    '/posts/000037-incident-triage-response-protocols': '/book/reliability-survival-guide/000037-incident-triage-response-protocols/',
    '/posts/appendix-a-crisis-reference-cards': '/book/reliability-survival-guide/appendix-a-crisis-reference-cards/',
    '/posts/appendix-b-operational-artifacts': '/book/reliability-survival-guide/appendix-b-operational-artifacts/',
    '/posts/appendix-c-field-playbooks': '/book/reliability-survival-guide/appendix-c-field-playbooks/',
    '/posts/glossary-reliability-terms': '/book/reliability-survival-guide/glossary-reliability-terms/',
    '/posts/reading-paths': '/book/reliability-survival-guide/reading-paths/',
  }
});
