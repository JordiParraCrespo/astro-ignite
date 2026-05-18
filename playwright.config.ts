import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { TARGETS, projectForTarget, webServerForTarget } from './tests/e2e/shared/targets';

const __dirname = dirname(fileURLToPath(import.meta.url));

const playgroundReady = process.env.PLAYWRIGHT_PLAYGROUND_READY === '1';

const enabledTargets = TARGETS.filter((t) => {
  if (t.name === 'playground') return playgroundReady;
  return true;
});

export default defineConfig({
  testDir: resolve(__dirname, 'tests/e2e'),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: resolve(__dirname, 'tests/e2e/playwright-report'),
      },
    ],
  ],
  outputDir: resolve(__dirname, 'tests/e2e/test-results'),
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: enabledTargets.map((t) =>
    projectForTarget(t, {
      ...devices['Desktop Chrome'],
    })
  ),
  webServer: enabledTargets.map((t) => webServerForTarget(t)),
});
