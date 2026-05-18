import type { Page } from '@playwright/test';

/**
 * Read the visible theme state from `<html>`'s class list.
 *
 * The ThemeToggle component toggles ONLY the `.light` class. The dark theme
 * is denoted by the *absence* of `.light` (no `.dark` class is ever added).
 * So "no class" must be interpreted as dark, not as null/unknown.
 */
export async function readVisibleTheme(page: Page): Promise<'light' | 'dark'> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  });
}

export async function clickThemeToggle(page: Page): Promise<'light' | 'dark'> {
  const btn = page
    .locator('.theme-toggle, button[data-theme-toggle], button[aria-label*="theme" i]')
    .first();
  await btn.click();
  return readVisibleTheme(page);
}

export async function readPersistedTheme(page: Page): Promise<string | null> {
  return page.evaluate(() => window.localStorage.getItem('theme'));
}

export async function clearPersistedTheme(page: Page): Promise<void> {
  await page.evaluate(() => window.localStorage.removeItem('theme'));
}
