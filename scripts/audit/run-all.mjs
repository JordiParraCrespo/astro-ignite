#!/usr/bin/env node
// Dispatcher: invoked by `pnpm audit:invariants`.
//
// Modes:
//   --change <name>     scope to the invariants listed in openspec/changes/<name>/design.md
//   --all (default)     run every audit with no flags
//
// Reads each I<n> id from design.md's "Invariants this change touches" section,
// looks it up in the matching openspec/specs/<capability>/spec.md invariants
// table, parses the `audit:` command, runs them, writes openspec/progress/audit_<name>.md.

import { spawnSync } from 'node:child_process';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { latestRunDir } from '../lib/state.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const argv = process.argv.slice(2);
const changeIdx = argv.indexOf('--change');
const changeName = changeIdx === -1 ? null : argv[changeIdx + 1];

const audits = [];

if (changeName) {
  const designPath = join(ROOT, 'openspec/changes', changeName, 'design.md');
  if (!existsSync(designPath)) {
    console.error(`No design.md at ${designPath}`);
    process.exit(2);
  }
  const design = await readFile(designPath, 'utf8');
  // Find "Invariants this change touches" section through end of file / next H2.
  const invStart = design.search(/^##\s+Invariants this change touches/m);
  if (invStart === -1) {
    console.error('No "Invariants this change touches" section in design.md');
    process.exit(2);
  }
  const tail = design.slice(invStart);
  const invEnd = tail.search(/\n##\s+/m);
  const invBlock = invEnd === -1 ? tail : tail.slice(0, invEnd);

  // Parse `audit:` commands from the block. They look like:
  //   — audit: `node scripts/audit/i18n-parallels.mjs --strict`
  const cmdPattern = /audit:\s*`([^`]+)`/g;
  const seen = new Set();
  for (const m of invBlock.matchAll(cmdPattern)) {
    const cmd = m[1].trim();
    if (seen.has(cmd)) continue;
    seen.add(cmd);
    audits.push(cmd);
  }
} else {
  // Run every audit script under scripts/audit/ with no flags.
  const auditDir = join(ROOT, 'scripts/audit');
  const entries = await readdir(auditDir);
  for (const name of entries) {
    if (!name.endsWith('.mjs')) continue;
    if (name === 'run-all.mjs' || name === '_lib.mjs') continue;
    audits.push(`node scripts/audit/${name}`);
  }
}

const results = [];
let failed = 0;
for (const cmd of audits) {
  const parts = cmd.split(/\s+/);
  const child = spawnSync(parts[0], parts.slice(1), { cwd: ROOT, encoding: 'utf8' });
  let machine = null;
  if (child.stderr) {
    const lines = child.stderr.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        machine = JSON.parse(lines[i]);
        break;
      } catch {}
    }
  }
  const pass = child.status === 0;
  if (!pass) failed++;
  results.push({ cmd, pass, machine, stdout: child.stdout, stderr: child.stderr });
  process.stdout.write(child.stdout ?? '');
  if (!pass) process.stderr.write(child.stderr ?? '');
}

// Write audit.md when scoped to a change. Target: openspec/changes/<name>/runs/<latest>/audit.md
// Falls back to openspec/changes/<name>/audit.md (pre-flight, no run yet).
if (changeName) {
  const lines = [];
  lines.push(`# Audit — ${changeName}`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Change: openspec/changes/${changeName}/`);
  lines.push('');
  lines.push('## Results');
  lines.push('| Audit | Status | Notes |');
  lines.push('|-------|--------|-------|');
  for (const r of results) {
    const a = r.machine?.audit ?? r.cmd;
    const status = r.pass ? '✅ PASS' : '❌ FAIL';
    const notes = r.machine?.notes ?? '';
    lines.push(`| \`${a}\` | ${status} | ${notes} |`);
  }
  lines.push('');
  if (failed > 0) {
    lines.push('## Failed audits');
    for (const r of results) {
      if (r.pass) continue;
      const a = r.machine?.audit ?? r.cmd;
      lines.push(`### ${a}`);
      lines.push('```');
      lines.push(r.stdout?.trim() ?? '(no stdout)');
      lines.push('```');
      lines.push('');
    }
  }
  const run = await latestRunDir(changeName);
  const target = run ? join(run, 'audit.md') : join(ROOT, 'openspec/changes', changeName, 'audit.md');
  await mkdir(join(target, '..'), { recursive: true });
  await writeFile(target, lines.join('\n') + '\n');
  console.log(`\nReport: ${relative(ROOT, target)}`);
}

process.exit(failed > 0 ? 1 : 0);
