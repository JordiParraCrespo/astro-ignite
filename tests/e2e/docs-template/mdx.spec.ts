import { test, expect } from '@playwright/test';
import { captureConsoleErrors } from '../shared/console';

test.describe('docs MDX rendering @docs', () => {
  test('introduction renders prose, headings, and at least one rich block', async ({ page }) => {
    const errors = captureConsoleErrors(page);
    const resp = await page.goto('/introduction');
    test.skip(!resp || resp.status() >= 400, '/introduction not available on this target');

    await expect(page.locator('h1').first()).toBeVisible();
    // Expect at least one paragraph of rendered prose
    const paragraphs = page.locator('main p');
    expect(await paragraphs.count(), 'introduction MDX should produce paragraphs').toBeGreaterThan(
      0
    );

    // Look for rich content — code block or callout / aside / blockquote
    const richBlocks = page.locator('main pre, main aside, main blockquote, main [role="note"]');
    expect(
      await richBlocks.count(),
      'page should render at least one code block / callout'
    ).toBeGreaterThan(0);

    errors.assertNone();
    errors.dispose();
  });
});
