/**
 * Email transport mock.
 *
 * Approach: Playwright `page.route` intercepts outbound HTTP requests to
 * the Resend API. The starter's Astro Action handler runs server-side, so
 * blocking `api.resend.com` requires intercepting at the server boundary
 * — Playwright routes outbound traffic the browser makes, not the dev
 * server's. For the contact form scenario we therefore set `MOCK_EMAIL=1`
 * via the webServer's env so the starter's `sendContactEmail` no-ops in
 * a deterministic way, AND we still install a browser-side route that
 * blocks any unexpected egress to `api.resend.com` (belt-and-braces).
 *
 * The implementer picked the env-var approach because Playwright cannot
 * intercept fetches initiated by Astro Actions on the dev server.
 */

import type { Page } from '@playwright/test';

export const MOCK_EMAIL_ENV: Record<string, string> = {
  MOCK_EMAIL: '1',
  SITE_E2E: '1',
};

export type EmailBlocker = { hits: () => number };

export async function blockResend(page: Page): Promise<EmailBlocker> {
  let count = 0;
  await page.route('**/api.resend.com/**', (route) => {
    count++;
    return route.abort();
  });
  return { hits: () => count };
}
