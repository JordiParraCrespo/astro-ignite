#!/usr/bin/env node
// Doctor command. Loads every scripts/doctor/<name>.mjs (except _lib.mjs and
// run-all.mjs), runs its check() in parallel, prints findings grouped by
// subsystem and severity, exits non-zero if any error severity is present.

import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const entries = await readdir(HERE);
const checks = entries.filter((n) => n.endsWith('.mjs') && n !== 'run-all.mjs' && n !== '_lib.mjs');

const results = await Promise.all(checks.map(async (name) => {
  try {
    const mod = await import(pathToFileURL(join(HERE, name)).href);
    if (typeof mod.check !== 'function') return [{ severity: 'warn', subsystem: name, message: 'module has no check() export' }];
    return await mod.check();
  } catch (e) {
    return [{ severity: 'error', subsystem: name, message: `crashed: ${e.message}`, fix: 'Fix the check script.' }];
  }
}));

const flat = results.flat();
const bySubsystem = new Map();
for (const f of flat) {
  if (!bySubsystem.has(f.subsystem)) bySubsystem.set(f.subsystem, []);
  bySubsystem.get(f.subsystem).push(f);
}

const icon = { ok: '✅', warn: '⚠️ ', error: '❌' };

let errors = 0;
let warns = 0;
for (const [subsystem, findings] of bySubsystem) {
  for (const f of findings) {
    console.log(`${icon[f.severity] ?? '·'} [${subsystem}] ${f.message}`);
    if (f.fix) console.log(`    fix: ${f.fix}`);
    if (f.severity === 'error') errors++;
    if (f.severity === 'warn') warns++;
  }
}

console.log('');
console.log(`Summary: ${errors} error, ${warns} warn, ${flat.length - errors - warns} ok`);
process.exit(errors > 0 ? 1 : 0);
