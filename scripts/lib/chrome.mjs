// Chrome-for-Testing discovery, shared by the perf gate (scripts/perf/)
// and doctor (scripts/doctor/chrome-installed.mjs). One source for the
// probe order the graceful-skip contract depends on. No side effects,
// named export. See scripts/doctor/CLAUDE.md.

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Returns the path to a usable Chrome / Chromium binary, or null when
// none is found on PATH or at the known install symlinks.
export function findChrome() {
  const probes = [
    ['which', 'google-chrome'],
    ['which', 'chrome'],
    ['which', 'chromium'],
  ];
  for (const [cmd, name] of probes) {
    const r = spawnSync(cmd, [name], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  const pathProbes = ['/usr/local/bin/chrome', join(homedir(), '.local/bin/chrome')];
  for (const p of pathProbes) {
    if (existsSync(p)) return p;
  }
  return null;
}
