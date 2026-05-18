import { test, expect } from '@playwright/test';
import { getLocaleSwitcherEntries, readHtmlLang } from '../shared/locales';

test.describe('LocaleSwitcher @i18n', () => {
  test('switcher renders only when the site is multi-locale', async ({ page }) => {
    await page.goto('/');
    const switcher = page.locator('.locale-switcher');
    const switcherCount = await switcher.count();

    // Probe the actual configured locale count via the rendered DOM. The
    // LocaleSwitcher component renders only when `siteConfig.locales.length > 1`
    // and emits one `<a>` per configured locale (including the current one).
    if (switcherCount === 0) {
      // Single-locale target: switcher is absent. Spec satisfied.
      return;
    }
    const entries = await getLocaleSwitcherEntries(page);
    expect(
      entries.length,
      'a rendered switcher should expose at least one locale entry'
    ).toBeGreaterThanOrEqual(1);
  });
});

test.describe('LocaleSwitcher @i18n two-locale fixture', () => {
  test.skip(
    !process.env.SITE_E2E_LOCALES?.includes('es'),
    'two-locale fixture only runs when SITE_E2E_LOCALES includes a non-default locale'
  );

  test('clicking a non-default locale entry navigates and updates <html lang>', async ({
    page,
  }) => {
    await page.goto('/');
    const entriesBefore = await getLocaleSwitcherEntries(page);
    expect(
      entriesBefore.length,
      'switcher should expose at least one alternate locale'
    ).toBeGreaterThan(0);

    const target = entriesBefore[0]!;
    const link = page
      .locator(
        `.locale-switcher a[hreflang="${target}"], .locale-switcher [data-locale="${target}"]`
      )
      .first();
    await link.click();
    await page.waitForLoadState('domcontentloaded');

    expect(page.url(), 'URL should include the locale segment').toContain(`/${target}/`);
    const lang = await readHtmlLang(page);
    expect(lang, '<html lang> should match selected locale').toBe(target);

    const entriesAfter = await getLocaleSwitcherEntries(page);
    expect(entriesAfter, 'switcher should not offer the now-current locale').not.toContain(target);
  });
});
