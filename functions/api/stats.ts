/**
 * Cloudflare Pages Functions：点赞 / 阅读量 / 在线人数
 *
 * 路由：
 *   GET  /api/stats?path=/posts/hello/            → { views, likes, online }
 *   POST /api/stats  body: { path, action: 'like' | 'unlike' | 'view' }
 *
 * 存储：KV 命名空间，绑定名必须是 BLOG_KV。
 * 未绑定 KV 时接口会返回 503 并给出提示，前端自动降级为本地模拟，不会报错白屏。
 *
 * 部署步骤见 README「动态功能上线」一节。
 */

interface Env {
  BLOG_KV?: KVNamespace;
}

type Action = 'like' | 'unlike' | 'view';

const ONLINE_WINDOW = 60; // 秒，多久内活跃算"在线"
const RATE_WINDOW = 10; // 秒，同一访客对同一路径的最小写入间隔

/** 简易稳定哈希：用 IP + UA 生成访客指纹，避免依赖第三方库 */
async function visitorHash(request: Request): Promise<string> {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  const data = new TextEncoder().encode(`${ip}|${ua}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** 只允许站内相对路径，防止被人拿来刷 KV 键 */
function normalizePath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let p = raw.trim();
  try {
    if (p.startsWith('http')) p = new URL(p).pathname;
  } catch {
    return null;
  }
  if (!p.startsWith('/')) return null;
  p = p.split('?')[0].split('#')[0];
  if (p.length > 180) return null;
  if (!/^[A-Za-z0-9\-._~/]*$/.test(p)) return null;
  return p.endsWith('/') || p.includes('.') ? p : `${p}/`;
}

const num = async (kv: KVNamespace, key: string): Promise<number> => {
  const v = await kv.get(key);
  return v ? Number(v) || 0 : 0;
};

async function countOnline(kv: KVNamespace): Promise<number> {
  const list = await kv.list({ prefix: 'online:' });
  return list.keys.length;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const path = normalizePath(url.searchParams.get('path'));
  if (!path) return json({ error: 'invalid path' }, 400);
  if (!env.BLOG_KV) return json({ error: 'kv_not_bound' }, 503);

  const [views, likes, online] = await Promise.all([
    num(env.BLOG_KV, `views:${path}`),
    num(env.BLOG_KV, `likes:${path}`),
    countOnline(env.BLOG_KV),
  ]);

  return json({ path, views, likes, online });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.BLOG_KV) return json({ error: 'kv_not_bound' }, 503);

  let payload: { path?: string; action?: Action };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const path = normalizePath(payload.path);
  const action = payload.action;
  if (!path || !action || !['like', 'unlike', 'view'].includes(action)) {
    return json({ error: 'invalid payload' }, 400);
  }

  const hash = await visitorHash(request);
  const now = Math.floor(Date.now() / 1000);
  const kv = env.BLOG_KV;

  // 记录在线状态（KV 的 expirationTtl 最小 60 秒）
  await kv.put(`online:${hash}`, String(now), { expirationTtl: 120 });

  const likeKey = `like:${path}:${hash}`;
  const rateKey = `rate:${hash}:${path}`;

  let liked = (await kv.get(likeKey)) !== null;
  let delta = 0;

  if (action === 'view') {
    // 同一访客 10 秒内重复上报只算一次，挡掉刷新狂刷
    const last = await kv.get(rateKey);
    if (!last) {
      await kv.put(rateKey, String(now), { expirationTtl: RATE_WINDOW });
      delta = 1;
    }
  } else if (action === 'like') {
    if (!liked) {
      await kv.put(likeKey, '1');
      liked = true;
      delta = 1;
    }
  } else if (action === 'unlike') {
    if (liked) {
      await kv.delete(likeKey);
      liked = false;
      delta = -1;
    }
  }

  const current = await num(kv, `likes:${path}`);
  const likes = Math.max(0, current + delta);
  if (delta !== 0) await kv.put(`likes:${path}`, String(likes));

  let views = await num(kv, `views:${path}`);
  if (action === 'view' && delta === 1) {
    views += 1;
    await kv.put(`views:${path}`, String(views));
  }

  return json({
    path,
    views,
    likes,
    liked,
    online: await countOnline(kv),
  });
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
