import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';

test.describe('404 page @nav', () => {
  test('unknown route returns 404 and renders the template 404.astro', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    const resp = await page.goto('/this-route-does-not-exist');
    expect(resp?.status(), '404 status code expected for unknown route').toBe(404);
    await expect(page.locator('h1').first()).toBeVisible();
    errors.assertNone();
    errors.dispose();
  });
});
