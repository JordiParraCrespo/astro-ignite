#!/usr/bin/env node
// Audit: analytics scripts are consent-gated, cookie banner exists,
// cookie policy page exists and is linked, analytics tag is boundary-isolated.
// Maps to: openspec/specs/templates-consent/spec.md I1-I4.

import { join, relative } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROOT, walkFiles, grepFiles, emitResult, flag, exists, templateDirs } from './_lib.mjs';

const argv = process.argv.slice(2);
const checkBanner = flag(argv, 'banner');
const checkPolicy = flag(argv, 'policy');
const checkBoundary = flag(argv, 'boundary');

const hits = [];

for (const tpl of await templateDirs()) {
  // Templates without analytics opt out entirely (docs may not ship Plausible)
  const analytics = (await walkFiles(join(tpl, 'src'), (full, n) => n === 'Analytics.astro'))[0];

  if (analytics) {
    // I1 — Analytics.astro renders <script> only after consent
    const content = await readFile(analytics, 'utf8');
    const hasGate = /(?:consent|hasConsent|cookieConsent|granted|opted)/i.test(content);
    const hasScriptTag = /<script\b/.test(content);
    if (hasScriptTag && !hasGate) {
      hits.push({ file: relative(ROOT, analytics), line: 0, snippet: 'Analytics.astro renders <script> without a consent guard', message: 'I1 ungated analytics' });
    }
  }

  if (checkBanner) {
    // I2 — CookieBanner present and rendered in the base layout
    const banner = (await walkFiles(join(tpl, 'src'), (full, n) => n === 'CookieBanner.astro'))[0];
    if (analytics && !banner) {
      hits.push({ file: relative(ROOT, join(tpl, 'src/components')), line: 0, snippet: 'Analytics.astro present but no CookieBanner.astro', message: 'I2 banner missing' });
    } else if (banner) {
      // ensure the base layout imports CookieBanner
      const layouts = await walkFiles(join(tpl, 'src/layouts'), (full, n) => n.endsWith('.astro'));
      const baseLayout = layouts.find((l) => /Base|Layout|RootLayout/.test(l));
      if (baseLayout) {
        const layoutContent = await readFile(baseLayout, 'utf8');
        if (!/CookieBanner/.test(layoutContent)) {
          hits.push({ file: relative(ROOT, baseLayout), line: 0, snippet: 'base layout does not render CookieBanner', message: 'I2 banner not in layout' });
        }
      }
    }
  }

  if (checkPolicy) {
    // I3 — cookie policy page exists; banner links to it
    const banner = (await walkFiles(join(tpl, 'src'), (full, n) => n === 'CookieBanner.astro'))[0];
    if (banner) {
      const policyPage = (await walkFiles(join(tpl, 'src/pages'), (full, n) => /cookies?\.(astro|mdx?)$/i.test(n)))[0];
      if (!policyPage) {
        hits.push({ file: relative(ROOT, banner), line: 0, snippet: 'CookieBanner present but no /legal/cookies(.astro|.mdx) page', message: 'I3 policy page missing' });
      } else {
        const bannerContent = await readFile(banner, 'utf8');
        if (!/cookies?|legal/i.test(bannerContent)) {
          hits.push({ file: relative(ROOT, banner), line: 0, snippet: 'CookieBanner does not link to cookie policy', message: 'I3 policy link missing' });
        }
      }
    }
  }

  if (checkBoundary) {
    // I4 — analytics tag (plausible.io / plausible script) appears only inside Analytics.astro
    const all = await walkFiles(join(tpl, 'src'), (full, name) => /\.(astro|ts|tsx|mdx?)$/.test(name));
    const plausibleHits = await grepFiles(all, /plausible\.io|plausible-tracker/i);
    for (const h of plausibleHits) {
      if (!h.file.endsWith('Analytics.astro')) {
        hits.push({ ...h, audit: 'I4-boundary' });
      }
    }
  }
}

emitResult({
  audit: 'consent-gated-analytics',
  pass: hits.length === 0,
  hits,
  notes: hits.length === 0 ? 'consent + banner + policy + boundary all clean' : `${hits.length} violation(s)`,
});
