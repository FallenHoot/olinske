import { getCollection } from 'astro:content';

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET({ site }: { site?: URL }) {
  if (!site) {
    return new Response('RSS requires Astro site to be configured.', { status: 500 });
  }

  const posts = (
    await getCollection('posts', ({ data }) => data.status === 'published' || data.status === 'scheduled')
  ).sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  const itemsXml = posts.map((post) => {
    const slug = post.data.slug ?? post.id.replace(/\.md$/, '');
    const url = new URL(`/posts/${slug}/`, site).toString();
    const title = xmlEscape(post.data.title);
    const description = xmlEscape(post.data.description);
    const pubDate = post.data.publishDate.toUTCString();

    return [
      '    <item>',
      `      <title>${title}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <description>${description}</description>`,
      `      <pubDate>${pubDate}</pubDate>`,
      '    </item>'
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    '    <title>Olinske</title>',
    `    <link>${new URL('/', site).toString()}</link>`,
    '    <description>Signal over hype for enterprise AI, cloud resilience, and CTO operating models.</description>',
    '    <language>en-us</language>',
    itemsXml,
    '  </channel>',
    '</rss>'
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
}
