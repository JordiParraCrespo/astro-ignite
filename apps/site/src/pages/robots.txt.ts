import type { APIRoute } from 'astro';

import { siteConfig } from '@/config/site';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL(siteConfig.url)).origin;
  const body = `User-agent: *
Allow: /

# Block API routes + dynamic OG endpoints (when added)
Disallow: /api/
Disallow: /og/

Sitemap: ${origin}/sitemap-index.xml
`;
  return new Response(body, { headers: { 'content-type': 'text/plain' } });
};
