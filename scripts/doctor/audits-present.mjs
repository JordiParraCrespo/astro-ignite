// doctor check: all 8 audit scripts exist.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, ok, error } from './_lib.mjs';

const required = [
  'i18n-parallels.mjs',
  'tokens-only.mjs',
  'no-react-in-atoms.mjs',
  'internal-links-localized.mjs',
  'consent-gated-analytics.mjs',
  'banner-pipeline.mjs',
  'cli-dep-stripping.mjs',
  'jsonld-graph.mjs',
  'sitemap-priority.mjs',
  'run-all.mjs',
];

export async function check() {
  const findings = [];
  const missing = [];
  for (const name of required) {
    const path = join(ROOT, 'scripts/audit', name);
    if (!existsSync(path)) missing.push(name);
  }
  if (missing.length === 0) {
    findings.push(ok('audits-present', `all ${required.length} audit scripts present`));
  } else {
    findings.push(error(
      'audits-present',
      `missing ${missing.length} audit script(s): ${missing.join(', ')}`,
      `Create the missing file(s) under scripts/audit/. See openspec/specs/<capability>/spec.md for the invariant they should enforce.`,
    ));
  }
  return findings;
}
