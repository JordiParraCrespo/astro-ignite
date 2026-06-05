# Implementation notes — docs-match-starter-perf-sitemap-config

Run: `2026-05-19T03-10-57Z`.

## T9 — docs template build: inline CSS, no first-party stylesheet links

Built `pnpm --filter @astro-ignite/template-docs build`. Emitted 6
HTML pages under `packages/templates/docs/dist/`:

- `./index.html`
- `./quick-start/index.html`
- `./roadmap/index.html`
- `./legal/privacy/index.html`
- `./legal/terms/index.html`
- `./legal/cookies/index.html`

Assertion checks:

- `<style>` block presence — `grep -c '<style' dist/**/*.html`
  reports `1` for every page (6/6 ✓).
- First-party stylesheet links —
  `grep -E '<link[^>]+rel="stylesheet"[^>]+href="/_astro/'` matches
  zero times across the entire `dist/` tree (0/6 ✓).

## T10 — docs template sitemap priorities

`packages/templates/docs/dist/sitemap-0.xml` (excerpt, formatted for
readability):

```xml
<url><loc>http://localhost:4321/</loc>
  <changefreq>weekly</changefreq><priority>1.0</priority></url>
<url><loc>http://localhost:4321/legal/cookies/</loc>
  <changefreq>weekly</changefreq><priority>0.3</priority></url>
<url><loc>http://localhost:4321/legal/privacy/</loc>
  <changefreq>weekly</changefreq><priority>0.3</priority></url>
<url><loc>http://localhost:4321/legal/terms/</loc>
  <changefreq>weekly</changefreq><priority>0.3</priority></url>
<url><loc>http://localhost:4321/quick-start/</loc>
  <changefreq>weekly</changefreq><priority>0.7</priority></url>
<url><loc>http://localhost:4321/roadmap/</loc>
  <changefreq>weekly</changefreq><priority>0.7</priority></url>
```

Assertions:

- Exactly one `<url>` with `<loc>http://localhost:4321/</loc>` and
  `<priority>1.0</priority>` ✓.
- Every `<url>` whose `<loc>` contains `/legal/` carries
  `<priority>0.3</priority>` (3/3 ✓).
- `/quick-start/` and `/roadmap/` carry `<priority>0.7</priority>` ✓.

## T11 — apps/docs build: same assertions

Built `pnpm --filter @astro-ignite/docs build`. Emitted 65 HTML
pages under `apps/docs/dist/`.

Inline-CSS assertions:

- `<style>` block presence — every one of the 65 HTML files contains
  exactly one `<style>` tag (65/65 ✓).
- First-party stylesheet links —
  `grep -E '<link[^>]+rel="stylesheet"[^>]+href="/_astro/'` matches
  zero times across the entire `apps/docs/dist/` tree (0/65 ✓).

Sitemap assertions against `apps/docs/dist/sitemap-0.xml`:

- One `<url>` for `https://docs.astroignite.dev/` with
  `<priority>1.0</priority>` ✓.
- Six `<url>` entries containing `/legal/` (3 default-locale + 3
  Spanish locale), every one carrying `<priority>0.3</priority>` ✓.
- Multiple guide-page entries (`/quick-start/`, `/components/*`,
  `/blocks/*`, `/templates/`, `/benchmarks/`, `/design/`, `/features/`,
  `/releases/`, `/roadmap/`) carry `<priority>0.7</priority>` ✓.

## T5 — package.json dependencies

`git diff main -- packages/templates/docs/package.json
apps/docs/package.json` is empty. No `dependencies` /
`peerDependencies` entries added. Scenario S7 / `templates-perf` I5
satisfied.
