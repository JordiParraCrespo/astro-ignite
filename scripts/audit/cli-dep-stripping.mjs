#!/usr/bin/env node
// Audit: scaffold.ts strips deps the target template doesn't need;
// templates using Actions pin @astrojs/node@^10; no scaffolded output
// imports from astro-ignite/*; PM detection covers pnpm/npm/yarn/bun.
// Maps to: openspec/specs/cli-scaffold/spec.md I1-I4.

import { join, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROOT, walkFiles, grepFiles, emitResult, flag, exists, templateDirs } from './_lib.mjs';

const argv = process.argv.slice(2);
const checkAdapter = flag(argv, 'adapter');
const checkNoImports = flag(argv, 'no-imports');
const checkPm = flag(argv, 'pm');

const hits = [];

const scaffold = join(ROOT, 'packages/create-astro-ignite/src/scaffold.ts');
if (exists(scaffold)) {
  const content = await readFile(scaffold, 'utf8');

  // I1 — rewritePackageJson exists and references email-style dep stripping
  if (!/rewritePackageJson/.test(content)) {
    hits.push({ file: 'packages/create-astro-ignite/src/scaffold.ts', line: 0, snippet: 'no rewritePackageJson function', message: 'I1 missing rewriter' });
  }
  if (!/src\/lib\/email/.test(content) && !/resend/i.test(content)) {
    hits.push({ file: 'packages/create-astro-ignite/src/scaffold.ts', line: 0, snippet: 'rewritePackageJson does not reference src/lib/email or resend', message: 'I1 no email-strip branch' });
  }
}

if (checkAdapter) {
  // I2 — every template that uses Astro Actions pins @astrojs/node@^10
  for (const tpl of await templateDirs()) {
    const pkgPath = join(tpl, 'package.json');
    if (!exists(pkgPath)) continue;
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

    // Check if template uses Actions
    const usesActions = (await walkFiles(join(tpl, 'src'), (full, n) => n === 'actions' || /\.actions\.(ts|js)$/.test(n))).length > 0
      || exists(join(tpl, 'src/actions'))
      || exists(join(tpl, 'src/actions/index.ts'));

    if (usesActions) {
      const adapter = deps['@astrojs/node'];
      if (!adapter) {
        hits.push({ file: relative(ROOT, pkgPath), line: 0, snippet: 'template uses Actions but @astrojs/node not pinned', message: 'I2 adapter missing' });
      } else if (!/\^?10(\.|$)/.test(adapter)) {
        hits.push({ file: relative(ROOT, pkgPath), line: 0, snippet: `@astrojs/node pinned to ${adapter}; required ^10`, message: 'I2 wrong adapter major' });
      }
    }
  }
}

if (checkNoImports) {
  // I3 — scaffolded apps (apps/site, apps/docs, apps/playground) don't import from astro-ignite/*
  // Note: this audit assumes you've scaffolded these from templates; for the source templates,
  // the same rule applies — they ship as standalone projects.
  const targets = ['apps/site', 'apps/docs', 'packages/templates'];
  for (const t of targets) {
    const root = join(ROOT, t);
    if (!exists(root)) continue;
    const files = await walkFiles(root, (full, name) => /\.(astro|ts|tsx|mjs|js)$/.test(name));
    const bad = await grepFiles(files, /from\s+['"]astro-ignite(?:\/[^'"]+)?['"]|from\s+['"]create-astro-ignite(?:\/[^'"]+)?['"]/);
    for (const h of bad) hits.push({ ...h, audit: 'I3-import-leak' });
  }
}

if (checkPm) {
  // I4 — pm.ts detects pnpm / npm / yarn / bun
  const pmPath = join(ROOT, 'packages/create-astro-ignite/src/pm.ts');
  if (exists(pmPath)) {
    const content = await readFile(pmPath, 'utf8');
    const required = ['pnpm', 'npm', 'yarn', 'bun'];
    for (const pm of required) {
      if (!new RegExp(`['"\`]${pm}['"\`]`).test(content)) {
        hits.push({ file: relative(ROOT, pmPath), line: 0, snippet: `pm.ts does not reference '${pm}'`, message: `I4 no ${pm} detection` });
      }
    }
  }
}

emitResult({
  audit: 'cli-dep-stripping',
  pass: hits.length === 0,
  hits,
  notes: hits.length === 0 ? 'cli contract intact' : `${hits.length} violation(s)`,
});
