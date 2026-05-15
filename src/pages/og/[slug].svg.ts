import { getCollection } from 'astro:content';

export const prerender = true;

const WIDTH = 1200;
const HEIGHT = 630;

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function trimForLine(value: string, max = 64) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => data.status === 'published' || data.status === 'scheduled');

  return posts.map((post) => {
    const slug = post.data.slug ?? post.id.replace(/\.md$/, '');
    return {
      params: { slug },
      props: {
        title: post.data.title,
        tag: (post.data.tags?.[0] ?? 'cloud-architecture').toUpperCase(),
      },
    };
  });
}

export function GET({ props }: { props: { title: string; tag: string } }) {
  const title = trimForLine(props.title ?? 'Olinske');
  const tag = trimForLine(props.tag ?? 'CLOUD-ARCHITECTURE', 24);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="t d">
  <title id="t">${xmlEscape(title)}</title>
  <desc id="d">${xmlEscape(tag)} article on Olinske.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1020"/>
      <stop offset="55%" stop-color="#122445"/>
      <stop offset="100%" stop-color="#1c3a6a"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <circle cx="1010" cy="80" r="260" fill="#71c2ff" opacity="0.24"/>
  <circle cx="120" cy="610" r="280" fill="#6cb8ff" opacity="0.15"/>
  <text x="84" y="130" fill="#9dc5ff" font-family="Public Sans, Arial, sans-serif" font-size="30" letter-spacing="3">ZACH OLINSKE</text>
  <text x="84" y="190" fill="#c7dcff" font-family="IBM Plex Mono, Consolas, monospace" font-size="28">${xmlEscape(tag)}</text>
  <text x="84" y="300" fill="#ffffff" font-family="Source Serif 4, Georgia, serif" font-size="70" font-weight="700">${xmlEscape(title)}</text>
  <text x="84" y="380" fill="#d8e7ff" font-family="Public Sans, Arial, sans-serif" font-size="36">Signal over hype for enterprise architecture.</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
