import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';
import { trackAnalyticsHits } from '../shared/consent';

test.describe('homepage @nav', () => {
  test('renders / with 200, non-empty title, no console errors', async ({ page, context }) => {
    await context.addInitScript(() => {
      try { window.localStorage.removeItem('cookie-consent'); } catch {}
    });
    const tracker = await trackAnalyticsHits(page);
    const errors = captureConsoleErrors(page);
    const resp = await page.goto('/');
    expect(resp?.status(), 'home returned non-200').toBeLessThan(400);
    const title = await page.title();
    expect(title.length, '<title> should be non-empty').toBeGreaterThan(0);
    await expect(page.locator('h1').first()).toBeVisible();
    errors.assertNone();
    // Analytics endpoint MUST NOT fire before consent
    expect(tracker.hits(), 'analytics fired before consent').toBe(0);
    errors.dispose();
  });
});
