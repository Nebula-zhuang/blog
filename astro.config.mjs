// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * 站点地址
 *
 * 优先级：环境变量 SITE_URL  >  内置的生产地址  >  本地 localhost
 *
 * - 本地开发（npm run dev）：自动用 http://localhost:4321，不用管
 * - 线上构建（npm run build）：用下面 PRODUCTION_URL
 * - 想临时改：设环境变量即可，例如 BASE_PATH（GitHub Pages 子路径）
 *
 * ⚠️ 换了域名（比如绑了自定义域名）只需要改 PRODUCTION_URL 这一行，
 *    或者设环境变量 SITE_URL 覆盖它。
 */
const PRODUCTION_URL = 'https://blog-6tl.pages.dev';

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('dev');

const siteUrl =
  process.env.SITE_URL || (isDev ? 'http://localhost:4321' : PRODUCTION_URL);

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
