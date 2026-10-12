import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from './url';

export type Post = CollectionEntry<'blog'>;

/**
 * 取全部文章：过滤草稿（生产环境）+ 按时间倒序 + 置顶优先。
 * 所有页面都走这个函数，保证排序一致。
 */
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  return posts.sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
  });
}

/**
 * 文章路径（不含 base 前缀）：/posts/<文件名>/
 * 文件放在 src/content/blog/<分类>/名字.md 时，id 就是 "<分类>/名字"，
 * 所以路径天然带上分类层级。
 * 统计接口用它当 KV 键，保证换域名/换子路径后数据不丢。
 */
export function postPath(post: Post): string {
  return `/posts/${post.id}/`;
}

/**
 * 文章分类：取 id 的第一段目录名。
 * src/content/blog/tech/astro.md → 'tech'
 * src/content/blog/hello.md      → '未分类'
 */
export function postCategory(post: Post): string {
  const segments = post.id.split('/');
  return segments.length > 1 ? segments[0] : UNCATEGORIZED;
}

export const UNCATEGORIZED = '未分类';

/** 统计各分类的文章数 */
export function collectCategories(posts: Post[]): { category: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) {
    const name = postCategory(post);
    map.set(name, (map.get(name) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'zh-CN'));
}

/** 分类链接 */
export function categoryUrl(category: string): string {
  return withBase(`/categories/${encodeURIComponent(category)}/`);
}

/** 文章链接（已带 base 前缀，可直接放进 href） */
export function postUrl(post: Post): string {
  return withBase(postPath(post));
}

/** 中文按字数估阅读时长（约 350 字/分钟） */
export function readingTime(body: string | undefined): string {
  if (!body) return '1 分钟';
  const clean = body.replace(/```[\s\S]*?```/g, '').replace(/[#>*`\-\[\]()]/g, '');
  const cjk = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = clean.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round((cjk + words * 1.6) / 350));
  return `${minutes} 分钟`;
}

/** 统一日期格式：2025 年 3 月 7 日 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(date);
}

/** ISO 日期，给 <time datetime> 和 RSS 用 */
export function isoDate(date: Date): string {
  return date.toISOString();
}

/** 统计标签及出现次数，按热度排序 */
export function collectTags(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

/** 按年份归档 */
export function groupByYear(posts: Post[]): { year: string; posts: Post[] }[] {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    const year = String(post.data.pubDate.getFullYear());
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return [...map.entries()]
    .map(([year, list]) => ({ year, posts: list }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}
