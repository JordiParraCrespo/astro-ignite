---
'astro-ignite': minor
'create-astro-ignite': minor
---

Bring the docs template to parity with the starter template on two
production-grade build-config knobs:

- `build.inlineStylesheets: 'always'` — every first-party stylesheet
  is inlined into the emitted HTML, eliminating the render-blocking
  `<link rel="stylesheet">` round-trip on first paint. Trades a few KB
  of CSS duplicated into every HTML page for an FCP / Speed-Index win
  on a content-light docs site. Matches the rationale the starter
  template already records.
- `sitemap()` integration default `priority: 0.7` plus a
  `serialize(item)` callback that lifts the landing page (`pathname ===
  '/'`) to `1.0` and demotes any URL containing `/legal/` to `0.3`.
  Brings docs sitemap priority signalling to parity with starter so the
  canonical entry point outranks legal boilerplate.

Config-only — no new runtime dependencies, no new components, no markup
changes. End users who scaffolded an earlier docs site can mirror the
two-block diff back into their project's `astro.config.mjs` to pick up
the same defaults; the change does not auto-apply to existing
scaffolded sites.
