/**
 * 站点全局配置：改这里就够了，不用翻遍组件。
 */

/**
 * 背景方案（默认已关闭，走纯白简约风）
 *
 * - none    : 不要背景（默认）
 * - grid    : 极淡网格，技术感
 * - grain   : 素纸噪点
 * - waves   : 顶部光带呼吸
 * - dusk    : 暖色黄昏
 * - aurora  : 深空极光（原来的彩色流光）
 * - custom  : 自定义，用下面的 customColors 填颜色
 *
 * 想逐个预览：本地打开 /?bg=grid（或 grain / waves / dusk / aurora / none）
 */
export const backgrounds = {
  none: { label: '不要背景' },
  grid: { label: '淡网格' },
  grain: { label: '素纸噪点' },
  waves: { label: '光带呼吸' },
  dusk: { label: '暖色黄昏' },
  aurora: { label: '深空极光' },
  custom: { label: '自定义' },
} as const;

export type BackgroundPreset = keyof typeof backgrounds;

/**
 * 入场加载页（首页第一次进入时的那一屏）
 *
 * variant:
 * - 'video'   : 播放一段动画视频（默认，视频是 public/splash.mp4）
 * - 'minimal' : 极简——细字姓名居中 + 进度线 + 下拉进入
 * - 'typewriter' : 打字机问候 + 姓名逐字浮现
 * - 'none'    : 完全不要这一屏，直接进首页
 */
export type SplashVariant = 'video' | 'minimal' | 'typewriter' | 'none';

export const site = {
  /** 站点标题（浏览器标签、顶栏、页脚、首页大标题） */
  title: '流云的小窝',
  /** 首页大标题下面那句，也是流式输出的内容 */
  streamLine: '欢迎光临~',  /** 副标题（用于浏览器标签等） */
  tagline: '欢迎光临~',
  /** 站点描述（SEO + 分享卡片，也是首页那句简介） */
  description: '一个记录技术、阅读与生活的个人博客。',
  /** 作者名，用于文章页与 RSS */
  author: '流云',
  /**
   * 站点地址（用于 RSS、sitemap、OG 图、canonical）
   * 和 astro.config.mjs 里的 PRODUCTION_URL 保持一致。
   * 本地开发自动用 localhost；线上用生产地址；可用环境变量 SITE_URL 覆盖。
   */
  url:
    process.env.SITE_URL ||
    (import.meta.env.DEV ? 'http://localhost:4321' : 'https://blog-6tl.pages.dev'),

  /**
   * 右侧边栏（头像那栏）——这里所有内容都在侧边栏显示
   */
  sidebar: {
    /** 头像图片：放 public/ 下，或直接填外链。留空则用首字母方块 */
    avatar: '/avatar.png',
    /** 显示在头像下方的大字 */
    name: '流云',
    /** 英文名 / 副标题，小字灰色，不需要就留空 */
    latin: 'Nebula',
    /** 显示在姓名和英文名中间的那句话（也可当作个性签名） */
    motto: '细水长流',
    /** 额外的一句话签名，会显示在最下面；留空就不显示 */
    bio: '',
    /** 坐标 / 状态，留空则不显示 */
    location: 'Shenzhen, CN',
  },

  /**
   * 顶部导航（顶栏那一行）
   * 想增删改顺序就动这个数组。
   */
  nav: [
    { label: 'Posts', href: '/blog' },
    { label: 'Categories', href: '/categories' },
    { label: 'Tags', href: '/tags' },
    { label: 'Archive', href: '/archive' },
    { label: 'Friends', href: '/friends' },
    { label: 'About Me', href: '/about' },
  ],

  /** 社交链接（显示在边栏头像下方的小圆钮），不需要的删掉 */
  social: [
    { label: 'GitHub', href: 'https://github.com/Nebula-zhuang', icon: 'github' },
    { label: '邮箱', href: 'mailto:328600420@qq.com', icon: 'mail' },
    { label: 'RSS', href: '/rss.xml', icon: 'rss' },
  ],

  /** 入场加载页 */
  splash: {
    variant: 'video' as SplashVariant,

    /* ---- video 模式 ---- */
    /** 视频文件：放在 public/ 下，换视频就换这里 */
    video: '/splash.mp4',
    /** 视频是否循环播放 */
    videoLoop: true,
    /**
     * 视频铺法：
     * - 'cover'  铺满整屏当背景板（默认，会裁掉多余部分）
     * - 'contain' 整屏显示，完整不裁切，但四周可能有留白
     * - 'card'   居中的圆角卡片
     */
    videoFit: 'cover' as 'cover' | 'contain' | 'card',
    /** card 模式的宽度占视口比例（0~1），其他模式忽略 */
    videoScale: 0.82,
    /** 压在视频上的文字遮罩强度 0~1：0 完全不遮，0.5 明显压暗 */
    videoOverlay: 0.3,

    /* ---- 文案（各模式通用） ---- */
    /**
     * 流式输出（SSE 那种一个字一个字蹦出来的感觉）的文案。
     * 想改内容就改这里；想改速度看下面的 streamSpeed。
     */
    streamText: '流云的小窝',
    /** 每个字之间的间隔（毫秒），越小越快 */
    streamSpeed: 150,
    /** 打完之后是否保留一个闪烁光标 */
    streamCursor: true,
    /** 流式文案下面的小字，留空不显示 */
    sub: '欢迎光临~',
    /** 进入主页的文字提示 */
    enterText: '下拉进入主页',
  },

  /**
   * Giscus 评论（基于 GitHub Discussions，免费、不需要服务器）
   *
   * 你现在只需要填 3 个值，评论就活了。它们必须来自【你自己新建的一个公开仓库】——
   * 我无法替你建仓库，但填法已经写好，照着做 2 分钟：
   *
   * 1. GitHub 上新建公开仓库，名字建议 blog-comments（专门放评论，和博客代码分开）
   * 2. 进入那个仓库：Settings → General → Features → 勾上 Discussions
   *    然后点 Discussions 标签 → New category → 名字写 General → 类型选 Announcements → 创建
   * 3. 打开 https://giscus.app/zh-CN ，"仓库" 填 你的用户名/blog-comments
   *    页面下方会生成一段代码，把这三个值复制过来：
   *      data-repo           → 下面 repo
   *      data-repo-id        → 下面 repoId
   *      data-category-id    → 下面 categoryId
   *
   * 三个值填完保存，评论框立刻出现。留空时文章页只显示一段提示，不会报错。
   */
  giscus: {
    /** 例如 'Nebula-zhuang/blog-comments' */
    repo: '',
    /** 例如 'R_kgDOMxxxxxxx' */
    repoId: '',
    /** 分类名，和你第 2 步创建的保持一致即可 */
    category: 'General',
    /** 例如 'DIC_kwDOMxxxxxxx' */
    categoryId: '',
    mapping: 'pathname',
    reactionsEnabled: '1',
    inputPosition: 'top',
    lang: 'zh-CN',
  },

  /** 首页显示几篇文章 */
  pageSize: 6,

  /** 背景外观 */
  background: {
    preset: 'none' as BackgroundPreset,
    opacity: 0.85,
    blur: 24,
    speed: 26,
    customColors: [
      'rgba(37, 99, 235, 0.10)',
      'rgba(15, 118, 110, 0.08)',
      'rgba(120, 113, 198, 0.08)',
    ],
    gridColor: 'rgba(15, 23, 42, 0.035)',
  },
};

export type Site = typeof site;
