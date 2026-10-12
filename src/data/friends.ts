/**
 * 友情链接数据
 *
 * 加一条友链就在下面数组里追加一项，格式：
 *   {
 *     name: '站点名',            // 必填
 *     url: 'https://...',        // 必填
 *     desc: '一句话介绍',         // 可选，显示在 /friends 页
 *     initial: '字',             // 可选，头像里显示的字（默认取名字第一个字）
 *     color: '#2563eb',          // 可选，头像底色
 *     avatar: 'https://...',     // 可选，有头像图就填这个，优先于 initial
 *   }
 *
 * 侧边栏显示前 5 个，/friends 页显示全部。
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
  {
    name: '深圳大学',
    url: 'https://www.szu.edu.cn',
    desc: '深圳大学官方网站 —— 自立、自律、自强。',
    initial: '深',
    color: '#005bac',
  },
];
