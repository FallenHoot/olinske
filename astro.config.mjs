import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: process.env.SITE_URL || 'https://zach.olinski.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  redirects: {
    '/posts/000003-ai-agent-governance-framework': '/posts/ai-agent-governance-starting-point'
  }
});
