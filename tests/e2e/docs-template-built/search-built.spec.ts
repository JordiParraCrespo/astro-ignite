import { test, expect } from '@playwright/test';

test.describe('docs search built @docs-built', () => {
  test('typing "introduction" in the search dialog returns at least one result', async ({ page }) => {
    await page.goto('/');

    const trigger = page.locator('[data-search-trigger], button:has-text("Search"), button[aria-label*="Search" i]').first();
    const dialog = page.locator('dialog[data-search], dialog[aria-label*="Search" i], dialog#search-dialog').first();

    if (await trigger.count()) {
      await trigger.click();
    } else {
      await page.keyboard.press('ControlOrMeta+K');
    }
    await expect(dialog).toBeVisible();

    const input = dialog.locator('input[type="search"], input[type="text"]').first();
    await input.fill('introduction');

    const result = dialog.locator('a[href], [role="option"]').first();
    await expect(result).toBeVisible({ timeout: 10_000 });

    await result.click();
    await expect(page).toHaveURL(/introduction/i);
  });
});
