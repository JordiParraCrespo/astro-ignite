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

// Blank out comment regions (`/* */`, `//`, `<!-- -->`) before scanning so that
// JSDoc usage examples and other documentation don't read as rendered links —
// comments never reach the HTML output. Newlines are preserved so reported line
// numbers stay aligned with the original source.
function blankComments(content) {
  let out = '';
  let state = 'code'; // 'code' | 'block' | 'html' | 'line'
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (state === 'code') {
      if (content.startsWith('/*', i)) {
        state = 'block';
        out += '  ';
        i += 1;
      } else if (content.startsWith('<!--', i)) {
        state = 'html';
        out += '    ';
        i += 3;
      } else if (content.startsWith('//', i)) {
        state = 'line';
        out += '  ';
        i += 1;
      } else {
        out += c;
      }
    } else if (state === 'block') {
      if (content.startsWith('*/', i)) {
        state = 'code';
        out += '  ';
        i += 1;
      } else {
        out += c === '\n' ? '\n' : ' ';
      }
    } else if (state === 'html') {
      if (content.startsWith('-->', i)) {
        state = 'code';
        out += '   ';
        i += 2;
      } else {
        out += c === '\n' ? '\n' : ' ';
      }
    } else {
      // line comment — runs to end of line
      if (c === '\n') {
        state = 'code';
        out += '\n';
      } else {
        out += ' ';
      }
    }
  }
  return out;
}

for (const file of files) {
  const content = await readFile(file, 'utf8');
  const lines = blankComments(content).split('\n');
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
  notes:
    hits.length === 0
      ? `scanned ${files.length} file(s)`
      : `${hits.length} hardcoded internal link(s)`,
});
