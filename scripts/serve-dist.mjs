/**
 * 零依赖静态预览服务（应急/受限环境用）。
 * 平时请用 `pnpm dev`（带热更新）；这个脚本只服务 `dist/` 里的构建产物，
 * 用于在没有热更新、或无法启动 Astro 开发服的环境下查看最终效果。
 *
 * 用法：node scripts/serve-dist.mjs [端口]
 *
 * 关于子路径：Astro 的 dist/ 永远是"站点根"，子路径由托管方挂载。
 * 所以构建时如果设了 BASE_PATH（GitHub Pages 项目仓库就是这种），
 * 这里就把 dist/ 挂在同样的前缀下，模拟线上的真实地址：
 *   BASE_PATH=/my-blog node scripts/serve-dist.mjs
 *   → http://127.0.0.1:4321/my-blog/
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readdir } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist', import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 4321);

/** 前缀来源：显式 BASE_PATH 优先，其次从目录结构推断 */
async function detectBase() {
  if (process.env.BASE_PATH) {
    const raw = process.env.BASE_PATH.trim().replace(/^\/+|\/+$/g, '');
    return raw ? `/${raw}` : '';
  }
  try {
    const entries = await readdir(root, { withFileTypes: true });
    const hasIndex = entries.some((e) => e.isFile() && e.name === 'index.html');
    if (hasIndex) return '';
    const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('_'));
    if (dirs.length === 1) return `/${dirs[0].name}`;
  } catch {
    /* ignore */
  }
  return '';
}

const basePrefix = await detectBase();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.pf_fragment': 'application/octet-stream',
};

/** 防止 ../ 越权读取 */
function resolveSafe(pathname) {
  const decoded = decodeURIComponent(pathname.split('?')[0]);
  const target = normalize(join(root, decoded));
  if (!target.startsWith(root + sep) && target !== root) return null;
  return target;
}

async function resolveFile(pathname) {
  const base = resolveSafe(pathname);
  if (!base) return { status: 403 };

  const candidates = [];
  if (pathname.endsWith('/')) {
    candidates.push(join(base, 'index.html'));
  } else if (extname(base)) {
    candidates.push(base);
  } else {
    candidates.push(join(base, 'index.html'), `${base}.html`);
  }

  for (const file of candidates) {
    try {
      const info = await stat(file);
      if (info.isFile()) return { status: 200, file };
    } catch {
      /* 继续尝试下一个候选 */
    }
  }

  // 404：优先用站点自己的 404 页面
  const fallback = join(root, '404.html');
  try {
    const info = await stat(fallback);
    if (info.isFile()) return { status: 404, file: fallback };
  } catch {
    /* 没有 404.html */
  }
  return { status: 404 };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`);
  let pathname = url.pathname;

  // 子路径部署：请求 /my-blog/xxx → 真实文件 dist/xxx
  if (basePrefix) {
    if (pathname === basePrefix) {
      res.writeHead(302, { location: `${basePrefix}/` });
      res.end();
      return;
    }
    if (!pathname.startsWith(`${basePrefix}/`)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found（本站部署在 ${basePrefix}/ 下）`);
      return;
    }
    pathname = pathname.slice(basePrefix.length) || '/';
  }

  const result = await resolveFile(pathname);

  if (result.status === 403 || !result.file) {
    res.writeHead(result.status, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(result.status === 403 ? '403 Forbidden' : '404 Not Found');
    return;
  }

  try {
    const type = MIME[extname(result.file).toLowerCase()] ?? 'application/octet-stream';
    const info = await stat(result.file);
    const total = info.size;

    // Range 请求：视频/音频能否流式播放与拖动进度条都依赖它
    const range = req.headers.range;
    const match = range?.match(/^bytes=(\d*)-(\d*)$/);

    if (match) {
      let start = match[1] ? Number(match[1]) : 0;
      let end = match[2] ? Number(match[2]) : total - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= total) {
        res.writeHead(416, { 'content-range': `bytes */${total}` });
        res.end();
        return;
      }

      end = Math.min(end, total - 1);
      const chunk = createReadStream(result.file, { start, end });
      res.writeHead(206, {
        'content-type': type,
        'content-length': end - start + 1,
        'content-range': `bytes ${start}-${end}/${total}`,
        'accept-ranges': 'bytes',
        'cache-control': 'no-store',
      });
      chunk.pipe(res);
      return;
    }

    res.writeHead(result.status, {
      'content-type': type,
      'content-length': total,
      'accept-ranges': 'bytes',
      // 预览时禁用缓存，改完构建刷新即可看到最新内容
      'cache-control': 'no-store',
    });
    createReadStream(result.file).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`500 ${error instanceof Error ? error.message : 'read error'}`);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(
    `[preview] http://127.0.0.1:${port}${basePrefix}/  (root: ${root}${basePrefix ? `, base: ${basePrefix}` : ''})`
  );
});

server.on('error', (error) => {
  console.error(`[preview] 启动失败：${error.message}`);
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${port} 已被占用，换一个：node scripts/serve-dist.mjs 4400`);
  }
  process.exitCode = 1;
});
