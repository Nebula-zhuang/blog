import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 博客文章集合
 *
 * 文章放在 src/content/blog/ 下，子目录名就是「分类」：
 *   src/content/blog/随笔/第一篇.md   →  /posts/随笔/第一篇/
 *   src/content/blog/hello.md         →  /posts/hello/   （未分类）
 *
 * strict: false 表示允许一篇都没有 —— 刚建站时不会报
 * "The collection blog does not exist or is empty" 的警告。
 */
const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
    strict: false,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** 发布日期 */
    pubDate: z.coerce.date(),
    /** 修订日期（可选，填了文章页会显示"修订于…"） */
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** 草稿：本地开发可见，正式构建会被过滤掉 */
    draft: z.boolean().default(false),
    /** 置顶：会出现在首页的"精选"大卡片里 */
    pinned: z.boolean().default(false),
    /** 封面图（可选，放 public/ 下或外链），会显示在文章列表里 */
    cover: z.string().optional(),
  }),
});

export const collections = { blog };
