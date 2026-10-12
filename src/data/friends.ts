/**
 * 友情链接数据
 *
 * 现在这个数组是空的，所以侧边栏和 /friends 页面都不会出现友链内容。
 * 想加友链时，在下面数组里追加一项即可（格式见注释）。
 */
export interface Friend {
  name: string;
  url: string;
  desc?: string;
  avatar?: string;
  initial?: string;
  color?: string;
}

export const friends: Friend[] = [
  // 示例（改成真实友链即可）：
  // {
  //   name: '某某的博客',
  //   url: 'https://example.com',
  //   desc: '一句话介绍',
  //   initial: '某',
  //   color: '#2563eb',
  // },
];