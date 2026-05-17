// doctor check: every boundary AGENTS.md has a matching CLAUDE.md symlink.

import { lstat, readlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { ROOT, ok, warn } from './_lib.mjs';

const boundaryDirs = [
  'packages/create-astro-ignite',
  'packages/templates/starter',
  'packages/templates/docs',
  'packages/registry',
  'packages/design-fetch',
  'apps/site',
  'apps/docs',
  'scripts/audit',
];

export async function check() {
  const findings = [];
  const missing = [];
  const wrongSymlink = [];

  for (const rel of boundaryDirs) {
    const dir = join(ROOT, rel);
    if (!existsSync(dir)) continue; // package may not exist yet (e.g., design-fetch is referenced but not present)
    const agents = join(dir, 'AGENTS.md');
    const claude = join(dir, 'CLAUDE.md');
    if (!existsSync(agents)) {
      missing.push(`${rel}/AGENTS.md`);
      continue;
    }
    if (!existsSync(claude)) {
      missing.push(`${rel}/CLAUDE.md (symlink)`);
      continue;
    }
    try {
      const st = await lstat(claude);
      if (!st.isSymbolicLink()) {
        wrongSymlink.push(`${rel}/CLAUDE.md exists but is not a symlink`);
        continue;
      }
      const target = await readlink(claude);
      if (basename(target) !== 'AGENTS.md') {
        wrongSymlink.push(`${rel}/CLAUDE.md → ${target} (expected AGENTS.md)`);
      }
    } catch (e) {
      wrongSymlink.push(`${rel}/CLAUDE.md: ${e.message}`);
    }
  }

  if (missing.length === 0 && wrongSymlink.length === 0) {
    findings.push(ok('boundary-symlinks', `${boundaryDirs.length} boundary dir(s) checked; all AGENTS.md present with CLAUDE.md symlink`));
  } else {
    if (missing.length) {
      findings.push(warn(
        'boundary-symlinks',
        `missing boundary files: ${missing.join(', ')}`,
        `cd into each dir and: touch AGENTS.md (with the boundary template) && ln -s AGENTS.md CLAUDE.md`,
      ));
    }
    if (wrongSymlink.length) {
      findings.push(warn(
        'boundary-symlinks',
        `bad CLAUDE.md links: ${wrongSymlink.join('; ')}`,
        `cd into each dir and: rm CLAUDE.md && ln -s AGENTS.md CLAUDE.md`,
      ));
    }
  }
  return findings;
}
