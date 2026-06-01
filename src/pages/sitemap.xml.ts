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
    return new Response('Sitemap requires Astro site to be configured.', { status: 500 });
  }

  const posts = await getCollection('posts', ({ data }) => data.status === 'published' || data.status === 'scheduled');

  const staticUrls = ['/', '/posts/', '/license/', '/disclaimer/', '/attribution/'];
  const postUrls = posts.map((post) => {
    const slug = post.data.slug ?? post.id.replace(/\.md$/, '');
    return `/posts/${slug}/`;
  });

  const urls = [...new Set([...staticUrls, ...postUrls])];

  const entries = urls.map((pathname) => {
    const loc = xmlEscape(new URL(pathname, site).toString());
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      '  </url>'
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>'
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
