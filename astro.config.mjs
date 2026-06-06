import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: process.env.SITE_URL || 'https://olinske.com',
  output: 'static',
  integrations: [pagefind()],
  redirects: {
    '/posts/000003-ai-agent-governance-framework': '/posts/ai-agent-governance-starting-point'
  }
});
