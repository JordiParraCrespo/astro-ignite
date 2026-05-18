import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';

test.describe('header nav @nav', () => {
  test('every internal header link navigates to a 2xx page with an <h1>', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto('/');

    const hrefs = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return [] as string[];
      return Array.from(header.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => h && (h.startsWith('/') || h.startsWith(location.origin)))
        .filter((h) => !h.startsWith('//') && !h.startsWith('mailto:') && !h.startsWith('tel:'))
        .filter((h, i, arr) => arr.indexOf(h) === i);
    });

    expect(hrefs.length, 'header should have at least one internal link').toBeGreaterThan(0);

    for (const href of hrefs) {
      const resp = await page.goto(href);
      expect(resp?.status(), `${href} returned non-2xx`).toBeLessThan(400);
      await expect(page.locator('h1').first(), `<h1> missing on ${href}`).toBeVisible();
    }

    errors.assertNone();
    errors.dispose();
  });
});

test.describe('footer legal links @nav', () => {
  test('legal links navigate to /legal/<slug> with rendered <h1>', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    await page.goto('/');

    const hrefs = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return [] as string[];
      return Array.from(footer.querySelectorAll('a[href*="/legal/"]'))
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => h)
        .filter((h, i, arr) => arr.indexOf(h) === i);
    });

    test.skip(hrefs.length === 0, 'footer has no legal links on this target');

    for (const href of hrefs) {
      const resp = await page.goto(href);
      expect(resp?.status(), `${href} returned non-2xx`).toBeLessThan(400);
      await expect(page.locator('h1').first()).toBeVisible();
      const hasGraph = await page.evaluate(() => {
        const ld = document.querySelector('script[type="application/ld+json"]');
        if (!ld) return false;
        try {
          const json = JSON.parse(ld.textContent ?? '{}');
          return '@graph' in json || Array.isArray(json);
        } catch {
          return false;
        }
      });
      expect(hasGraph, `JSON-LD @graph missing on ${href}`).toBeTruthy();
    }

    errors.assertNone();
    errors.dispose();
  });
});
