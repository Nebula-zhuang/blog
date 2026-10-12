import type { APIRoute } from 'astro';
import { site } from '../config';
import { getSortedPosts, postUrl } from '../utils/posts';

/**
 * RSS 2.0 订阅源：/rss.xml
 * 这里手写而不是用 @astrojs/rss，是为了让这个路由零第三方依赖、构建更稳。
 * 输出是标准 RSS 2.0，Feedly / Inoreader / Reeder 都能正常订阅。
 */
export const GET: APIRoute = async () => {
  const posts = await getSortedPosts();
  const feedUrl = new URL('/rss.xml', site.url).href;

  const items = posts
    .map((post) => {
      const link = new URL(postUrl(post), site.url).href;
      const categories = post.data.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(post.data.description)}</description>
${categories}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${new URL('/', site.url).href}</link>
    <description>${escapeXml(site.description)}</description>
    <language>zh-cn</language>
    <managingEditor>${escapeXml(site.author)}</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
