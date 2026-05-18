import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';

test.describe('docs-app landing @docs-app', () => {
  test('landing exposes a heading and the sidebar exists', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    const sidebar = page.locator('nav.sidebar, [data-sidebar], aside nav');
    expect(await sidebar.count(), 'docs-app should render a sidebar').toBeGreaterThan(0);
    errors.assertNone();
    errors.dispose();
  });
});
