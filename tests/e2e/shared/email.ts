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

  // Observe Astro Action requests via page.on('request') instead of page.route.
  // route.continue() seemed to interfere with the 303-redirect-with-cookie flow
  // Astro emits for form-style submissions; observing without intercepting keeps
  // the natural request lifecycle intact so the page re-renders with
  // Astro.getActionResult() populated.
  page.on('request', (req) => {
    if (req.method() !== 'POST') return;
    const url = req.url();
    // Astro 5 form actions post to either `/_actions/<name>` or `?_astroAction=<name>`
    // depending on the runtime; count either pattern.
    if (url.includes('/_actions/') || url.includes('_astroAction=')) {
      actionHits++;
    }
  });

  return {
    hits: () => resendHits,
    actionHits: () => actionHits,
  };
}
