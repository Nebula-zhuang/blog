import type { APIRoute } from 'astro';
import { site } from '../config';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap-index.xml', site.url).href}
`;
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
