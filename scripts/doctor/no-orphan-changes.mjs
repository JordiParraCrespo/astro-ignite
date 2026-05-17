// doctor check: every openspec/changes/<name>/ has an entry in openspec/feature_list.json.

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, ok, warn } from './_lib.mjs';

export async function check() {
  const findings = [];
  const flPath = join(ROOT, 'openspec/feature_list.json');
  const changesDir = join(ROOT, 'openspec/changes');
  if (!existsSync(changesDir) || !existsSync(flPath)) {
    findings.push(ok('no-orphan-changes', 'no openspec/changes/ yet — nothing to orphan'));
    return findings;
  }
  const fl = JSON.parse(await readFile(flPath, 'utf8'));
  const names = new Set((fl.features ?? []).map((f) => f.name));
  const entries = await readdir(changesDir, { withFileTypes: true });
  const orphans = entries
    .filter((e) => e.isDirectory() && !names.has(e.name))
    .map((e) => e.name);
  if (orphans.length === 0) {
    findings.push(ok('no-orphan-changes', `${entries.length} change folder(s); all matched to openspec/feature_list.json`));
  } else {
    findings.push(warn(
      'no-orphan-changes',
      `orphaned change folder(s): ${orphans.join(', ')}`,
      `Add entries to openspec/feature_list.json or move the folder(s) into openspec/archive/.`,
    ));
  }
  return findings;
}
