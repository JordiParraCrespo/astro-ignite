import { test, expect } from '@playwright/test';
import { blockResend } from '../shared/email';
import { captureConsoleErrors } from '../shared/console';

test.describe('contact form @starter', () => {
  test('submitting the contact form shows the success state without hitting api.resend.com', async ({
    page,
  }) => {
    const errors = captureConsoleErrors(page);
    const resend = await blockResend(page);

    const resp = await page.goto('/contact');
    test.skip(!resp || resp.status() >= 400, 'starter /contact not available on this target');

    const form = page.locator('form').first();
    await form.locator('input[name="name"]').fill('E2E Test User');
    await form.locator('input[name="email"]').fill('e2e@example.com');
    await form.locator('textarea[name="message"]').fill('Hello from Playwright');

    // Astro Actions form submission posts to the action endpoint, gets a 303
    // with a result cookie, then the browser redirects back to /contact and the
    // server re-renders with Astro.getActionResult() populated. Wait for the
    // network to settle so the second render has actually landed before we
    // assert on the success element.
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 15_000 }),
      form.locator('button[type="submit"]').click(),
    ]);

    const success = page
      .locator('[data-success], [role="status"], :text("Thanks"), :text("Gracias")')
      .first();
    await expect(success, 'success state should render after submit').toBeVisible({
      timeout: 15_000,
    });

    expect(resend.hits(), 'api.resend.com must not be contacted').toBe(0);
    expect(
      resend.actionHits(),
      'the contact Astro Action must have been called once'
    ).toBeGreaterThanOrEqual(1);
    errors.assertNone();
    errors.dispose();
  });
});
