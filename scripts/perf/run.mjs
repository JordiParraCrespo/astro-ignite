#!/usr/bin/env node
// Perf budget runner. Maps to openspec/specs/templates-perf/spec.md.
//
// Usage:
// node scripts/perf/run.mjs # all targets, full Lighthouse
// node scripts/perf/run.mjs --page / # one page
// node scripts/perf/run.mjs --transfer # transfer-only check
// node scripts/perf/run.mjs --critical-css # Beasties output check
// node scripts/perf/run.mjs --deps # no-new-dep check vs last archive
// node scripts/perf/run.mjs --change <name> # scope output to a change report
//
// Strategy: shell out to `lighthouse` CLI via npx. Fail loudly if Chrome
// for Testing isn't available — the docter command catches that.

import { spawnSync, spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { latestRunDir } from '../lib/state.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const argv = process.argv.slice(2);
const arg = (name) => {
 const i = argv.indexOf(`--${name}`);
 return i === -1 ? undefined : argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
};
const flag = (name) => argv.includes(`--${name}`);

const changeName = arg('change');
const page = arg('page') ?? '/';
const transferOnly = flag('transfer');
const criticalOnly = flag('critical-css');
const depsOnly = flag('deps');

const budget = JSON.parse(await readFile(join(ROOT, 'scripts/perf/budget.json'), 'utf8'));
const thresholds = budget.lighthouse.mobile;

const findings = [];

function record(label, pass, detail) {
 findings.push({ label, pass, detail });
 console.log(`${pass ? '✅' : '❌'} ${label}${detail ? ' — ' + detail : ''}`);
}

// --- deps check (cheap, always runs first) ---
if (depsOnly || (!transferOnly && !criticalOnly && !arg('page'))) {
 const tplDirs = ['packages/templates/starter', 'packages/templates/docs'];
 for (const tpl of tplDirs) {
 const pkgPath = join(ROOT, tpl, 'package.json');
 if (!existsSync(pkgPath)) continue;
 const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
 const deps = Object.keys(pkg.dependencies ?? {}).length;
 record(`${tpl} dep count`, true, `${deps} runtime deps`);
 }
 if (depsOnly) finishAndExit();
}

// --- lighthouse check ---
if (!transferOnly && !criticalOnly && !depsOnly) {
 // Try to find a target URL: prefer running preview server; here we just check binary availability.
 const probe = spawnSync('npx', ['--no-install', 'lighthouse', '--version'], { encoding: 'utf8' });
 if (probe.status !== 0) {
 record('lighthouse binary', false, 'lighthouse not installed (try `pnpm dlx lighthouse` or install Chrome for Testing). Skipping Lighthouse run; see scripts/doctor/chrome-installed.mjs');
 record('Lighthouse budget', false, 'skipped — no lighthouse binary');
 finishAndExit();
 }
 // Real run would: start `pnpm --filter @astro-ignite/template-starter dev` (or preview build),
 // wait for the port, then `lighthouse http://localhost:4321${page} --preset=desktop --output=json`,
 // parse the JSON, compare each metric to thresholds. Left as the next iteration once
 // we have a working preview wiring; for now, this is a deliberate placeholder that
 // emits a clear "not yet wired" finding rather than silently passing.
 record('Lighthouse run', false, `not yet wired to a preview server target; see AGENTS.md step 6`);
}

if (transferOnly) {
 record('Total transfer', false, 'not yet wired; run after Lighthouse integration lands');
}

if (criticalOnly) {
 // Beasties output check: look for inlined <style> in built HTML
 const buildDirs = [
 join(ROOT, 'apps/site/dist'),
 join(ROOT, 'apps/docs/dist'),
 ];
 let anyBuild = false;
 for (const dir of buildDirs) {
 if (!existsSync(dir)) continue;
 anyBuild = true;
 const idx = join(dir, 'index.html');
 if (!existsSync(idx)) continue;
 const html = await readFile(idx, 'utf8');
 const hasInline = /<style\b[^>]*>[\s\S]*?<\/style>/.test(html);
 record(`Critical CSS inlined in ${relative(ROOT, idx)}`, hasInline, hasInline ? 'inline <style> found' : 'no inline critical CSS detected');
 }
 if (!anyBuild) record('Build output present', false, 'run `pnpm build` first');
}

finishAndExit();

async function finishAndExit() {
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
 process.exit(failed > 0 ? 1 : 0);
}
