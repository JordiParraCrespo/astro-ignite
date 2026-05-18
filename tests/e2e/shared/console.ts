import type { Page, ConsoleMessage } from '@playwright/test';

export type ConsoleErrorEntry = { type: string; text: string; url: string };

const DEFAULT_ALLOW: RegExp[] = [
  /favicon\.ico.*404/i,
  /favicon\.svg.*404/i,
  /astro:fonts/i,
  /\[vite\]\s+connecting/i,
  /\[vite\]\s+connected/i,
  /\[HMR\]/i,
  /Download the React DevTools/i,
];

export type CaptureOptions = {
  allow?: RegExp[];
};

export type ConsoleCapture = {
  entries: ConsoleErrorEntry[];
  assertNone: () => void;
  dispose: () => void;
};

export function captureConsoleErrors(page: Page, opts: CaptureOptions = {}): ConsoleCapture {
  const allow = [...DEFAULT_ALLOW, ...(opts.allow ?? [])];
  const entries: ConsoleErrorEntry[] = [];

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (allow.some((re) => re.test(text))) return;
    entries.push({ type: 'console.error', text, url: page.url() });
  };

  const onPageError = (err: Error) => {
    const text = err.message || String(err);
    if (allow.some((re) => re.test(text))) return;
    entries.push({ type: 'pageerror', text, url: page.url() });
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    entries,
    assertNone() {
      if (entries.length === 0) return;
      const log = entries
        .map((e) => `  [${e.type}] @ ${e.url}\n    ${e.text}`)
        .join('\n');
      throw new Error(`Unexpected console errors:\n${log}`);
    },
    dispose() {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
}
