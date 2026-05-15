import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './content/published', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    publishDate: z.coerce.date(),
    lastUpdated: z.coerce.date().optional(),
    appliesTo: z.string().optional(),
    tags: z.array(z.string()).default([]),
    coreQuestion: z.string().min(20).optional(),
    bluf: z.array(z.string()).min(2).max(5).optional(),
    prerequisites: z.array(z.string()).default([]),
    followUps: z.array(z.string()).default([]),
    status: z.enum(['backlog', 'research', 'draft', 'review', 'approved', 'scheduled', 'published']),
    slug: z.string().optional()
  })
});

export const collections = {
  posts
};
