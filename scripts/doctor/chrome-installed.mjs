// doctor check: Chrome for Testing reachable (needed by Lighthouse + banner pipeline).

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ok, warn } from './_lib.mjs';

export async function check() {
  const findings = [];
  const probes = [
    ['which', 'google-chrome'],
    ['which', 'chrome'],
    ['which', 'chromium'],
  ];
  let found = null;
  for (const [cmd, name] of probes) {
    const r = spawnSync(cmd, [name], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) {
      found = r.stdout.trim();
      break;
    }
  }
  if (!found) {
    const pathProbes = [
      '/usr/local/bin/chrome',
      join(homedir(), '.local/bin/chrome'),
    ];
    for (const p of pathProbes) {
      if (existsSync(p)) {
        found = p;
        break;
      }
    }
  }
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
