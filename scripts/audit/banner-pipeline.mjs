#!/usr/bin/env node
// Audit: banners come from claude-design HTML → headless Chrome → PNG.
// No satori / @vercel/og / resvg. No inline SVG hero imagery. Every
// heroImage has a matching HTML source. Banner CSS uses tokens.
// Maps to: openspec/specs/banner-pipeline/spec.md I1-I4.

import { join, relative, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROOT, walkFiles, grepFiles, emitResult, flag, exists } from './_lib.mjs';

const argv = process.argv.slice(2);
const checkNoTextToImage = flag(argv, 'no-text-to-image');
const checkHtmlSource = flag(argv, 'html-source');
const checkTokens = flag(argv, 'tokens');

const hits = [];

// I1 — no inline <svg> hero imagery in MDX
const blogContent = join(ROOT, 'apps/site/src/content/blog');
if (exists(blogContent)) {
  const mdxFiles = await walkFiles(blogContent, (full, n) => n.endsWith('.mdx') || n.endsWith('.md'));
  for (const file of mdxFiles) {
    const content = await readFile(file, 'utf8');
    // Detect inline <svg> blocks that are non-trivial (height > 100 lines or contains <path with d=)
    if (/<svg\b[^>]*>[\s\S]*?<path\s+d=/i.test(content)) {
      hits.push({ file: relative(ROOT, file), line: 0, snippet: 'inline <svg> with <path d="..."> found in MDX', message: 'I1 inline SVG hero' });
    }
  }
}

if (checkNoTextToImage) {
  // I2 — no satori / @vercel/og / resvg imports anywhere
  const all = await walkFiles(ROOT, (full, name) => {
    if (full.includes('node_modules')) return false;
    if (full.includes('/openspec/archive')) return false;
    return /\.(astro|ts|tsx|mjs|js)$/.test(name);
  });
  const ttiHits = await grepFiles(all, /from\s+['"](satori|@vercel\/og|@resvg\/resvg-js|resvg-js)['"]/);
  for (const h of ttiHits) hits.push({ ...h, audit: 'I2-text-to-image' });
}

if (checkHtmlSource) {
  // I3 — every heroImage frontmatter reference has a matching HTML source
  const blogContent2 = join(ROOT, 'apps/site/src/content/blog');
  const bannersDir = join(ROOT, 'apps/site/scripts/banners');
  if (exists(blogContent2)) {
    const mdxFiles = await walkFiles(blogContent2, (full, n) => n.endsWith('.mdx') || n.endsWith('.md'));
    for (const file of mdxFiles) {
      const content = await readFile(file, 'utf8');
      const match = content.match(/heroImage\s*:\s*["']?(?:\.\/_assets\/)?hero-([a-z0-9-]+)\.png["']?/i);
      if (!match) continue;
      const slug = match[1];
      const htmlSource = join(bannersDir, `${slug}.html`);
      if (!exists(htmlSource)) {
        hits.push({ file: relative(ROOT, file), line: 0, snippet: `heroImage hero-${slug}.png referenced but ${relative(ROOT, htmlSource)} missing`, message: 'I3 no HTML source' });
      }
    }
  }
}

if (checkTokens) {
  // I4 — banner CSS uses var(...) references, not raw hex (allow only #000/#fff)
  const bannerCss = join(ROOT, 'apps/site/scripts/banners/banner.css');
  if (exists(bannerCss)) {
    const content = await readFile(bannerCss, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const hex = lines[i].match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{8}\b/);
      if (hex && !/#(000000|ffffff|FFFFFF)\b/.test(hex[0])) {
        hits.push({ file: relative(ROOT, bannerCss), line: i + 1, snippet: lines[i].trim(), match: hex[0], message: 'I4 raw hex in banner.css' });
      }
    }
  }
}

emitResult({
  audit: 'banner-pipeline',
  pass: hits.length === 0,
  hits,
  notes: hits.length === 0 ? 'banner pipeline clean' : `${hits.length} violation(s)`,
});
