#!/usr/bin/env node
// Audit: every template under packages/templates/<kind>/ ships:
//   1) build.inlineStylesheets: 'always' (templates-perf delta),
//   2) when astro.config.mjs registers @astrojs/sitemap, the sitemap()
//      call carries a default `priority:` literal and a `serialize(item)`
//      callback that lifts pathname === '/' to 1.0 and demotes
//      `/legal/` URLs to 0.3 (templates-seo-jsonld delta).
//
// Maps to:
//   openspec/changes/docs-match-starter-perf-sitemap-config/
//   specs/{templates-perf,templates-seo-jsonld}/spec.md
// (and the long-lived spec once the change archives).

import { join, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROOT, emitResult, exists, templateDirs } from './_lib.mjs';

const hits = [];
const tplDirs = await templateDirs();
let templatesChecked = 0;

for (const tpl of tplDirs) {
  const cfg = join(tpl, 'astro.config.mjs');
  if (!exists(cfg)) continue;
  templatesChecked++;
  const content = await readFile(cfg, 'utf8');
  const file = relative(ROOT, cfg);

  // 1) inlineStylesheets: 'always'
  if (!/inlineStylesheets:\s*['"]always['"]/.test(content)) {
    hits.push({
      file,
      line: 0,
      snippet: "missing build.inlineStylesheets: 'always'",
      match: 'inlineStylesheets-always',
    });
  }

  // 2) sitemap priority + serialize (only when sitemap() is wired)
  if (/\bsitemap\s*\(/.test(content)) {
    if (!/priority:\s*0?\.7\b/.test(content)) {
      hits.push({
        file,
        line: 0,
        snippet: 'sitemap() call missing default `priority: 0.7`',
        match: 'sitemap-priority-default',
      });
    }
    if (!/serialize\s*\(\s*item\s*\)/.test(content)) {
      hits.push({
        file,
        line: 0,
        snippet: 'sitemap() call missing `serialize(item)` callback',
        match: 'sitemap-serialize',
      });
    }
    if (!/new URL\(item\.url\)\.pathname\s*===\s*['"]\/['"]/.test(content)) {
      hits.push({
        file,
        line: 0,
        snippet: "serialize() must lift pathname === '/' to priority 1.0",
        match: 'sitemap-serialize-landing',
      });
    }
    if (!/item\.url\.includes\(['"]\/legal\/['"]\)/.test(content)) {
      hits.push({
        file,
        line: 0,
        snippet: "serialize() must demote item.url.includes('/legal/') to priority 0.3",
        match: 'sitemap-serialize-legal',
      });
    }
  }
}

emitResult({
  audit: 'sitemap-priority',
  pass: hits.length === 0,
  hits,
  notes:
    hits.length === 0
      ? `scanned ${templatesChecked} template(s)`
      : `${hits.length} violation(s) across ${templatesChecked} template(s)`,
});
