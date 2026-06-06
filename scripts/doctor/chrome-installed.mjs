// doctor check: Chrome for Testing reachable (needed by Lighthouse + banner pipeline).

import { ok, warn } from './_lib.mjs';
import { findChrome } from '../lib/chrome.mjs';

export async function check() {
  const findings = [];
  const found = findChrome();
  if (found) {
    findings.push(ok('chrome', `Chrome at ${found}`));
  } else {
    findings.push(
      warn(
        'chrome',
        'No google-chrome / chrome / chromium on PATH. Lighthouse runs and the banner pipeline will fail.',
        'Run scripts/doctor/install-chrome.mjs to install the pinned Chrome for Testing.',
      ),
    );
  }
  return findings;
}
