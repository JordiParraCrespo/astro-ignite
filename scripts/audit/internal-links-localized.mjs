#!/usr/bin/env node
// Audit: internal links use getRelativeLocaleUrl(lang, path), never hardcoded `/foo`.
// Maps to: openspec/specs/templates-i18n/spec.md I5.

import { join, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROOT, walkFiles, emitResult, exists, templateDirs } from './_lib.mjs';

const hits = [];

const targets = [];
for (const tpl of await templateDirs()) {
  const pages = join(tpl, 'src/pages');
  const components = join(tpl, 'src/components');
  if (exists(pages)) targets.push(pages);
  if (exists(components)) targets.push(components);
}

const files = [];
for (const root of targets) {
  files.push(...(await walkFiles(root, (full, name) => /\.(astro|mdx?)$/.test(name))));
}

// Hardcoded internal href: href="/foo" or href={`/foo`} or href={'/foo'} where the path doesn't
// flow through getRelativeLocaleUrl on the same line.
// Allow: external (http(s)://), anchors (#), mailto:, tel:, and `getRelativeLocaleUrl(`.
const hrefPattern = /\bhref\s*=\s*(?:["']\/[^"']*["']|\{[`'"]\/[^`'"]*[`'"]\})/g;

for (const file of files) {
  const content = await readFile(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/getRelativeLocaleUrl\s*\(/.test(line)) continue;
    const matches = line.match(hrefPattern);
    if (!matches) continue;
    for (const m of matches) {
      if (/href\s*=\s*["']\/{2,}/.test(m)) continue; // protocol-relative
      hits.push({
        file: relative(ROOT, file),
        line: i + 1,
        snippet: line.trim().slice(0, 200),
        match: m,
      });
    }
  }
}

emitResult({
  audit: 'internal-links-localized',
  pass: hits.length === 0,
  hits,
  notes: hits.length === 0 ? `scanned ${files.length} file(s)` : `${hits.length} hardcoded internal link(s)`,
});
