import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';
import { trackAnalyticsHits } from '../shared/consent';

test.describe('playground smoke @playground', () => {
  test('homepage renders with no console errors and no outbound analytics', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    const tracker = await trackAnalyticsHits(page);
    const resp = await page.goto('/');
    expect(resp?.status()).toBeLessThan(400);
    await expect(page.locator('h1').first()).toBeVisible();
    expect(tracker.hits(), 'analytics should not fire during smoke').toBe(0);
    errors.assertNone();
    errors.dispose();
  });

  test('unknown route returns 404 with rendered 404.astro', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    const resp = await page.goto('/this-route-does-not-exist');
    expect(resp?.status()).toBe(404);
    await expect(page.locator('h1').first()).toBeVisible();
    errors.assertNone();
    errors.dispose();
  });
});
