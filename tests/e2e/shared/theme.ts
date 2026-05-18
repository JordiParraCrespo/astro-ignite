import type { Page } from '@playwright/test';

export async function clickThemeToggle(page: Page): Promise<'light' | 'dark'> {
  const btn = page.locator('.theme-toggle, button[data-theme-toggle], button[aria-label*="theme" i]').first();
  await btn.click();
  return (await readVisibleTheme(page)) ?? 'dark';
}

export async function readVisibleTheme(page: Page): Promise<'light' | 'dark' | null> {
  return page.evaluate(() => {
    const root = document.documentElement;
    if (root.classList.contains('light')) return 'light';
    if (root.classList.contains('dark')) return 'dark';
    return null;
  });
}

export async function readPersistedTheme(page: Page): Promise<string | null> {
  return page.evaluate(() => window.localStorage.getItem('theme'));
}

export async function clearPersistedTheme(page: Page): Promise<void> {
  await page.evaluate(() => window.localStorage.removeItem('theme'));
}
