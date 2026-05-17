// doctor check: openspec CLI installed + telemetry disabled.

import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, ok, warn, error } from './_lib.mjs';

export async function check() {
  const findings = [];

  // 1. Binary available? (The `openspec` npm name is a squatted 0.0.0 placeholder;
  //    once the real CLI install path is known, this check upgrades to an error
  //    on missing. For now, warn so the harness still works convention-only.)
  const probe = spawnSync('npx', ['--no-install', 'openspec', '--version'], { encoding: 'utf8' });
  if (probe.status === 0) {
    findings.push(ok('openspec-cli', `openspec installed (${probe.stdout.trim()})`));
  } else {
    findings.push(warn(
      'openspec-cli',
      'openspec CLI not installed; running convention-only. Spec validation / archive automation are manual until a real install path is wired.',
      'Once the correct install path is identified, run it; until then, hand-manage openspec/changes/ → openspec/archive/.',
    ));
  }

  // 2. Telemetry disabled in .env.example?
  const envExample = join(ROOT, '.env.example');
  if (existsSync(envExample)) {
    const content = await readFile(envExample, 'utf8');
    if (/OPENSPEC_TELEMETRY\s*=\s*0/.test(content)) {
      findings.push(ok('openspec-cli', 'OPENSPEC_TELEMETRY=0 set in .env.example'));
    } else {
      findings.push(warn('openspec-cli', '.env.example does not set OPENSPEC_TELEMETRY=0', 'Add OPENSPEC_TELEMETRY=0 to .env.example.'));
    }
  } else {
    findings.push(warn('openspec-cli', 'No .env.example at repo root', 'Create .env.example with OPENSPEC_TELEMETRY=0.'));
  }

  return findings;
}
