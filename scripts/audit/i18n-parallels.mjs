#!/usr/bin/env node
// Audit: every page outside [lang]/ has a sibling under [lang]/.
// Maps to: openspec/specs/templates-i18n/spec.md I1, I2, I3, I4.

import { join, relative, basename } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { ROOT, walkFiles, emitResult, flag, exists, templateDirs } from './_lib.mjs';

const argv = process.argv.slice(2);
const strict = flag(argv, 'strict');
const checkContent = flag(argv, 'content');
const checkConfig = flag(argv, 'config');

const hits = [];

for (const tpl of await templateDirs()) {
  const pagesDir = join(tpl, 'src/pages');
  if (!exists(pagesDir)) continue;

  // I1, I2: page parallels
  const pages = await walkFiles(
    pagesDir,
    (full, name) => name.endsWith('.astro') || name.endsWith('.mdx')
  );
  for (const page of pages) {
    const rel = relative(pagesDir, page);
    if (rel.startsWith('[lang]/') || rel.startsWith('[lang]\\')) continue;
    // 404 and 500 are Astro's special error pages — emitted once at the root,
    // matched by name; a [lang]/ parallel would never be used as the handler.
    if (basename(rel) === '404.astro' || basename(rel) === '500.astro') continue;
    const parallel = join(pagesDir, '[lang]', rel);
    if (!exists(parallel)) {
      hits.push({
        file: relative(ROOT, page),
        line: 0,
        snippet: `missing parallel at src/pages/[lang]/${rel}`,
        message: 'parallel missing',
      });
    }
  }

  if (strict) {
    // I2: spot-check that [lang]/*.astro contains getStaticPaths
    const langPages = await walkFiles(join(pagesDir, '[lang]'), (full, name) =>
      name.endsWith('.astro')
    );
    for (const page of langPages) {
      const content = await readFile(page, 'utf8');
      if (!/getStaticPaths/.test(content)) {
        hits.push({
          file: relative(ROOT, page),
          line: 0,
          snippet: 'no getStaticPaths in [lang] page',
          message: 'missing getStaticPaths',
        });
      }
    }
  }

  if (checkContent) {
    // I3: content collections under <collection>/<locale>/<slug>
    const contentDir = join(tpl, 'src/content');
    if (exists(contentDir)) {
      const collections = await readdir(contentDir, { withFileTypes: true });
      for (const coll of collections) {
        if (!coll.isDirectory() || coll.name.startsWith('_')) continue;
        const collDir = join(contentDir, coll.name);
        const inside = await readdir(collDir, { withFileTypes: true });
        const looseFiles = inside.filter((e) => e.isFile() && /\.(mdx?|md)$/.test(e.name));
        if (looseFiles.length > 0) {
          for (const lf of looseFiles) {
            hits.push({
              file: relative(ROOT, join(collDir, lf.name)),
              line: 0,
              snippet: `loose ${lf.name} in collection root; expected <locale>/<slug>`,
              message: 'loose content file',
            });
          }
        }
      }
    }
  }

  if (checkConfig) {
    // I4: siteConfig.locales defaults to ['en']
    const siteConfig = join(tpl, 'src/lib/site-config.ts');
    if (exists(siteConfig)) {
      const content = await readFile(siteConfig, 'utf8');
      if (!/locales\s*:\s*\[\s*['"]en['"]\s*\]/.test(content)) {
        hits.push({
          file: relative(ROOT, siteConfig),
          line: 0,
          snippet: 'siteConfig.locales does not default to ["en"]',
          message: 'locales default drift',
        });
      }
    }
  }
}

emitResult({
  audit: 'i18n-parallels',
  pass: hits.length === 0,
  hits,
  notes:
    hits.length === 0
      ? `scanned ${(await templateDirs()).length} template(s)`
      : `${hits.length} violation(s)`,
});
