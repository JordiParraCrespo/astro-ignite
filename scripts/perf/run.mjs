#!/usr/bin/env node
// Perf budget runner. Maps to openspec/specs/templates-perf/spec.md.
//
// Usage:
//   node scripts/perf/run.mjs                  # all targets, full Lighthouse
//   node scripts/perf/run.mjs --page <route>   # one page (default: /)
//   node scripts/perf/run.mjs --target <pkg>   # override target package
//   node scripts/perf/run.mjs --transfer       # transfer-only check
//   node scripts/perf/run.mjs --critical-css   # Beasties output check
//   node scripts/perf/run.mjs --deps           # no-new-dep check
//   node scripts/perf/run.mjs --change <name>  # scope output to a change report
//
// Boots a preview server for the resolved target, polls until it
// responds, runs Lighthouse, parses the LHR, compares each score and
// metric against scripts/perf/budget.json, prints per-page numbers.
// Exits 0 on pass, 1 on any out-of-budget finding. When Chrome is
// not on PATH the Lighthouse branch records a single `skipped`
// finding and exits 0 (graceful skip preserved from PR #39).
//
// SIGINT / SIGTERM tear down the spawned preview server before exit.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { latestRunDir } from '../lib/state.mjs';
import { findChrome } from '../lib/chrome.mjs';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));

// --- Pure helpers (exported for unit tests) ---

const SCORE_KEYS = ['performance', 'accessibility', 'best-practices', 'seo'];
const METRIC_KEYS = [
  'largest-contentful-paint',
  'interaction-to-next-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
];

const SCORE_LABELS = {
  performance: 'Performance score',
  accessibility: 'Accessibility score',
  'best-practices': 'Best Practices score',
  seo: 'SEO score',
};

const METRIC_LABELS = {
  'largest-contentful-paint': 'LCP',
  'interaction-to-next-paint': 'INP',
  'cumulative-layout-shift': 'CLS',
  'total-blocking-time': 'TBT',
};

// Pretty-print a numeric value for a metric. Returns a short string
// matching the unit conventions used in proposal S16.
function formatMetric(id, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value);
  switch (id) {
    case 'largest-contentful-paint':
      return `${(value / 1000).toFixed(2)}s`;
    case 'interaction-to-next-paint':
    case 'total-blocking-time':
      return `${Math.round(value)}ms`;
    case 'cumulative-layout-shift':
      return value.toFixed(3);
    default:
      return String(value);
  }
}

function formatThreshold(id, value) {
  if (typeof value !== 'number') return String(value);
  switch (id) {
    case 'largest-contentful-paint':
      return `${(value / 1000).toFixed(2)}s`;
    case 'interaction-to-next-paint':
    case 'total-blocking-time':
      return `${Math.round(value)}ms`;
    case 'cumulative-layout-shift':
      return value.toFixed(3);
    default:
      return String(value);
  }
}

/**
 * Compare a parsed Lighthouse Result (LHR) against the scores +
 * metrics thresholds from scripts/perf/budget.json (the
 * `lighthouse.mobile` block).
 *
 * Returns { findings, anyFail } where each finding carries
 *   { label, pass, actual, threshold, detail }.
 *
 * Missing scores / missing metrics fail loudly (not silent pass) so
 * a future Lighthouse rename can't quietly skip a check.
 */
export function compareAgainstBudget(lhr, thresholds, _options = {}) {
  const findings = [];
  let anyFail = false;
  const categories = lhr?.categories ?? {};
  const audits = lhr?.audits ?? {};

  for (const key of SCORE_KEYS) {
    const scoreFloor = thresholds?.scores?.[key];
    if (scoreFloor === undefined) continue;
    const cat = categories[key];
    const label = SCORE_LABELS[key] ?? `${key} score`;
    if (!cat || typeof cat.score !== 'number') {
      anyFail = true;
      findings.push({
        label,
        pass: false,
        actual: null,
        threshold: scoreFloor,
        detail: `missing score for ${key} (≥ ${scoreFloor})`,
      });
      continue;
    }
    const actual = Math.round(cat.score * 100);
    const pass = actual >= scoreFloor;
    if (!pass) anyFail = true;
    findings.push({
      label,
      pass,
      actual,
      threshold: scoreFloor,
      detail: `${actual} (≥ ${scoreFloor})`,
    });
  }

  for (const key of METRIC_KEYS) {
    const ceiling = thresholds?.metrics?.[key];
    if (ceiling === undefined) continue;
    const audit = audits[key];
    const label = METRIC_LABELS[key] ?? key;
    if (!audit || typeof audit.numericValue !== 'number') {
      anyFail = true;
      findings.push({
        label,
        pass: false,
        actual: null,
        threshold: ceiling,
        detail: `missing metric ${key} (≤ ${formatThreshold(key, ceiling)})`,
      });
      continue;
    }
    const actual = audit.numericValue;
    const pass = actual <= ceiling;
    if (!pass) anyFail = true;
    findings.push({
      label,
      pass,
      actual,
      threshold: ceiling,
      detail: `${formatMetric(key, actual)} (≤ ${formatThreshold(key, ceiling)})`,
    });
  }

  return { findings, anyFail };
}

/**
 * Compare the LHR's total transfer (bytes) against the transfer
 * budget (KB). Returns { finding, pass }.
 */
export function compareTransfer(lhr, transferThresholdKb) {
  const audit = lhr?.audits?.['total-byte-weight'];
  if (!audit || typeof audit.numericValue !== 'number') {
    return {
      pass: false,
      finding: {
        label: 'Total transfer',
        pass: false,
        actual: null,
        threshold: transferThresholdKb,
        detail: `missing total-byte-weight audit (≤ ${transferThresholdKb} KB)`,
      },
    };
  }
  const kb = audit.numericValue / 1024;
  const pass = kb <= transferThresholdKb;
  return {
    pass,
    finding: {
      label: 'Total transfer',
      pass,
      actual: kb,
      threshold: transferThresholdKb,
      detail: `${kb.toFixed(1)} KB (≤ ${transferThresholdKb} KB)`,
    },
  };
}

/**
 * Resolve which preview-server target to boot for a given --page
 * route. Returns { pkg, route }.
 */
export function resolveTarget(argv) {
  const route = argFrom(argv, 'page') ?? '/';
  const explicit = argFrom(argv, 'target');
  if (explicit) return { pkg: explicit, route };
  if (route.startsWith('/docs')) {
    return { pkg: '@astro-ignite/template-docs', route };
  }
  return { pkg: '@astro-ignite/template-starter', route };
}

function argFrom(argv, name) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith('--')) return undefined;
  return next;
}

// --- Private helpers ---

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      srv.close(() => resolve(port));
    });
  });
}

async function waitForHttp(url, { timeoutMs = 30_000, intervalMs = 250 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status >= 200 && res.status < 400) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(
    `Timed out waiting for ${url} after ${timeoutMs}ms${lastError ? `: ${lastError.message}` : ''}`,
  );
}

function buildIfNeeded(pkg) {
  const pkgDir = resolvePkgDir(pkg);
  if (pkgDir && existsSync(join(pkgDir, 'dist'))) return { ok: true, built: false };
  const r = spawnSync('pnpm', ['--filter', pkg, 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  return { ok: r.status === 0, built: true, status: r.status };
}

function resolvePkgDir(pkg) {
  const candidates = [
    'packages/templates/starter',
    'packages/templates/docs',
    'apps/site',
    'apps/docs',
  ];
  for (const c of candidates) {
    const p = join(ROOT, c, 'package.json');
    if (!existsSync(p)) continue;
    try {
      const j = JSON.parse(readFileSync(p, 'utf8'));
      if (j.name === pkg) return join(ROOT, c);
    } catch {}
  }
  return null;
}

/**
 * Boot a preview server, run Lighthouse against it, return the
 * findings and the raw LHR. Caller owns process lifecycle; cleanup
 * is registered on `state.server` so SIGINT handlers in the caller
 * can kill it.
 */
export async function runLighthouseAgainst(targetPkg, route, options = {}) {
  const { thresholds, server: serverState } = options;
  const port = await findFreePort();
  const url = `http://localhost:${port}${route}`;

  const child = spawn('pnpm', ['--filter', targetPkg, 'preview', '--port', String(port)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (serverState) serverState.current = child;

  try {
    await waitForHttp(url, { timeoutMs: 30_000 });
  } catch (err) {
    return {
      anyFail: true,
      findings: [
        {
          label: 'Preview server ready',
          pass: false,
          detail: err.message,
        },
      ],
      lhr: null,
    };
  }

  const lh = spawnSync(
    'npx',
    [
      '--no-install',
      'lighthouse',
      url,
      '--preset=mobile',
      '--output=json',
      '--output-path=stdout',
      '--quiet',
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    ],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  if (lh.status !== 0) {
    return {
      anyFail: true,
      findings: [
        {
          label: 'Lighthouse run',
          pass: false,
          detail: `lighthouse exit ${lh.status}${lh.stderr ? `: ${lh.stderr.trim().split('\n').slice(-3).join(' / ')}` : ''}`,
        },
      ],
      lhr: null,
    };
  }
  let lhr;
  try {
    lhr = JSON.parse(lh.stdout);
  } catch (err) {
    return {
      anyFail: true,
      findings: [
        {
          label: 'Lighthouse run',
          pass: false,
          detail: `failed to parse LHR JSON: ${err.message}`,
        },
      ],
      lhr: null,
    };
  }

  const { findings, anyFail } = compareAgainstBudget(lhr, thresholds);
  return { findings, anyFail, lhr };
}

// --- CLI entrypoint (only when invoked directly) ---

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  await main().catch((err) => {
    console.error(`perf/run: ${err.stack || err.message || err}`);
    process.exit(1);
  });
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (name) => argFrom(argv, name);
  const flag = (name) => argv.includes(`--${name}`);

  const changeName = arg('change');
  const explicitPage = arg('page');
  const transferOnly = flag('transfer');
  const criticalOnly = flag('critical-css');
  const depsOnly = flag('deps');

  const budget = JSON.parse(await readFile(join(ROOT, 'scripts/perf/budget.json'), 'utf8'));
  const thresholds = budget.lighthouse.mobile;
  const transferBudgetKb = budget.transfer?.home_kb_compressed_max ?? 150;

  const findings = [];
  const record = (label, pass, detail) => {
    findings.push({ label, pass, detail });
    console.log(`${pass ? '✅' : '❌'} ${label}${detail ? ' — ' + detail : ''}`);
  };

  const serverState = { current: null };
  const cleanup = () => {
    const server = serverState.current;
    if (!server || server.killed) return;
    try {
      server.kill('SIGTERM');
    } catch {}
    setTimeout(() => {
      try {
        if (!server.killed) server.kill('SIGKILL');
      } catch {}
    }, 500).unref();
  };
  process.on('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });

  let exitCode = 0;

  // --- deps check ---
  if (depsOnly || (!transferOnly && !criticalOnly && !explicitPage && !flag('page'))) {
    const tplDirs = ['packages/templates/starter', 'packages/templates/docs'];
    for (const tpl of tplDirs) {
      const pkgPath = join(ROOT, tpl, 'package.json');
      if (!existsSync(pkgPath)) continue;
      const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
      const deps = Object.keys(pkg.dependencies ?? {}).length;
      record(`${tpl} dep count`, true, `${deps} runtime deps`);
    }
    if (depsOnly) return await finish();
  }

  // --- critical CSS check ---
  if (criticalOnly) {
    const buildDirs = [join(ROOT, 'apps/site/dist'), join(ROOT, 'apps/docs/dist')];
    let anyBuild = false;
    for (const dir of buildDirs) {
      if (!existsSync(dir)) continue;
      anyBuild = true;
      const idx = join(dir, 'index.html');
      if (!existsSync(idx)) continue;
      const html = await readFile(idx, 'utf8');
      const hasInline = /<style\b[^>]*>[\s\S]*?<\/style>/.test(html);
      record(
        `Critical CSS inlined in ${relative(ROOT, idx)}`,
        hasInline,
        hasInline ? 'inline <style> found' : 'no inline critical CSS detected',
      );
    }
    if (!anyBuild) record('Build output present', false, 'run `pnpm build` first');
    return await finish();
  }

  // --- transfer-only check ---
  if (transferOnly) {
    const chrome = findChrome();
    if (!chrome) {
      record(
        'Total transfer',
        true,
        'skipped — chrome not installed; run scripts/doctor/install-chrome.mjs',
      );
      return await finish();
    }
    const result = await runOnce({ route: '/' });
    if (result.skipped) return await finish();
    const { lhr, findings: lhFindings, anyFail } = result;
    for (const f of lhFindings) record(f.label, f.pass, f.detail);
    if (lhr) {
      const { finding, pass } = compareTransfer(lhr, transferBudgetKb);
      record(finding.label, pass, finding.detail);
      if (!pass) exitCode = 1;
    } else if (anyFail) {
      exitCode = 1;
    }
    return await finish();
  }

  // --- lighthouse check (default + --page) ---
  const chrome = findChrome();
  if (!chrome) {
    record(
      'Lighthouse run',
      true,
      'skipped — chrome not installed; run scripts/doctor/install-chrome.mjs',
    );
    return await finish();
  }

  const result = await runOnce({ route: explicitPage ?? '/' });
  if (result.skipped) return await finish();
  for (const f of result.findings) record(f.label, f.pass, f.detail);
  if (result.lhr) {
    const { finding, pass } = compareTransfer(result.lhr, transferBudgetKb);
    record(finding.label, pass, finding.detail);
    if (!pass) exitCode = 1;
  }
  if (result.anyFail) exitCode = 1;

  return await finish();

  // --- helpers closed over local state ---
  async function runOnce({ route }) {
    const target = resolveTarget([...argv, '--page', route]);
    const build = buildIfNeeded(target.pkg);
    if (!build.ok) {
      record('Preview build', false, `pnpm --filter ${target.pkg} build exited ${build.status}`);
      return { skipped: true, anyFail: true, findings: [], lhr: null };
    }
    try {
      return await runLighthouseAgainst(target.pkg, target.route, {
        thresholds,
        server: serverState,
      });
    } finally {
      cleanup();
    }
  }

  async function finish() {
    if (changeName) {
      const lines = [`# Perf — ${changeName}`, '', `Generated: ${new Date().toISOString()}`, ''];
      lines.push('## Findings');
      for (const f of findings) {
        lines.push(`- ${f.pass ? '✅' : '❌'} ${f.label}${f.detail ? ' — ' + f.detail : ''}`);
      }
      lines.push('');
      lines.push('## Budget (canonical: openspec/specs/templates-perf/spec.md )');
      lines.push('```json');
      lines.push(JSON.stringify(budget, null, 2));
      lines.push('```');
      const run = await latestRunDir(changeName);
      const target = run ? join(run, 'perf.md') : join(ROOT, 'openspec/changes', changeName, 'perf.md');
      await mkdir(join(target, '..'), { recursive: true });
      await writeFile(target, lines.join('\n') + '\n');
      console.log(`\nReport: ${relative(ROOT, target)}`);
    }
    const failed = findings.filter((f) => !f.pass).length;
    process.exit(exitCode || (failed > 0 ? 1 : 0));
  }
}
