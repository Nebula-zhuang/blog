# 我的个人博客

一个**零服务器成本**的个人博客：白底简约风、右侧边栏布局，文章是 Markdown，构建成静态 HTML；点赞、阅读量、在线人数用边缘函数实现。

## 快速开始

```bash
npm install     # 安装依赖
npm run dev         # 本地开发（热更新）→ http://localhost:4321
npm run build       # 构建（顺带生成搜索索引）
npm run preview     # 预览构建产物
```

如果 `astro dev / preview` 起不来（受限沙箱、CI 容器等），用内置的零依赖静态服务看构建结果：

```bash
npm run build
npm run serve       # 只服务 dist/，等价于 node scripts/serve-dist.mjs 4321
```

> 站内搜索（Pagefind）的索引是**构建时**生成的，所以本地想试搜索，要先 `npm run build`。

## 页面结构

```
┌──────────────────────────────┬──────────────┐
│                              │   头像        │
│   文章列表 / 正文             │   姓名 · 签名  │
│   （左侧主内容区）            │   社交图标     │
│                              │   ─────────   │
│                              │   导航        │
│                              │   ─────────   │
│                              │   友情链接     │
└──────────────────────────────┴──────────────┘
```

窄屏（≤900px）时侧边栏自动收成顶部一张卡，导航变成横向换行。

## 一键上线（Cloudflare Pages，推荐）

推到 GitHub 后，在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → 连接仓库：

| 配置项 | 值 |
| --- | --- |
| Framework preset | `Astro` |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| 环境变量 `SITE_URL` | `https://你的项目.pages.dev`（之后改成正式域名） |

> ⚠️ **不要**设 `BASE_PATH`，Cloudflare 站点在根目录。
>
> 想要真实的点赞/阅读量，再建一个 KV 命名空间并绑定到项目，变量名必须是 `BLOG_KV`。

**HTTPS 自动开启，不需要买证书，也不需要服务器。** 域名是可选的（见 [`docs/部署指南.md`](docs/部署指南.md)）。

<details>
<summary>也可以部署到 GitHub Pages（点开看差异）</summary>

仓库里保留了 `.github/workflows/deploy.yml`，把仓库 **Settings → Pages → Source** 选成 **GitHub Actions** 即可，会自动处理子路径。

代价：GitHub Pages 跑不了边缘函数，**点赞 / 阅读量 / 在线人数会降级为浏览器本地记录**；免费版还要求仓库公开。

</details>

## 目录结构

```
my-blog/
├─ src/
│  ├─ config.ts              ← 站点配置：站名、边栏资料、导航、社交、入场页、背景
│  ├─ data/friends.ts        ← 友情链接数据（加一条就多一个）
│  ├─ content/blog/          ← 文章：<分类>/<文件名>.md
│  ├─ layouts/BaseLayout.astro   ← HTML 骨架、SEO、双栏框架、全局脚本
│  ├─ components/
│  │  ├─ Sidebar.astro       ← 右侧边栏（头像 / 姓名 / 社交 / 导航 / 友链）
│  │  ├─ Header.astro        ← 顶栏（站名 + 搜索 + 主题切换）
│  │  ├─ Splash.astro        ← 入场加载页（极简 / 打字机 / 关闭）
│  │  ├─ Search.astro        ← 站内搜索弹窗（Pagefind）
│  │  ├─ ThemeToggle.astro   ← 亮/暗主题切换
│  │  ├─ PostCard.astro      ← 文章列表项
│  │  ├─ Toc.astro           ← 文章目录
│  │  ├─ Giscus.astro        ← 评论区
│  │  └─ Reactions.astro     ← 阅读量 / 点赞 / 在线人数
│  ├─ pages/                 ← 首页、文章、分类、标签、归档、友链、关于、404、RSS、OG
│  └─ styles/global.css      ← 设计令牌（颜色、圆角、间距）
├─ functions/api/stats.ts    ← Cloudflare Pages Functions：点赞/阅读量/在线人数
├─ scripts/serve-dist.mjs    ← 零依赖静态预览服务
└─ docs/部署指南.md           ← 手把手上线文档
```

## 改边栏资料（头像那栏）

全部在 `src/config.ts` 的 `sidebar` 字段：

```ts
sidebar: {
  avatar: '/avatar.svg',        // 换成 /avatar.png 或外链都行，留空则用首字方块
  name: '若溪',
  latin: 'Ruoxi',               // 英文名，留空不显示
  bio: '写代码，也写字。慢慢来，比较快。',
  location: 'Hangzhou, CN',     // 留空不显示
  nav: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/blog' },
    { label: '分类', href: '/categories' },
    { label: '标签', href: '/tags' },
    { label: '归档', href: '/archive' },
    { label: '友链', href: '/friends' },
    { label: '关于', href: '/about' },
  ],
},
social: [
  { label: 'GitHub', href: 'https://github.com/你的账号', icon: 'github' },
  { label: '邮箱', href: 'mailto:you@example.com', icon: 'mail' },
  { label: 'RSS', href: '/rss.xml', icon: 'rss' },
],
```

头像文件放在 `public/` 下即可（例如 `public/avatar.png`，然后把 `avatar` 改成 `/avatar.png`）。

## 换入场加载页

`src/config.ts` 的 `splash` 字段：

```ts
splash: {
  variant: 'video',        // 'video' 动画视频 | 'minimal' 极简 | 'typewriter' 打字机 | 'none' 不要这一屏

  /* video 模式 */
  video: '/splash.mp4',    // 视频放 public/ 下，换视频只改这一行
  videoLoop: true,
  videoFit: 'cover',       // 'cover' 铺满整屏当背景板 | 'contain' 整屏不裁切 | 'card' 居中卡片
  videoScale: 0.82,        // 仅 card 模式：卡片宽度占视口比例
  videoOverlay: 0.32,      // 压在视频上的文字遮罩强度，觉得字看不清就调大

  /* 文案（各模式通用） */
  greeting: '欢迎来到',
  name: '若溪的小窝',
  sub: '一个写字的地方 · 慢慢来',
  enterText: '下拉进入主页',
},
```

视频要求：**H.264 编码的 MP4**（最通用，Safari 也认），建议 3~6 秒、1 MB 以内，会自动静音循环播放。

`videoFit` 三种铺法：

| 值 | 效果 | 适合 |
| --- | --- | --- |
| `cover` | 铺满整屏，多余部分裁掉，画面可能被放大 | 当背景板（默认） |
| `contain` | 整屏显示，完整不裁切，四周可能留黑边 | 画面构图不能裁 |
| `card` | 居中的圆角卡片，不放大画面 | 素材分辨率低、怕糊 |

`cover` / `contain` 模式会自动加上：柔和遮罩（保证反白文字能看清）、站名与签名压在画面中下部、底部提示反白。

- 想**换视频**：把新文件放进 `public/`，改 `video` 指向它。
- 想**只改文案**：改 `greeting` / `name` / `sub` / `enterText`。
- 想**彻底改样式**：改 `src/components/Splash.astro` 里 `<style>` 的 `.splash-*` 规则。
- 重播动画：访问 `/?intro=1`；恢复正常行为：`sessionStorage.removeItem('splash-seen')` 后刷新。

## 首页结构

```
┌─────────────────────────────────────┐
│  ● 头像    Hello                    │
│            我是若溪，把想法写成文章…    │
│            一个记录技术、阅读与生活的…  │
│            4 篇文章 · 2 个分类 · 9 个标签│
├─────────────────────────────────────┤
│  [置顶 · 3 分钟]                     │
│  精选文章大标题                       │
│  摘要……                             │
├─────────────────────────────────────┤
│  最近文章                    全部 →   │
│  · 标题 / 摘要 / 日期 · 时长 · 分类    │
├─────────────────────────────────────┤
│  分类                        全部 →   │
│  标签                        全部 →   │
└─────────────────────────────────────┘
```

想改首页顺序或去掉某块，编辑 `src/pages/index.astro`；头像与自我介绍取自 `config.ts` 的 `sidebar` 字段。

## 写文章与分类

> 完整的写作流程（新建文章、frontmatter 字段、预览、发布、换头像、加友链）见 **[`docs/写作指南.md`](docs/写作指南.md)**，下面是精简版。

把 Markdown 放进 `src/content/blog/<分类名>/`，分类就自动出现了：

```
src/content/blog/
├─ tech/            → 分类「tech」
│  ├─ astro-static-site.md
│  └─ deploy-to-edge.md
└─ notes/           → 分类「notes」
   └─ hello-world.md
```

直接放在 `blog/` 根目录的文章归类为「未分类」。

frontmatter 字段：

```markdown
---
title: 文章标题
description: 一句话摘要，会出现在列表和搜索结果里
pubDate: 2026-02-01
tags: ['技术', '随笔']
draft: false      # true = 只在本地方便预览，正式构建不输出
pinned: false     # true = 在列表里置顶
---
```

> 正文里的站点内部链接建议写相对路径（例如 `../../../tags/`），因为它不经过 Astro 的 base 处理。

## 加友情链接

编辑 `src/data/friends.ts`，追加一项：

```ts
{
  name: '某某的博客',
  url: 'https://example.com',
  desc: '一句话介绍',
  initial: '某',        // 头像里的字，可选
  color: '#2563eb',     // 头像底色，可选
  avatar: 'https://…',  // 有头像图就填这个，优先于 initial
},
```

侧边栏显示前 5 个，`/friends` 页显示全部，并带一段"如何申请友链"的说明。

## 换背景（默认关闭）

```ts
background: {
  preset: 'none',   // none | grid | grain | waves | dusk | aurora | custom
  opacity: 0.85,
  blur: 24,
  speed: 26,        // 0 = 静止
  customColors: ['rgba(37,99,235,.10)', 'rgba(15,118,110,.08)'],
},
```

临时预览（不改代码）：`/?bg=grid`、`/?bg=grain`、`/?bg=dusk`、`/?bg=none`，`/?grain=1` 叠颗粒质感。

## 换配色

`src/styles/global.css` 顶部两段令牌：`:root`（亮色）和 `html[data-theme='dark']`（暗色）。想换主色只改三行：

```css
--accent: #2563eb;
--accent-soft: rgba(37, 99, 235, 0.08);
--accent-border: rgba(37, 99, 235, 0.28);
```

## 功能清单

| 功能 | 实现方式 | 需要服务器吗 |
| --- | --- | --- |
| 右侧边栏（头像 / 姓名 / 社交 / 导航 / 友链） | 纯 CSS 双栏 + sticky | 否 |
| 入场加载页（3 种变体可切换） | 纯 CSS/JS，会话内只播一次 | 否 |
| 页面切换转场 | Astro View Transitions | 否 |
| 滚动进场动效 | IntersectionObserver（位移很小） | 否 |
| 亮/暗主题 | localStorage + 内联脚本防闪屏 | 否 |
| 站内全文搜索（中文分词） | Pagefind 静态索引 | 否 |
| 分类 / 标签 / 归档 | 构建时从目录与 frontmatter 汇总 | 否 |
| 友情链接 | `src/data/friends.ts` | 否 |
| 评论区 | Giscus（GitHub Discussions） | 否 |
| 阅读量 / 点赞 / 在线人数 | Cloudflare Pages Functions + KV | 边缘函数，免费额度内 |
| RSS / sitemap / OG 图 / 结构化数据 | 构建时生成 | 否 |

## 常见问题

**分类页 404 / 文章链接不对？**
文章路由是 rest 形式的 `src/pages/posts/[...slug].astro`，`getStaticPaths` 里 `params` 的键名写 `slug`（不带点）。改完目录结构重新 `npm run build` 即可。

**为什么本地搜索没反应？**
索引只在 `npm run build` 时生成。跑 `npm run build` 后再 `npm run preview` 或 `npm run serve`。

**点赞数一直是 0 / 提示"本地预览环境"？**
说明没绑定 KV 或接口没跑起来。本地完整模拟：`npm run build && npm run cf:dev`；线上绑定名为 `BLOG_KV` 的 KV 命名空间。

**分享图为什么是 SVG？**
默认用构建时生成的 `/og.svg`，零依赖、文案直接改代码。要换 PNG（微信等更稳），放一张 1200×630 的 `public/og.png`，再把 `BaseLayout` 的 `ogImage` 改成 `/og.png`。

**能部署到 GitHub Pages 吗？**
可以，仓库里保留了对应工作流，子路径会自动处理。但 GitHub Pages 不支持边缘函数，点赞/阅读量会降级成本地存储。

## 受限环境备忘

沙箱 / CI 里可能遇到两件事：

1. **`npm install` 建不了符号链接**（Windows 需管理员权限或开发者模式）→ 改用 `npm install --ignore-scripts --legacy-peer-deps`
2. **Astro 构建报 `spawn EPERM`** → 构建需要创建子进程（astro sync、esbuild），这类环境要放开进程创建权限

> 另外提醒：不要在 PowerShell 里用 `Set-Content -Encoding utf8` 批改源码，它在中文字符串上可能产生乱码。用编辑器或 Node 脚本写文件更安全。
