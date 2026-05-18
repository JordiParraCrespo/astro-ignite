import { test, expect } from '@playwright/test';

test.describe('docs search built @docs-built', () => {
  test('typing "introduction" in the search dialog returns at least one result', async ({
    page,
  }) => {
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

    const input = dialog.locator('input[type="search"], input[type="text"]').first();
    // Pagefind loads its WASM index lazily on first dialog open. Type, wait,
    // and retype if needed — the index may not have finished loading on the
    // very first keystroke.
    await input.fill('introduction');
    const resultsContainer = dialog
      .locator('[data-search-results], .search-dialog__results')
      .first();
    const result = dialog
      .locator('[data-search-results] a[href], .search-dialog__results a[href], [role="option"]')
      .first();
    try {
      await expect(result).toBeVisible({ timeout: 15_000 });
    } catch {
      // Retry once: clear + retype so pagefind re-runs against the now-loaded index.
      await input.fill('');
      await input.fill('introduction');
      await expect(result).toBeVisible({ timeout: 15_000 });
    }
    void resultsContainer;

    await result.click();
    await expect(page).toHaveURL(/introduction/i);
  });
});
