#!/usr/bin/env node
// Audit: layouts emit exactly one JSON-LD @graph; pages don't emit
// standalone JSON-LD; all graph nodes are typed via schema-dts.
// Maps to: openspec/specs/templates-seo-jsonld/spec.md I1-I3.

import { join, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROOT, walkFiles, grepFiles, emitResult, flag, exists, templateDirs } from './_lib.mjs';

const argv = process.argv.slice(2);
const strict = flag(argv, 'strict');
const checkTyped = flag(argv, 'typed');

const hits = [];

for (const tpl of await templateDirs()) {
  const layouts = join(tpl, 'src/layouts');
  const pages = join(tpl, 'src/pages');
  if (!exists(layouts)) continue;

  // I1 — layout(s) emit a single application/ld+json with @graph
  const layoutFiles = await walkFiles(layouts, (full, n) => n.endsWith('.astro'));
  for (const layout of layoutFiles) {
    const content = await readFile(layout, 'utf8');
    if (!/application\/ld\+json/.test(content)) continue; // layout may not own SEO
    const scriptCount = (content.match(/<script\s+type=["']application\/ld\+json["']/g) || []).length;
    if (scriptCount > 1) {
      hits.push({ file: relative(ROOT, layout), line: 0, snippet: `${scriptCount} JSON-LD scripts in one layout`, message: 'I1 multiple JSON-LD scripts' });
    }
    if (!/@graph/.test(content)) {
      hits.push({ file: relative(ROOT, layout), line: 0, snippet: 'layout emits JSON-LD without @graph composition', message: 'I1 no @graph' });
    }
  }

  if (strict && exists(pages)) {
    // I2 — pages don't emit standalone JSON-LD scripts
    const pageFiles = await walkFiles(pages, (full, n) => n.endsWith('.astro') || n.endsWith('.mdx'));
    for (const page of pageFiles) {
      const content = await readFile(page, 'utf8');
      if (/<script\s+type=["']application\/ld\+json["']/.test(content)) {
        hits.push({ file: relative(ROOT, page), line: 0, snippet: 'page emits its own JSON-LD; should contribute a node to the layout @graph instead', message: 'I2 standalone JSON-LD on page' });
      }
    }
  }

  if (checkTyped) {
    // I3 — schema-dts is in the template's deps and is imported by the SEO assembler
    const pkgPath = join(tpl, 'package.json');
    if (exists(pkgPath)) {
      const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
      const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      const seoAssembler = (await walkFiles(join(tpl, 'src/lib'), (full, n) => /graph\.(ts|js)$/.test(n) || n === 'seo.ts'))[0];
      if (seoAssembler) {
        // template ships SEO machinery; require schema-dts
        if (!deps['schema-dts']) {
          hits.push({ file: relative(ROOT, pkgPath), line: 0, snippet: 'SEO assembler present but schema-dts not in deps', message: 'I3 schema-dts missing' });
        } else {
          const content = await readFile(seoAssembler, 'utf8');
          if (!/from\s+['"]schema-dts['"]/.test(content)) {
            hits.push({ file: relative(ROOT, seoAssembler), line: 0, snippet: 'SEO assembler does not import schema-dts', message: 'I3 schema-dts unused' });
          }
        }
      }
    }
  }
}

emitResult({
  audit: 'jsonld-graph',
  pass: hits.length === 0,
  hits,
  notes: hits.length === 0 ? 'JSON-LD graph clean' : `${hits.length} violation(s)`,
});
