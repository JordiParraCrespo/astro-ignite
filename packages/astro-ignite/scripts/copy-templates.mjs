#!/usr/bin/env node
/**
 * Pre-pack step: copy `packages/templates/<kind>/` into `./templates/<kind>/`
 * so the CLI ships a self-contained npm package.
 *
 * Skips build artefacts (`node_modules/`, `dist/`, `.astro/`, lockfiles) and
 * renames `_gitignore` → `.gitignore` so the scaffolded project starts with
 * a proper ignore file (npm strips dotfiles otherwise).
 *
 * Invoked by `pnpm pack` / `npm publish` via the package's `prepack` script.
 */

import { cp, rm, mkdir, readdir, stat, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const SRC = resolve(PKG_ROOT, '..', 'templates');
const DST = resolve(PKG_ROOT, 'templates');

const SKIP = new Set([
  'node_modules',
  'dist',
  '.astro',
  '.turbo',
  '.cache',
  '.vercel',
  '.netlify',
  '.wrangler',
]);

await rm(DST, { recursive: true, force: true });
await mkdir(DST, { recursive: true });

const templates = await readdir(SRC, { withFileTypes: true });
for (const ent of templates) {
  if (!ent.isDirectory()) continue;
  const from = join(SRC, ent.name);
  const to = join(DST, ent.name);

  await cp(from, to, {
    recursive: true,
    // Preserve symlinks (e.g. CLAUDE.md → AGENTS.md) byte-for-byte instead of
    // rewriting their targets when resolving against the destination dir.
    verbatimSymlinks: true,
    filter: (path) => {
      const segments = path.split('/').filter(Boolean);
      return !segments.some((s) => SKIP.has(s));
    },
  });

  // `_gitignore` → `.gitignore` (templates use `_` prefix so npm doesn't strip
  // them when packaging, and so they don't affect git inside the monorepo).
  const gitignorePath = join(to, '_gitignore');
  try {
    if ((await stat(gitignorePath)).isFile()) {
      await rename(gitignorePath, join(to, '.gitignore'));
    }
  } catch {
    // no _gitignore in this template — fine
  }

  console.log(`  ✓ copied template/${ent.name}`);
}

console.log(`prepack: templates copied to ${DST}`);
