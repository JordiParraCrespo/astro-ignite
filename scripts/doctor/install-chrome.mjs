#!/usr/bin/env node
// Idempotent installer for Chrome for Testing.
//
// Usage:
//   node scripts/doctor/install-chrome.mjs [--prefix DIR]
//        [--bindir DIR] [--version VERSION] [--dry-run]
//
// Defaults:
//   --prefix   /opt/chrome-for-testing
//   --bindir   /usr/local/bin
//   --version  the PINNED_VERSION constant below
//
// Fetches the Chrome-for-Testing manifest, picks the chrome-linux64
// download for the pinned version, extracts to <prefix>/<version>/,
// and symlinks <bindir>/chrome → the extracted binary. Fast-path
// exits 0 when the symlink already targets the pinned-version binary.
//
// This script is CLI-driven (no `check()` export), so the doctor
// autoloader at `scripts/doctor/run-all.mjs` does not invoke it on
// `pnpm doctor`.

import { mkdir, readlink, symlink, unlink, chmod } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

// Pin matches the version called out in the issue body (#45).
// Bump in lockstep with the Chrome version CI's runs-on:
// ubuntu-latest resolves for the Lighthouse workflow.
const PINNED_VERSION = '131.0.6778.85';
const MANIFEST_URL =
  'https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json';

const argv = process.argv.slice(2);
function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith('--')) return fallback;
  return next;
}
function flag(name) {
  return argv.includes(`--${name}`);
}

const prefix = resolve(arg('prefix', '/opt/chrome-for-testing'));
const bindir = resolve(arg('bindir', '/usr/local/bin'));
const version = arg('version', PINNED_VERSION);
const dryRun = flag('dry-run');

const symlinkPath = join(bindir, 'chrome');
const installDir = join(prefix, version);
const expectedBinary = join(installDir, 'chrome-linux64', 'chrome');

async function main() {
  // Idempotence fast path: if the symlink already resolves to the
  // pinned-version binary, exit 0 without re-downloading.
  if (existsSync(symlinkPath)) {
    try {
      const target = await readlink(symlinkPath);
      const resolved = resolve(dirname(symlinkPath), target);
      if (resolved === expectedBinary && existsSync(expectedBinary)) {
        console.log(`Chrome for Testing ${version} already installed at ${symlinkPath}`);
        return;
      }
    } catch {
      // Not a symlink, or readlink failed — fall through to install.
    }
  }

  console.log(`Resolving Chrome for Testing ${version} from manifest…`);
  const manifest = await fetchJson(MANIFEST_URL);
  const entry = manifest.versions?.find((v) => v.version === version);
  if (!entry) {
    throw new Error(`Version ${version} not present in manifest at ${MANIFEST_URL}`);
  }
  const chromeDownloads = entry.downloads?.chrome ?? [];
  const linux = chromeDownloads.find((d) => d.platform === 'linux64');
  if (!linux) {
    throw new Error(`No chrome-linux64 download for version ${version}`);
  }
  const url = linux.url;
  console.log(`Resolved download URL: ${url}`);

  if (dryRun) {
    console.log('--dry-run set; not downloading or writing anything.');
    return;
  }

  await mkdir(installDir, { recursive: true });
  const zipPath = join(tmpdir(), `chrome-for-testing-${version}-${process.pid}.zip`);
  console.log(`Downloading to ${zipPath}…`);
  await downloadTo(url, zipPath);

  console.log(`Extracting to ${installDir}…`);
  const unzip = spawnSync('unzip', ['-o', '-q', zipPath, '-d', installDir], {
    stdio: 'inherit',
  });
  if (unzip.status !== 0) {
    throw new Error(`unzip failed with exit ${unzip.status}`);
  }
  try {
    await unlink(zipPath);
  } catch {}

  if (!existsSync(expectedBinary)) {
    throw new Error(`Expected chrome binary missing at ${expectedBinary}`);
  }
  await chmod(expectedBinary, 0o755);

  await mkdir(bindir, { recursive: true });
  if (existsSync(symlinkPath)) {
    await unlink(symlinkPath);
  }
  await symlink(expectedBinary, symlinkPath);

  console.log(`Installed Chrome for Testing ${version}`);
  console.log(`  binary: ${expectedBinary}`);
  console.log(`  symlink: ${symlinkPath} -> ${expectedBinary}`);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  }
  await mkdir(dirname(dest), { recursive: true });
  const sink = createWriteStream(dest);
  await new Promise((ok, fail) => {
    const reader = res.body.getReader();
    const pump = () =>
      reader.read().then(({ done, value }) => {
        if (done) {
          sink.end();
          return;
        }
        if (!sink.write(value)) {
          sink.once('drain', pump);
        } else {
          pump();
        }
      }, fail);
    sink.on('error', fail);
    sink.on('close', ok);
    pump();
  });
}

// Stub `check()` so `scripts/doctor/run-all.mjs` autoloads without
// firing the installer on every `pnpm doctor` invocation.
export async function check() {
  return [];
}

// Only run main() when invoked directly — never when imported by the
// doctor autoloader (which would otherwise reach out to the manifest
// on every `pnpm doctor`).
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((err) => {
    console.error(`install-chrome: ${err.message}`);
    process.exit(1);
  });
}
