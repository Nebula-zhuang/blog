// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * 站点地址与路径
 *
 * 三种部署方式，只靠两个环境变量区分，代码不用改：
 *
 * 1. 本地开发
 *    pnpm dev                      → http://localhost:4321/
 *
 * 2. GitHub Pages（github.io，站点在子路径下）
 *    SITE_URL=https://用户名.github.io
 *    BASE_PATH=/仓库名
 *
 * 3. Cloudflare Pages / 自定义域名（站点在根目录）
 *    SITE_URL=https://你的域名
 *    BASE_PATH 留空即可
 */
const siteUrl = process.env.SITE_URL || 'http://localhost:4321';

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
  // 纯静态输出：产物是 dist/ 下的静态文件，可直接丢给 GitHub Pages / Cloudflare Pages
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
