// doctor check: `~/.npm/_cacache/` is writable so `npx lighthouse`
// (and any other on-demand npx fetch) can populate the cache.
//
// On the autopilot runner, the systemd unit at
// `autopilot/systemd/aig-runner.service` controls this — its
// `ReadWritePaths=` must grant write access to the npm cache.

import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ok, warn } from './_lib.mjs';

export async function check() {
  const cacheDir = join(homedir(), '.npm/_cacache');
  const probePath = join(cacheDir, `.aig-doctor-probe-${process.pid}`);
  try {
    await mkdir(cacheDir, { recursive: true });
    await writeFile(probePath, 'x');
    await unlink(probePath);
    return [ok('npm-cache-writable', `npm cache writable at ${cacheDir}`)];
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? err.code : undefined;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
      return [
        warn(
          'npm-cache-writable',
          `npm cache not writable at ${cacheDir} (${code}). npx-driven fetches (Lighthouse, @puppeteer/browsers, etc.) will fail.`,
          'Deploy autopilot/systemd/aig-runner.service and restart aig-runner so ReadWritePaths= grants the npm cache write access.',
        ),
      ];
    }
    return [
      warn(
        'npm-cache-writable',
        `unexpected error probing ${cacheDir}: ${err && err.message ? err.message : String(err)}`,
        'Investigate the failure — npx fetches require this path writable.',
      ),
    ];
  }
}
