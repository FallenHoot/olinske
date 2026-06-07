import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
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
  slug: z.string().optional(),
  copyright: z.string().optional(),
  licenseUrl: z.string().optional(),
  attributionRequired: z.boolean().optional(),
  commercialUsePermitted: z.boolean().optional(),
});

const posts = defineCollection({
  loader: glob({ base: './content/published', pattern: '**/*.md' }),
  schema: postSchema,
});

const book = defineCollection({
  loader: glob({ base: './content/book', pattern: '**/*.md' }),
  schema: postSchema,
});

export const collections = {
  posts,
  book,
};
