import type { BrowserContext, Page } from '@playwright/test';

export const ANALYTICS_HOSTS: RegExp[] = [
  /plausible\.io/i,
  /umami\./i,
  /fathom/i,
  /google-analytics/i,
];

export async function clearConsent(context: BrowserContext): Promise<void> {
  // One-shot: clear on the very FIRST navigation only, then leave whatever
  // the test sets afterwards alone. addInitScript runs on every navigation,
  // so without this guard a post-accept reload would erase the consent value
  // and the banner would reappear, breaking the "accept persists" assertions.
  await context.addInitScript(() => {
    try {
      if (window.sessionStorage.getItem('__e2e_consent_cleared') === '1') return;
      window.localStorage.removeItem('cookie-consent');
      window.sessionStorage.setItem('__e2e_consent_cleared', '1');
    } catch {}
  });
}

export async function readConsent(page: Page): Promise<string | null> {
  return page.evaluate(() => window.localStorage.getItem('cookie-consent'));
}

export async function acceptConsent(page: Page): Promise<void> {
  const banner = page.locator('#cookie-banner');
  await banner.waitFor({ state: 'visible' });
  const acceptBtn = banner
    .locator('button[data-consent="accept"], button:has-text("Accept"), button:has-text("Aceptar")')
    .first();
  await acceptBtn.click();
}

export async function declineConsent(page: Page): Promise<void> {
  const banner = page.locator('#cookie-banner');
  await banner.waitFor({ state: 'visible' });
  const declineBtn = banner
    .locator(
      'button[data-consent="decline"], button:has-text("Decline"), button:has-text("Rechazar")'
    )
    .first();
  await declineBtn.click();
}

export type AnalyticsTracker = {
  hits: () => number;
  reset: () => void;
};

export async function trackAnalyticsHits(
  page: Page,
  hostPattern: string | RegExp = /plausible\.io/i
): Promise<AnalyticsTracker> {
  let count = 0;
  const matcher = typeof hostPattern === 'string' ? new RegExp(hostPattern, 'i') : hostPattern;
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (matcher.test(url)) {
      count++;
      return route.abort();
    }
    return route.continue();
  });
  return {
    hits: () => count,
    reset: () => {
      count = 0;
    },
  };
}
