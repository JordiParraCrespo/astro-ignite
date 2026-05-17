// doctor check: feature_list.json declarative shape + filesystem coherence.
// In the derived-state model there is no `status` field to validate — instead
// we check that every spec_ready / in_progress feature has a valid change
// folder structure.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, ok, warn, error } from './_lib.mjs';
import { featureState, latestRunDir } from '../lib/state.mjs';

export async function check() {
 const findings = [];
 const flPath = join(ROOT, 'feature_list.json');
 if (!existsSync(flPath)) {
 findings.push(error('feature-list', 'feature_list.json missing at repo root', 'Create it; see AGENTS.md for the declarative-only schema.'));
 return findings;
 }
 const fl = JSON.parse(await readFile(flPath, 'utf8'));
 const features = fl.features ?? [];

 // 1. Reject stale `status` fields (declarative-only model).
 const stale = features.filter((f) => Object.prototype.hasOwnProperty.call(f, 'status')).map((f) => f.name);
 if (stale.length > 0) {
 findings.push(warn(
 'feature-list',
 `${stale.length} feature(s) still have a 'status' field: ${stale.join(', ')}. State is now derived; the field is ignored and should be removed.`,
 `Edit feature_list.json and delete every "status" key on feature entries.`,
 ));
 }

 // 2. valid_status in rules block is no longer meaningful.
 if (fl.rules && Object.prototype.hasOwnProperty.call(fl.rules, 'valid_status')) {
 findings.push(warn(
 'feature-list',
 `feature_list.json rules.valid_status is obsolete — remove it. States are derived (see scripts/lib/state.mjs).`,
 `Edit feature_list.json and delete rules.valid_status.`,
 ));
 }

 // 3. For every feature, derive state and validate the change folder shape.
 const issues = [];
 for (const f of features) {
 const s = await featureState(f.name);
 if (s === 'spec_ready' || s === 'in_progress' || s === 'blocked') {
 const dir = join(ROOT, 'openspec/changes', f.name);
 const required = ['proposal.md', 'design.md', 'tasks.md'];
 for (const r of required) {
 if (!existsSync(join(dir, r))) issues.push(`${f.name}: missing ${r} (state=${s})`);
 }
 }
 if (s === 'in_progress') {
 const run = await latestRunDir(f.name);
 if (!run) issues.push(`${f.name}: APPROVED present but no runs/<ts>/ created yet — leader should create one when dispatching the implementer`);
 }
 }
 if (issues.length === 0) {
 findings.push(ok('feature-list', `${features.length} feature(s) tracked; all active features have well-formed change folders`));
 } else {
 findings.push(error(
 'feature-list',
 `${issues.length} coherence issue(s):\n - ${issues.join('\n - ')}`,
 `Run \`pnpm queue\` to see the derived state of every feature.`,
 ));
 }
 return findings;
}
