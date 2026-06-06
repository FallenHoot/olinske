import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: process.env.SITE_URL || 'https://olinske.com',
  output: 'static',
  integrations: [pagefind()],
  redirects: {
    '/posts/000003-ai-agent-governance-framework': '/posts/ai-agent-governance-starting-point',
    '/posts/000018-reliability-is-an-economic-decision': '/posts/000017-reliability-is-an-economic-decision'
  }
});
