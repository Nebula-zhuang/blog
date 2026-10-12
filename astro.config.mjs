// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// 站点地址的唯一定义处：换域名只改 src/config.ts 里的 PRODUCTION_URL
import { PRODUCTION_URL } from './src/config.ts';

/**
 * 站点地址
 *
 * 优先级：环境变量 SITE_URL  >  src/config.ts 的 PRODUCTION_URL
 * 本地开发（npm run dev）自动用 http://localhost:4321
 *
 * ⭐ 换域名：只改 src/config.ts 里的 PRODUCTION_URL 一行。
 */
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('dev');

const siteUrl = process.env.SITE_URL || (isDev ? 'http://localhost:4321' : PRODUCTION_URL);

// 归一化：允许写 "仓库名" 或 "/仓库名/" 或 "/仓库名"
/** @param {string | undefined} raw */
function normalizeBase(raw) {
  if (!raw || raw === '/') return '/';
  const trimmed = raw.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '/';
}

const base = normalizeBase(process.env.BASE_PATH);

export default defineConfig({
  site: siteUrl,
  base,
  // 纯静态输出：产物是 dist/ 下的静态文件，可直接丢给 Cloudflare Pages / GitHub Pages
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: {
    enabled: false,
  },
});
