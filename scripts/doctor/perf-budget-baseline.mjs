// doctor check: budget thresholds in templates-perf/spec.md ↔ budget.json agree.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, ok, warn } from './_lib.mjs';

export async function check() {
 const findings = [];
 const specPath = join(ROOT, 'openspec/specs/templates-perf/spec.md');
 const budgetPath = join(ROOT, 'scripts/perf/budget.json');
 if (!existsSync(specPath) || !existsSync(budgetPath)) {
 findings.push(warn('perf-budget-baseline', 'templates-perf/spec.md or budget.json missing', 'Create both; thresholds must agree.'));
 return findings;
 }
 const spec = await readFile(specPath, 'utf8');
 const budget = JSON.parse(await readFile(budgetPath, 'utf8'));
 const lh = budget.lighthouse.mobile;

 const expected = [
 { label: 'Performance score', value: lh.scores['performance'] },
 { label: 'Accessibility score', value: lh.scores['accessibility'] },
 { label: 'Best Practices score', value: lh.scores['best-practices'] },
 { label: 'SEO score', value: lh.scores['seo'] },
 ];
 const mismatches = [];
 for (const e of expected) {
 const re = new RegExp(`${e.label}\\s*\\|\\s*≥\\s*${e.value}\\b`);
 if (!re.test(spec)) mismatches.push(e.label);
 }
 if (mismatches.length === 0) {
 findings.push(ok('perf-budget-baseline', 'budget.json and templates-perf/spec.md agree'));
 } else {
 findings.push(warn(
 'perf-budget-baseline',
 `threshold drift between spec.md and budget.json: ${mismatches.join(', ')}`,
 `Update one to match the other. The canonical source is templates-perf/spec.md`,
 ));
 }
 return findings;
}
