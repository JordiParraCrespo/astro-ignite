#!/usr/bin/env node
/*
 * Banner generator — renders the HTML files in this directory to 1200x630 PNGs
 * and writes them into src/content/blog/_assets/. Designs follow the
 * claude-design Banners.html aesthetic (dark zinc-950, Geist + Geist Mono,
 * grid overlay, pill chips, terminal panel).
 *
 * Uses Chrome for Testing (Playwright's installed binary) directly via the
 * `--headless --screenshot` flag — no Node-side browser library required.
 *
 * Usage:
 *   node apps/site/scripts/banners/generate.mjs            # render all
 *   node apps/site/scripts/banners/generate.mjs --only X   # render one (substring match)
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { mkdir, rm, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = __dirname;
const OUT_DIR = resolve(__dirname, '../../src/content/blog/_assets');
const VIEWPORT = '1200,630';

function findChrome() {
  // Prefer chrome-headless-shell — its `--screenshot=<path>` standalone flag
  // works reliably on Linux. The full Chrome for Testing binary hangs in
  // headless mode without a CDP client driving it.
  const root = join(homedir(), '.cache/ms-playwright');
  if (!existsSync(root)) {
    throw new Error(
      `chrome-headless-shell not found at ${root}. Install Playwright once (npx playwright install chromium) and retry.`,
    );
  }
  const entries = readdirSync(root)
    .filter((n) => n.startsWith('chromium_headless_shell-'))
    .sort()
    .reverse();
  for (const e of entries) {
    const candidate = join(root, e, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`No chrome-headless-shell under ${root}/chromium_headless_shell-*/...`);
}

async function renderOne(htmlPath, outPath, chrome) {
  // Headless Chrome writes screenshots to a fixed name in cwd by default; pass
  // the target path explicitly. --hide-scrollbars keeps the artboard clean.
  const tmpDir = await import('node:fs').then((m) => m.mkdtempSync(join('/tmp', 'banner-')));
  const args = [
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${VIEWPORT}`,
    `--screenshot=${outPath}`,
    `--virtual-time-budget=3000`, // local @font-face only — no network round-trips
    `--user-data-dir=${tmpDir}`,
    pathToFileURL(htmlPath).href,
  ];
  const res = spawnSync(chrome, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  await rm(tmpDir, { recursive: true, force: true });
  if (res.status !== 0) {
    process.stderr.write(res.stderr?.toString() ?? '');
    throw new Error(`chrome exited with code ${res.status} on ${htmlPath}`);
  }
}

async function main() {
  const onlyArg = process.argv.indexOf('--only');
  const onlyFilter = onlyArg >= 0 ? process.argv[onlyArg + 1] : null;

  const chrome = findChrome();
  await mkdir(OUT_DIR, { recursive: true });

  const all = (await readdir(SOURCE_DIR)).filter(
    (n) => n.endsWith('.html') && !n.startsWith('_'),
  );
  const filtered = onlyFilter ? all.filter((n) => n.includes(onlyFilter)) : all;
  if (filtered.length === 0) {
    process.stderr.write(`no banners matched ${onlyFilter ? `--only ${onlyFilter}` : ''}\n`);
    process.exit(1);
  }

  process.stdout.write(`→ chrome: ${chrome}\n`);
  for (const file of filtered) {
    const html = join(SOURCE_DIR, file);
    const png = join(OUT_DIR, `hero-${file.replace(/\.html$/, '.png')}`);
    process.stdout.write(`→ rendering ${file} → ${png}\n`);
    await renderOne(html, png, chrome);
  }
  process.stdout.write(`✓ done — ${filtered.length} banner(s)\n`);
}

main().catch((err) => {
  process.stderr.write(`error: ${err.message ?? err}\n`);
  process.exit(1);
});
