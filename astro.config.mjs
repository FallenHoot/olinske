import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://zach.olinski.com',
  output: 'static',
  redirects: {
    '/posts/000003-ai-agent-governance-framework': '/posts/ai-agent-governance-starting-point'
  }
});
