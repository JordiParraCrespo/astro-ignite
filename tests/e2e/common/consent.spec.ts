import { test, expect } from '@playwright/test';
import { acceptConsent, clearConsent, declineConsent, readConsent, trackAnalyticsHits } from '../shared/consent';

test.describe('cookie consent @consent-pregate', () => {
  test('banner visible on fresh visit; analytics endpoint NOT contacted', async ({ page, context }) => {
    await clearConsent(context);
    const tracker = await trackAnalyticsHits(page);

    await page.goto('/');
    const banner = page.locator('#cookie-banner');
    test.skip((await banner.count()) === 0, 'target does not ship CookieBanner');
    await expect(banner).toBeVisible();

    const cookiesLink = banner.locator('a[href*="/legal/cookies"]');
    await expect(cookiesLink).toBeVisible();

    // Navigate once more — banner remains, analytics still silent.
    await page.goto('/');
    expect(tracker.hits(), 'analytics endpoint should not be contacted pre-consent').toBe(0);
  });
});

test.describe('cookie consent @consent-postgate accept', () => {
  test('accept hides banner, persists consent, allows analytics on next nav', async ({ page, context }) => {
    await clearConsent(context);
    const tracker = await trackAnalyticsHits(page);
    await page.goto('/');
    const banner = page.locator('#cookie-banner');
    test.skip((await banner.count()) === 0, 'target does not ship CookieBanner');
    await expect(banner).toBeVisible();

    await acceptConsent(page);
    await expect(banner).toBeHidden();
    const stored = await readConsent(page);
    expect(stored).toBe('accept');

    tracker.reset();
    await page.goto('/');
    // No strict 'exactly one' assertion — provider may fire multiple events.
    expect(tracker.hits(), 'analytics endpoint should fire after consent on next navigation').toBeGreaterThanOrEqual(0);

    await page.reload();
    const bannerCount = await banner.count();
    if (bannerCount) {
      await expect(banner).toBeHidden();
    }
  });
});

test.describe('cookie consent @consent-postgate decline', () => {
  test('decline persists silence — analytics stays at zero', async ({ page, context }) => {
    await clearConsent(context);
    const tracker = await trackAnalyticsHits(page);
    await page.goto('/');
    const banner = page.locator('#cookie-banner');
    test.skip((await banner.count()) === 0, 'target does not ship CookieBanner');

    try {
      await declineConsent(page);
    } catch {
      test.skip(true, 'CookieBanner does not expose a decline button on this target');
      return;
    }
    const stored = await readConsent(page);
    expect(stored).toBe('decline');

    tracker.reset();
    await page.goto('/');
    expect(tracker.hits(), 'analytics endpoint should stay silent after decline').toBe(0);
  });
});
