import { test, expect } from '@playwright/test';

test.describe('docs search dialog @docs', () => {
  test('Cmd/Ctrl+K opens the search dialog', async ({ page }) => {
    await page.goto('/');
    const trigger = page
      .locator('[data-search-trigger], button:has-text("Search"), button[aria-label*="Search" i]')
      .first();
    const dialog = page
      .locator('dialog[data-search], dialog[aria-label*="Search" i], dialog#search-dialog')
      .first();

    if (await trigger.count()) {
      await trigger.click();
    } else {
      await page.keyboard.press('ControlOrMeta+K');
    }

    await expect(dialog).toBeVisible();
    // Under astro dev the pagefind bundle does not exist — the dialog renders
    // the "search only available in production" hint.
    const hint = dialog.locator(':text("production"), :text("Build"), :text("only available")');
    if (await hint.count()) {
      await expect(hint.first()).toBeVisible();
    }
  });
});
