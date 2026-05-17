#!/usr/bin/env node
// Audit: registry atoms (and optionally blocks) contain no React / Vue /
// Svelte / Radix imports. Names-only exports. Family layout.
// Maps to: openspec/specs/registry-atoms/spec.md I1-I4 (and registry-blocks I1).

import { join, relative, basename } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { ROOT, walkFiles, grepFiles, emitResult, flag, exists } from './_lib.mjs';

const argv = process.argv.slice(2);
const includeBlocks = flag(argv, 'include-blocks');
const namedOnly = flag(argv, 'named-only');
const checkRegistry = flag(argv, 'registry');
const checkFamilyLayout = flag(argv, 'family-layout');
const checkNoReimpl = flag(argv, 'no-reimpl');
const checkBlockDeps = flag(argv, 'block-deps');

const hits = [];

const base = join(ROOT, 'packages/registry/base');
const blocks = join(ROOT, 'packages/registry/blocks');

const roots = [];
if (exists(base)) roots.push(base);
if (includeBlocks && exists(blocks)) roots.push(blocks);

const files = [];
for (const root of roots) {
  files.push(...(await walkFiles(root, (full, name) => /\.(astro|ts|tsx|jsx|svelte|vue)$/.test(name))));
}

// I1 — no React / Vue / Svelte / Radix / headless-ui imports
const forbiddenImport = /from\s+['"](react|react-dom|vue|svelte|solid-js|preact|@radix-ui\/[^'"]+|@headlessui\/[^'"]+|@nextui-org\/[^'"]+)['"]/;
for (const f of await grepFiles(files, forbiddenImport)) {
  hits.push({ ...f, audit: 'I1-framework-import' });
}

if (namedOnly) {
  // I2 — no default exports
  for (const f of files) {
    if (!/\.(ts|tsx)$/.test(f)) continue; // .astro default exports are fine (the component itself)
    const content = await readFile(f, 'utf8');
    if (/^export\s+default\b/m.test(content)) {
      hits.push({ file: relative(ROOT, f), line: 0, snippet: 'default export found', message: 'no default exports in atom source' });
    }
  }
}

if (checkRegistry) {
  // I3 — every atom in registry.json depends transitively on cn
  const manifest = join(ROOT, 'packages/registry/registry.json');
  if (exists(manifest)) {
    const reg = JSON.parse(await readFile(manifest, 'utf8'));
    const items = reg.items ?? reg ?? [];
    for (const item of items) {
      if (item.type !== 'registry:ui' && item.type !== 'registry:component' && !item.name) continue;
      const deps = item.registryDependencies ?? [];
      if (item.name !== 'cn' && !deps.includes('cn')) {
        hits.push({ file: 'packages/registry/registry.json', line: 0, snippet: `item "${item.name}" does not depend on cn`, message: 'missing cn dependency' });
      }
    }
  }
}

if (checkFamilyLayout) {
  // I4 — compound families (card, tabs, accordion, dialog, dropdown-menu) live in base/<family>/
  const expectedFamilies = ['card', 'tabs', 'accordion', 'dialog', 'dropdown-menu'];
  if (exists(base)) {
    for (const family of expectedFamilies) {
      const familyDir = join(base, family);
      const flatFile = join(base, `${family}.astro`);
      if (exists(flatFile) && !exists(familyDir)) {
        hits.push({ file: relative(ROOT, flatFile), line: 0, snippet: `flat ${family}.astro found; expected base/${family}/ folder`, message: 'family should be a folder' });
      }
    }
  }
}

if (checkNoReimpl) {
  // registry-blocks I3 — blocks compose atoms, don't redeclare them
  if (exists(blocks)) {
    const blockFiles = await walkFiles(blocks, (full, name) => /\.(astro|ts|tsx)$/.test(name));
    // Heuristic: a block file that defines Card / Button / Badge inline (top-level export) is suspicious
    const reimplPattern = /(?:export\s+(?:const|function|class)\s+|^export\s+default\s+)(Card|Button|Badge|Input|Label)\b/;
    for (const f of await grepFiles(blockFiles, reimplPattern)) {
      hits.push({ ...f, audit: 'block-reimpl' });
    }
  }
}

if (checkBlockDeps) {
  // registry-blocks I4 — block entries in registry.json declare atom deps
  const manifest = join(ROOT, 'packages/registry/registry.json');
  if (exists(manifest)) {
    const reg = JSON.parse(await readFile(manifest, 'utf8'));
    const items = reg.items ?? reg ?? [];
    for (const item of items) {
      if (item.kind !== 'block' && item.type !== 'registry:block') continue;
      const deps = item.registryDependencies ?? [];
      if (deps.length < 1) {
        hits.push({ file: 'packages/registry/registry.json', line: 0, snippet: `block "${item.name}" declares no atom deps`, message: 'block missing registryDependencies' });
      }
    }
  }
}

emitResult({
  audit: 'no-react-in-atoms',
  pass: hits.length === 0,
  hits,
  notes: hits.length === 0 ? `scanned ${files.length} file(s)` : `${hits.length} violation(s)`,
});
