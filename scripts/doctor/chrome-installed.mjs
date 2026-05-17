// doctor check: Chrome for Testing reachable (needed by Lighthouse + banner pipeline).

import { spawnSync } from 'node:child_process';
import { ok, warn } from './_lib.mjs';

export async function check() {
  const findings = [];
  // Try the npx chrome path first (Chrome for Testing via puppeteer / chrome-launcher)
  const which = spawnSync('which', ['chrome'], { encoding: 'utf8' });
  const probes = [
    ['which', 'google-chrome'],
    ['which', 'chrome'],
    ['which', 'chromium'],
  ];
  let found = null;
  for (const [cmd, arg] of probes) {
    const r = spawnSync(cmd, [arg], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) {
      found = r.stdout.trim();
      break;
    }
  }
  if (found) {
    findings.push(ok('chrome', `Chrome at ${found}`));
  } else {
    findings.push(warn(
      'chrome',
      'No google-chrome / chrome / chromium on PATH. Lighthouse runs and the banner pipeline will fail.',
      'Install Chrome for Testing: `npx @puppeteer/browsers install chrome@stable` or use the system package.',
    ));
  }
  return findings;
}
