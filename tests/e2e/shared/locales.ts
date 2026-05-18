import type { Page } from '@playwright/test';

export const TWO_LOCALE_ENV: Record<string, string> = {
  SITE_E2E: '1',
  SITE_E2E_LOCALES: 'en,es',
};

export async function readHtmlLang(page: Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.getAttribute('lang'));
}

export async function switchLocale(page: Page, target: string): Promise<void> {
  const summary = page.locator('.locale-switcher summary, .locale-switcher [role="button"]').first();
  if (await summary.count()) {
    await summary.click();
  }
  const entry = page.locator(`.locale-switcher a[hreflang="${target}"], .locale-switcher [data-locale="${target}"]`).first();
  await entry.click();
}

export async function getLocaleSwitcherEntries(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const root = document.querySelector('.locale-switcher');
    if (!root) return [];
    return Array.from(root.querySelectorAll('a[hreflang], [data-locale]'))
      .map((el) => el.getAttribute('hreflang') ?? el.getAttribute('data-locale'))
      .filter((v): v is string => !!v);
  });
}
