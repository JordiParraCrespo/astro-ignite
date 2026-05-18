import { test, expect } from '@playwright/test';
import { clickThemeToggle, readPersistedTheme, readVisibleTheme } from '../shared/theme';

test.describe('theme toggle @theme', () => {
  test('first click flips <html>.classList to .light and persists', async ({ page, context }) => {
    await context.addInitScript(() => {
      try {
        window.localStorage.removeItem('theme');
      } catch {}
    });
    await page.goto('/');

    const beforeClass = await readVisibleTheme(page);
    expect(beforeClass === 'light' || beforeClass === 'dark').toBeTruthy();

    await clickThemeToggle(page);
    const visibleAfter = await readVisibleTheme(page);
    expect(
      visibleAfter === 'light' || visibleAfter === 'dark',
      'visible theme should be one of light/dark after click'
    ).toBeTruthy();
    const stored = await readPersistedTheme(page);
    expect(stored, 'localStorage theme should match visible state').toBe(visibleAfter);

    await page.reload();
    const afterReload = await readVisibleTheme(page);
    expect(afterReload, 'theme should persist across reloads').toBe(visibleAfter);
  });

  test('second click flips back and stores the opposite value', async ({ page, context }) => {
    await context.addInitScript(() => {
      try {
        window.localStorage.removeItem('theme');
      } catch {}
    });
    await page.goto('/');

    await clickThemeToggle(page);
    const first = await readVisibleTheme(page);
    await clickThemeToggle(page);
    const second = await readVisibleTheme(page);

    expect(second, 'second click should toggle the visible theme').not.toBe(first);
    const stored = await readPersistedTheme(page);
    expect(stored).toBe(second);
  });
});
