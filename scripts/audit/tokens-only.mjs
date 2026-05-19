#!/usr/bin/env node
// Audit: components reference design tokens, never raw zinc / hex.
// Maps to: openspec/specs/templates-css-tokens/spec.md I1, I2, I3.
//
// The previous I4 ("Above-the-fold uses scoped <style> heuristic") was
// retired by `migrate-starter-template-to-tailwind-css`. The `--layered`
// flag stays accepted so older changes' design.md files do not break
// their `pnpm audit:invariants --change <name>` invocations; it is a
// no-op that prints a one-line deprecation notice on stderr and exits 0.

import { join, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROOT, walkFiles, grepFiles, emitResult, flag, exists, templateDirs } from './_lib.mjs';

const argv = process.argv.slice(2);
const checkConfig = flag(argv, 'config');
const checkDarkmode = flag(argv, 'darkmode');
const checkLayered = flag(argv, 'layered');

if (checkLayered) {
  process.stderr.write(
    'tokens-only: --layered is a deprecated no-op; the layered-CSS invariant was retired by migrate-starter-template-to-tailwind-css\n'
  );
  emitResult({
    audit: 'tokens-only',
    pass: true,
    hits: [],
    notes: '--layered: deprecated no-op',
  });
  process.exit(0);
}

const hits = [];

// Build the set of component files to scan (exclude global.css and tokens.css).
async function componentFiles() {
  const out = [];
  for (const tpl of await templateDirs()) {
    const src = join(tpl, 'src');
    if (!exists(src)) continue;
    const files = await walkFiles(src, (full, name) => {
      if (full.includes('/src/styles/')) return false;
      if (name === 'global.css' || name === 'tokens.css') return false;
      return /\.(astro|ts|tsx|css|mdx?)$/.test(name);
    });
    out.push(...files);
  }
  const registry = join(ROOT, 'packages/registry/base');
  if (exists(registry)) {
    const files = await walkFiles(registry, (full, name) => /\.(astro|ts|tsx|css)$/.test(name));
    out.push(...files);
  }
  return out;
}

const files = await componentFiles();

// I1 — no raw zinc classes
const zincHits = await grepFiles(files, /\b(?:bg|text|border|ring|from|to|via)-zinc-\d+/);
for (const h of zincHits) hits.push({ ...h, audit: 'I1-zinc' });

// I1 — no raw hex literals (allow zero alpha or 3-digit gray-ish tokens? Disallow everything; tokens use var())
const hexHits = await grepFiles(files, /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{8}\b/);
// allow #000 / #fff (often used in SVG fills inside HTML banner files); keep strict on long hex.
for (const h of hexHits) {
  if (/#(000000|ffffff|FFFFFF)\b/.test(h.match)) continue;
  hits.push({ ...h, audit: 'I1-hex' });
}

if (checkConfig) {
  // I2 — global.css defines --color-* tokens
  for (const tpl of await templateDirs()) {
    const gc = join(tpl, 'src/styles/global.css');
    if (!exists(gc)) {
      hits.push({ file: relative(ROOT, gc), line: 0, snippet: 'global.css missing', message: 'no global.css' });
      continue;
    }
    const content = await readFile(gc, 'utf8');
    const required = ['--color-bg', '--color-fg', '--color-primary', '--color-border'];
    for (const token of required) {
      if (!content.includes(token)) {
        hits.push({ file: relative(ROOT, gc), line: 0, snippet: `missing token ${token}`, message: `token ${token} missing` });
      }
    }
  }
}

if (checkDarkmode) {
  // I3 — .light class flips tokens (look for `.light` in global.css)
  for (const tpl of await templateDirs()) {
    const gc = join(tpl, 'src/styles/global.css');
    if (!exists(gc)) continue;
    const content = await readFile(gc, 'utf8');
    if (!/\.light\b/.test(content)) {
      hits.push({ file: relative(ROOT, gc), line: 0, snippet: 'no .light selector in global.css', message: 'tri-state darkmode wiring missing' });
    }
  }
}

emitResult({
  audit: 'tokens-only',
  pass: hits.length === 0,
  hits,
  notes: hits.length === 0 ? `scanned ${files.length} file(s)` : `${hits.length} violation(s)`,
});
