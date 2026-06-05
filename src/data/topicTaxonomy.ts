import type { CollectionEntry } from 'astro:content';

export interface TopicDefinition {
  slug: string;
  label: string;
  description: string;
  keywords: string[];
}

export const TOPICS: TopicDefinition[] = [
  {
    slug: 'cloud-architecture',
    label: 'Cloud Architecture',
    description: 'Azure, AWS, cloud infrastructure, networking, infrastructure-as-code, and resilience design patterns.',
    keywords: ['cloud-architecture', 'architecture', 'azure', 'aws', 'networking', 'iac', 'resilience', 'kubernetes', 'aks'],
  },
  {
    slug: 'legacy-systems',
    label: 'Legacy Systems',
    description: 'Mainframes, COBOL, modernization strategies, migration planning, and technical debt reduction.',
    keywords: ['legacy-systems', 'mainframe', 'mainframes', 'cobol', 'modernization', 'migration', 'tech-debt', 'technical-debt'],
  },
  {
    slug: 'geospatial',
    label: 'Geospatial',
    description: 'Mapbox, GIS, location data pipelines, and practical geography-based architecture decisions.',
    keywords: ['geospatial', 'gis', 'mapbox', 'mapping', 'location', 'geography', 'norway'],
  },
  {
    slug: 'engineering-culture',
    label: 'Engineering Culture',
    description: 'Team leadership, hiring, decision frameworks, and operating rhythms for high-trust engineering organizations.',
    keywords: ['engineering-culture', 'leadership', 'hiring', 'decision-making', 'cto', 'operations', 'execution'],
  },
  {
    slug: 'family-legacy',
    label: 'Family Legacy',
    description: 'Genealogy, Wisconsin history, ship logs, and migration stories preserved through technical storytelling.',
    keywords: ['family-legacy', 'genealogy', 'wisconsin', 'history', 'ship', 'migration', 'heritage'],
  },
  {
    slug: 'ai-strategy',
    label: 'AI Strategy',
    description: 'AI agents, LLM architecture, prompt engineering, and governance for enterprise AI systems.',
    keywords: ['ai-strategy', 'ai', 'agents', 'agent', 'llm', 'prompt', 'governance', 'mcp'],
  },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function isKeywordMatch(keyword: string, tag: string): boolean {
  return tag.includes(keyword) || keyword.includes(tag);
}

export function scoreTopic(topic: TopicDefinition, tags: string[]): number {
  const normalizedTags = tags.map(normalize);
  return normalizedTags.reduce((score, tag) => {
    const matched = topic.keywords.some((keyword) => isKeywordMatch(normalize(keyword), tag));
    return matched ? score + 1 : score;
  }, 0);
}

export function getTopicMatches(tags: string[]): TopicDefinition[] {
  return TOPICS
    .map((topic) => ({ topic, score: scoreTopic(topic, tags) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.topic);
}

export function getPrimaryTopic(tags: string[]): TopicDefinition | null {
  return getTopicMatches(tags)[0] ?? null;
}

export function filterPostsByTopic(posts: CollectionEntry<'posts'>[], topicSlug: string): CollectionEntry<'posts'>[] {
  const topic = TOPICS.find((entry) => entry.slug === topicSlug);
  if (!topic) return [];

  return posts.filter((post) => {
    const tags = post.data.tags ?? [];
    return scoreTopic(topic, tags) > 0;
  });
}
