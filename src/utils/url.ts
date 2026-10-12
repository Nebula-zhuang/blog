/**
 * 路径前缀处理
 *
 * Astro 的 `base` 只会自动加到构建产物（CSS/JS）和它自己生成的链接上，
 * 手写在模板里的 href 不会被改写。如果部署在子路径
 * （https://用户名.github.io/仓库名/），所有站内链接都必须带上 base。
 *
 * 这里统一用 withBase() 包一层，根目录部署时也正确（base 为 '/'）。
 */

/** Astro 注入的 base，形如 '/' 或 '/my-blog'（无尾斜杠） */
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * 给站内绝对路径加上 base 前缀。
 * 外链、锚点、mailto 原样返回。
 */
export function withBase(path: string): string {
  if (!path) return base || '/';
  // 外链 / 协议链接 / 锚点 / mailto 不做处理
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
  if (!path.startsWith('/')) return path; // 相对路径交给浏览器解析
  return `${base}${path}`;
}
