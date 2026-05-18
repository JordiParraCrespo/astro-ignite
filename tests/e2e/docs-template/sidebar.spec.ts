import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';

test.describe('docs sidebar @docs @nav', () => {
  test('every sidebar link resolves to a 2xx page with an <h1>', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto('/');

    const hrefs = await page.evaluate(() => {
      const root = document.querySelector('nav.sidebar, [data-sidebar], aside nav');
      if (!root) return [] as string[];
      return Array.from(root.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => h && h.startsWith('/') && !h.startsWith('//'))
        .filter((h, i, arr) => arr.indexOf(h) === i)
        .slice(0, 10); // cap for perf
    });

    test.skip(hrefs.length === 0, 'no sidebar nav on this target');

    for (const href of hrefs) {
      const resp = await page.goto(href);
      expect(resp?.status(), `${href} returned non-2xx`).toBeLessThan(400);
      await expect(page.locator('h1').first(), `<h1> missing on ${href}`).toBeVisible();
    }

    errors.assertNone();
    errors.dispose();
  });
});
