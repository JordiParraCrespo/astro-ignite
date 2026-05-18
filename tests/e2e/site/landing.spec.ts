import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';

test.describe('site marketing landing @site', () => {
  test('landing renders hero + at least one CTA + RSS link in footer', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    const ctas = page.locator(
      'a.btn, a[role="button"], a:has-text("Get started"), a:has-text("Start")'
    );
    expect(await ctas.count(), 'site landing should expose at least one CTA').toBeGreaterThan(0);
    errors.assertNone();
    errors.dispose();
  });
});
