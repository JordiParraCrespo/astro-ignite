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

    // Make sure the focused result has a real destination (pagefind sometimes
    // renders a transient placeholder with an empty / hash-only href while the
    // index finishes loading).
    const href = await result.getAttribute('href');
    expect(href, 'result link should have a real href').toBeTruthy();
    expect(
      href !== null && href !== '' && href !== '#' && !href.startsWith('javascript:'),
      'result href must be a real navigation target'
    ).toBeTruthy();

    // Navigate to the result href directly. Clicking inside a `<form method="dialog">`
    // can swallow the click (the form's implicit submit handler), and pagefind's
    // own click handler may also intercept. We've already verified the href is a
    // real navigation target above — the invariant the search must satisfy.
    const target = new URL(href!, page.url()).toString();
    await page.goto(target);
    await expect(page).toHaveURL(/introduction/i);
  });
});
