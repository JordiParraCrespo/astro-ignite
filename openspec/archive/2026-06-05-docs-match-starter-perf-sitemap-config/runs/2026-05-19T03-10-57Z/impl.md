# Implementation — docs-match-starter-perf-sitemap-config

Run: `2026-05-19T03-10-57Z`.

## Summary

Brings the docs template to parity with the starter template on the
two production-grade build-config knobs the starter already ships:
`build.inlineStylesheets: 'always'` and a sitemap `serialize(item)`
callback with the documented `/ = 1.0`, `/legal/* = 0.3`, default
`0.7` priority shape. The same edits are mirrored byte-for-byte into
`apps/docs/astro.config.mjs` per the apps/docs mirror rule. A
minor-bump changeset documents the change for end users who scaffolded
earlier; no runtime deps are added on either side. A small audit
script `scripts/audit/sitemap-priority.mjs` is registered in
`scripts/doctor/audits-present.mjs` and wired into this change's
design.md so `pnpm audit:invariants --change` enforces the parity rule
in CI on every future run.

## Traceability

### Scenarios → verification

| Scenario                                                    | Verification                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1 — `inlineStylesheets: 'always'` in docs template         | `packages/templates/docs/astro.config.mjs:18` + audit `sitemap-priority` PASS (regex `inlineStylesheets:\s*['"]always['"]`)                                                                                                                                                          |
| S2 — sitemap default priority + serialize in docs template  | `packages/templates/docs/astro.config.mjs:33–41` + audit `sitemap-priority` PASS (regexes for default `priority:` literal, `serialize(item)` callback, landing branch, `/legal/` branch)                                                                                             |
| S3 — apps/docs mirror byte-equivalent                       | `apps/docs/astro.config.mjs:18` + `:33–41` + audit `sitemap-priority` PASS                                                                                                                                                                                                           |
| S4 — built HTML inlines all first-party CSS (template)      | `runs/2026-05-19T03-10-57Z/notes.md` T9 section: 6/6 HTML files contain `<style>`, 0/6 first-party `<link rel="stylesheet" href="/_astro/...">` matches                                                                                                                              |
| S5 — generated sitemap reflects priority signals (template) | `runs/2026-05-19T03-10-57Z/notes.md` T10 section: `/` = 1.0, three `/legal/*` = 0.3, `/quick-start/` + `/roadmap/` = 0.7                                                                                                                                                             |
| S6 — apps/docs build same inline-CSS + sitemap shape        | `runs/2026-05-19T03-10-57Z/notes.md` T11 section: 65/65 HTML files inline `<style>`, 0/65 first-party stylesheet links; sitemap landing = 1.0, six `/legal/` = 0.3, others = 0.7                                                                                                     |
| S7 — no runtime dependencies added                          | `runs/2026-05-19T03-10-57Z/notes.md` T5 section: `git diff main -- packages/templates/docs/package.json apps/docs/package.json` empty                                                                                                                                                |
| S8 — format / typecheck / test / audit / scaffold pass      | `pnpm format:check` PASS, `pnpm typecheck` PASS, `pnpm test` 9/9 PASS, `pnpm audit:invariants --change …` dispatches new audit (PASS) alongside pre-existing failures (Lighthouse infra gap + `tokens-only` site.ts hex hits, both reproducing on `main`), `pnpm scaffold:test` PASS |
| S9 — perf budget holds                                      | `runs/2026-05-19T03-10-57Z/perf.txt`: dep-count PASS; Lighthouse deferred to CI (binary not installed in implementer env, same gap as restructure-starter-template-component-o run on `main`)                                                                                        |
| S10 — changeset documents the parity bump                   | `.changeset/docs-perf-sitemap-defaults.md` (minor bump `astro-ignite` + `create-astro-ignite`)                                                                                                                                                                                       |

### Invariants → audit result

| Invariant                                                                                        | Audit                                                  | Result                                                                                             |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `templates-perf` I1 — Lighthouse mobile ≥ 95 on `/`                                              | `node scripts/perf/run.mjs --page /`                   | deferred to CI (no Lighthouse binary in env)                                                       |
| `templates-perf` I2 — Lighthouse mobile ≥ 95 on `/quick-start`                                   | `node scripts/perf/run.mjs --page /quick-start`        | deferred to CI                                                                                     |
| `templates-perf` I3 — total transfer ≤ 150 KB                                                    | `node scripts/perf/run.mjs --transfer`                 | "not yet wired; run after Lighthouse integration lands" (pre-existing infra gap)                   |
| `templates-perf` I4 — critical CSS inlined                                                       | `node scripts/perf/run.mjs --critical-css`             | **PASS** — `Critical CSS inlined in apps/docs/dist/index.html — inline <style> found`              |
| `templates-perf` I5 — no undeclared runtime dep                                                  | `node scripts/perf/run.mjs --deps`                     | **PASS** — 12 (starter) + 8 (docs) runtime deps unchanged                                          |
| `templates-perf` new requirement — every template ships `inlineStylesheets: 'always'`            | `node scripts/audit/sitemap-priority.mjs`              | **PASS** — scanned 2 template(s)                                                                   |
| `templates-perf` new requirement — emitted HTML carries no first-party `<link rel="stylesheet">` | inline check in `notes.md` (T9, T11)                   | **PASS** — 0 matches across 6 (template) + 65 (apps/docs) emitted HTML files                       |
| `templates-seo-jsonld` I1–I3 — `@graph` JSON-LD shape                                            | `node scripts/audit/jsonld-graph.mjs --strict --typed` | **PASS** — JSON-LD graph clean                                                                     |
| `templates-seo-jsonld` new requirement — sitemap `serialize` + default `priority`                | `node scripts/audit/sitemap-priority.mjs`              | **PASS** — scanned 2 template(s)                                                                   |
| `templates-seo-jsonld` new requirement — emitted sitemap XML reflects priority signals           | inline check in `notes.md` (T10, T11)                  | **PASS** — landing = 1.0, every `/legal/` = 0.3, guides = 0.7 in both `dist/sitemap-0.xml` outputs |

## Pre-existing audit failures (unrelated)

- `tokens-only` reports two `themeColor: '#…'` hex literals in
  `packages/templates/docs/src/config/site.ts:68` and
  `packages/templates/starter/src/config/site.ts:107`. These files are
  not touched by this change and the same hits reproduce on `main`
  (and were recorded in the immediately-prior change's `audit.md` —
  see `docs-add-404-page-with-i18n-locale-paral` run from
  2026-05-19T02-29-39Z).
- `node scripts/perf/run.mjs --page /` / `--transfer` etc. require a
  Lighthouse binary; the implementer environment has none. The same
  failures reproduce on `main`. See `perf.txt` for the CI reproduction
  steps the reviewer should run.

These are flagged for the reviewer; this change is config-only and
does not introduce either.

## Commits made

```
fda6b88 feat(scripts-audit): add sitemap-priority assertion + tasks/design updates
817b190 chore(changeset): prettier autoformat docs-perf-sitemap-defaults
8d71b5c chore(changeset): docs template inline-stylesheets-always + sitemap priority parity
a978f53 feat(apps-docs): mirror inline-stylesheets + sitemap priority into apps/docs
748402d feat(templates-docs): inline-stylesheets-always + sitemap priority parity with starter
```

(All committed via `scripts/committer --design`.)

## Open questions for the reviewer

- None blocking. Lighthouse re-run in CI is the only verification
  the implementer could not complete locally; see `perf.txt` for the
  expected directional impact and the reproduction commands.
