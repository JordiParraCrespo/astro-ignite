/**
 * Email transport mock.
 *
 * Two surfaces are stubbed:
 *
 * 1. The Astro Actions endpoint (`/_actions/**`) — Playwright `page.route`
 *    intercepts the POST initiated by the contact form, returns a
 *    synthetic 200 with a success payload. The dev server never sees the
 *    request, so neither does Resend.
 *
 * 2. Outbound traffic to `api.resend.com` — intercepted at the browser
 *    network layer as belt-and-braces. The browser never calls Resend
 *    directly today (Astro Actions run server-side), but a future change
 *    that posts to Resend from a client fetch would also be caught.
 *
 * This is the "pure Playwright `page.route` interception" branch listed
 * in `openspec/changes/add-e2e-testing-to-all-templates-and-app/design.md
 * > Templates require zero behaviour change`. No template file is
 * modified — the contract is wholly observed at the browser network
 * boundary.
 */

import type { Page } from '@playwright/test';

export const MOCK_EMAIL_ENV: Record<string, string> = {
  SITE_E2E: '1',
};

export type EmailBlocker = {
  hits: () => number;
  actionHits: () => number;
};

export async function blockResend(page: Page): Promise<EmailBlocker> {
  let resendHits = 0;
  let actionHits = 0;

  await page.route('**/api.resend.com/**', (route) => {
    resendHits++;
    return route.abort();
  });

  await page.route('**/_actions/**', async (route) => {
    if (route.request().method() === 'POST') {
      actionHits++;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { ok: true } }),
      });
    }
    return route.continue();
  });

  return {
    hits: () => resendHits,
    actionHits: () => actionHits,
  };
}
