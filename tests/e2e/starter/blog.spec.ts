import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';

test.describe('starter blog @starter', () => {
  test('home → /blog → first post renders an <article> + BlogPosting JSON-LD', async ({ page }) => {
    const errors = captureConsoleErrors(page);

    await page.goto('/');
    const blogLink = page.locator('header a[href$="/blog" i], header a[href*="/blog/" i]').first();
    test.skip((await blogLink.count()) === 0, 'no blog link in header');
    await blogLink.click();

    await expect(page).toHaveURL(/\/blog\/?$/);

    const postLink = page.locator('a[href^="/blog/"]:not([href$="/blog/"])').first();
    await expect(postLink).toBeVisible();
    await postLink.click();

    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.locator('article').first()).toBeVisible();

    const hasBlogPosting = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      for (const s of scripts) {
        try {
          const json = JSON.parse(s.textContent ?? '{}');
          const graph = Array.isArray(json) ? json : (json['@graph'] ?? [json]);
          if (Array.isArray(graph) && graph.some((n: { '@type'?: string | string[] }) => {
            const t = n['@type'];
            return t === 'BlogPosting' || (Array.isArray(t) && t.includes('BlogPosting'));
          })) {
            return true;
          }
        } catch {}
      }
      return false;
    });
    expect(hasBlogPosting, 'BlogPosting JSON-LD node should be present').toBeTruthy();

    errors.assertNone();
    errors.dispose();
  });
});
