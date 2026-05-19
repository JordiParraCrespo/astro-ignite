# Tasks: docs-match-starter-perf-sitemap-config

Ordering rationale:

- Edit the source-of-truth template config (`packages/templates/docs/astro.config.mjs`)
  first so the diff is reviewable in isolation.
- Mirror to `apps/docs/astro.config.mjs` next so the two configs
  stay in lockstep at every commit.
- Add the changeset.
- Run audits / typecheck / scaffold / perf last; they are the
  regression fences, not the authoring step.

"Covers" labels reference scenarios `S<n>` from `proposal.md` and
invariants `I<n>` from the cited capability specs.

---

## Phase 1 — Docs template config

- [x] **T1.** Edit `packages/templates/docs/astro.config.mjs` to add
      `inlineStylesheets: 'always'` inside the existing `build` block
      (alongside `format: 'directory'`). Preserve every other
      top-level config key (`site`, `trailingSlash`, `i18n`, `vite`)
      byte-for-byte. Covers **S1**, `templates-perf` I4.

- [x] **T2.** In the same file, extend the `sitemap({ … })`
      integration call passed to `integrations`: - Add `priority: 0.7` as the default. - Keep `changefreq: 'weekly'`. - Add a `serialize(item)` function that lifts
      `new URL(item.url).pathname === '/'` to `item.priority = 1.0`,
      sets `item.priority = 0.3` when `item.url.includes('/legal/')`,
      and returns the `item`. - Preserve the existing `filter: (page) => !page.includes('/og/') && !page.includes('/api/')`
      and the `i18n: { defaultLocale, locales }` block exactly.
      Covers **S2**.

## Phase 2 — Mirror to `apps/docs/`

- [x] **T3.** Apply the same edits to `apps/docs/astro.config.mjs`:
      add `inlineStylesheets: 'always'` to the `build` block, and
      extend the `sitemap()` call with `priority: 0.7` plus the
      identical `serialize` callback from T2. The two files must
      be byte-equivalent in their `build` and `sitemap` blocks
      (modulo any pre-existing site/adapter divergence). Covers
      **S3**, **S6**.

## Phase 3 — Changeset

- [x] **T4.** Add a changeset under
      `.changeset/docs-perf-sitemap-defaults.md`. Body: summarise
      the docs-template configuration parity with starter
      (inline-stylesheets-always + sitemap priority defaults),
      note it as a minor bump for users mirroring back to a
      previously-scaffolded docs site, and bump `astro-ignite` and
      `create-astro-ignite` (or whichever workspace packages the
      changeset convention requires) per the workspace's
      changeset convention. Covers **S10**.

## Phase 4 — Verification

- [x] **T5.** Diff `packages/templates/docs/package.json` and
      `apps/docs/package.json` against `main`. Confirm
      `dependencies` arrays have zero added entries. Covers
      **S7**, `templates-perf` I5.

- [x] **T6.** Run `pnpm format:check`. Confirm exit 0. (If
      failing because the config file's formatting drifted, run
      `pnpm format` and re-commit; do not bypass the check.)
      Covers **S8** (format half).

- [x] **T7.** Run `pnpm typecheck`. Confirm exit 0. Covers **S8**
      (typecheck half).

- [x] **T8.** Run `pnpm test`. Confirm exit 0. Covers **S8**.

- [x] **T9.** Run `pnpm --filter @astro-ignite/template-docs build`.
      Then inspect every emitted `dist/**/*.html` file: assert each
      page contains at least one inline `<style>` block and zero
      `<link rel="stylesheet" href="/_astro/*.css">` tags for
      first-party bundles. Capture a short report at
      `runs/<ts>/notes.md` listing the pages inspected and the
      result. Covers **S4**.

- [x] **T10.** From the same template build, parse
      `dist/sitemap-0.xml` and assert: - exactly one `<url>` whose `<loc>` is `<siteUrl>/` carries
      `<priority>1.0</priority>`, - every `<url>` whose `<loc>` contains `/legal/` carries
      `<priority>0.3</priority>`, - at least one guide page (e.g. `/quick-start`,
      `/introduction`) carries `<priority>0.7</priority>`.
      Record the relevant XML excerpt under `runs/<ts>/notes.md`.
      Covers **S5**.

- [x] **T11.** Run `pnpm --filter @astro-ignite/docs build` (the
      `apps/docs/` sibling) and repeat T9 + T10 assertions against
      its `dist/`. Covers **S6**.

- [x] **T12.** Run `pnpm audit:invariants --change
docs-match-starter-perf-sitemap-config`. Confirm exit 0. The
      dispatched audits include `tokens-only.mjs` and `tokens-only.mjs
--layered` (unchanged), the perf gates (`scripts/perf/run.mjs
--critical-css`, `--deps`, `--transfer`, `--page /`, `--page
/quick-start`), and the new sitemap-priority + inline-stylesheets
      assertions introduced by the spec deltas in this change folder.
      Wire the assertions through the change-dispatch path (either
      a new small audit script under `scripts/audit/` or an inline
      check in `runs/<ts>/audit.md`) so CI verifies them on every
      future run. Covers **S8**, `templates-perf` I1–I5,
      `templates-seo-jsonld` (new sitemap requirement).

- [ ] **T13.** Run `pnpm scaffold:test`. The CLI scaffolds a
      template into `apps/playground/`, installs, builds, runs
      Lighthouse. Confirm exit 0. (Scaffold smoke currently exercises
      the starter; this run is the regression fence that the
      docs-template config edit did not break the CLI flow.) Covers
      **S8**.

- [ ] **T14.** Run `pnpm perf:budget` against the docs template /
      app. Capture the report under
      `openspec/changes/docs-match-starter-perf-sitemap-config/runs/<ts>/perf.txt`
      with per-page Lighthouse scores for `/` and `/quick-start`,
      plus the `--transfer`/`--critical-css`/`--deps` checks.
      Performance, Accessibility, Best Practices, and SEO ≥ 95 on
      every page. LCP / INP / CLS / TBT / total compressed transfer
      on `/` stay inside the `templates-perf` budget. Confirm FCP /
      Speed Index do not regress versus the previous recorded
      baseline (and ideally improve, per the issue's stated goal).
      Covers **S9**, `templates-perf` I1–I5.

- [ ] **T15.** Final boundary check. Run `git diff --name-only main`
      and confirm the touched paths are limited to:
      `packages/templates/docs/astro.config.mjs`,
      `apps/docs/astro.config.mjs`,
      `.changeset/`,
      `openspec/changes/docs-match-starter-perf-sitemap-config/`,
      and (if T12 introduced a new audit script) the new file
      under `scripts/audit/`. No edits outside this set. Covers
      **S8** (boundary check).
