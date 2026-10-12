import type { APIRoute } from 'astro';
import { site } from '../config';

/**
 * 分享用的大图（OG image）。
 * 为了零依赖，这里输出 SVG——现代社交平台（X、Discord、Telegram、Slack）都能正常渲染。
 * 想换成 PNG（微信/Twitter 兼容性更好）就删掉这个文件，
 * 然后往 public/ 放一张 1200×630 的 og.png 即可。
 */
export const GET: APIRoute = () => {
  const title = site.title;
  const tagline = site.tagline;
  const author = site.author;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a12"/>
      <stop offset="60%" stop-color="#141430"/>
      <stop offset="100%" stop-color="#0a0a12"/>
    </linearGradient>
    <radialGradient id="g1" cx="20%" cy="18%" r="55%">
      <stop offset="0%" stop-color="#8b7dff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#8b7dff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="84%" cy="82%" r="50%">
      <stop offset="0%" stop-color="#37d5d0" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#37d5d0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="text" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#b9aaff"/>
      <stop offset="100%" stop-color="#6fe6e0"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>

  <g fill="#ffffff" opacity="0.5">
    <circle cx="140" cy="120" r="2.4"/><circle cx="330" cy="80" r="1.6"/>
    <circle cx="560" cy="150" r="2"/><circle cx="880" cy="96" r="2.6"/>
    <circle cx="1050" cy="200" r="1.8"/><circle cx="240" cy="520" r="2.2"/>
    <circle cx="700" cy="560" r="1.7"/><circle cx="980" cy="470" r="2.3"/>
  </g>

  <text x="86" y="250" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',system-ui,sans-serif"
        font-size="34" letter-spacing="10" fill="#8f8fb8">PERSONAL BLOG</text>

  <text x="86" y="360" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',system-ui,sans-serif"
        font-size="86" font-weight="700" fill="url(#text)">${escapeXml(title)}</text>

  <text x="86" y="440" font-family="'PingFang SC','Microsoft YaHei','Noto Sans SC',system-ui,sans-serif"
        font-size="34" fill="#c3c3de">${escapeXml(tagline)}</text>

  <g transform="translate(86, 500)">
    <rect x="0" y="0" width="58" height="6" rx="3" fill="#8b7dff"/>
    <rect x="66" y="0" width="30" height="6" rx="3" fill="#37d5d0"/>
    <text x="0" y="62" font-family="'PingFang SC','Microsoft YaHei',system-ui,sans-serif"
          font-size="26" fill="#7c7c98">${escapeXml(author)}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
