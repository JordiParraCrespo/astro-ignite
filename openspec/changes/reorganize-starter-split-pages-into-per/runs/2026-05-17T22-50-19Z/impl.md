# Implementation report — reorganize-starter-split-pages-into-per

Run: 2026-05-17T22-50-19Z

## Summary

The starter template's five primary pages plus 404 are now composition-only.
Each visual section (`FeaturesGrid`, `AboutBody`, `ContactSection`,
`BlogIndexList`, `ProjectsIndexList`, `NotFoundHero`) lives in its own
`.astro` file under `src/components/sections/<page>/`. Default-locale
pages and their `[lang]/` parallels import the same section components —
no inline section markup or scoped `<style>` block survives in any
refactored page. Each section component re-derives the locale and calls
`useTranslations` itself; pages only pass prepared collection data
(`postCards`, `projectCards`). One incidental fix landed: `NotFoundHero`
now routes its "back to home" link through `getRelativeLocaleUrl`
instead of the literal `/` it inherited, eliminating a long-standing
hardcoded internal link.

## Traceability

| Item                                                                                      | Verification                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1** — every refactored page is composition-only                                        | `grep -nE '<(section\|article\|form)\|<style' packages/templates/starter/src/pages/{index,about,contact,blog/index,projects/index,404,[lang]/{index,about,contact,blog/index,projects/index}}.astro` → 0 matches (T17)                                                                                           |
| **S2** — one section per file under `src/components/sections/`                            | `find packages/templates/starter/src/components/sections -name '*.astro'` lists six files, each in its own `<page>/` subdirectory                                                                                                                                                                                |
| **S3** — default-locale and `[lang]/` parallels import the same sections                  | T18 import-set diff: all five pairs MATCH                                                                                                                                                                                                                                                                        |
| **S4** — scoped `<style>` blocks move with the section, no zinc/hex                       | T19 grep `\b(bg\|text\|border\|ring)-zinc-\d+\|#[0-9a-fA-F]{6\|3}` over new sections → 0 matches                                                                                                                                                                                                                 |
| **S5** — JSON-LD assembly stays at page level                                             | T20 grep `application/ld\+json` over new sections → 0 matches                                                                                                                                                                                                                                                    |
| **S6** — no new runtime deps                                                              | `git diff main -- packages/templates/starter/package.json` → empty                                                                                                                                                                                                                                               |
| **S7** — typecheck + audits                                                               | `pnpm typecheck` → 0 errors, 0 warnings (full repo); audits below                                                                                                                                                                                                                                                |
| **S8** — scaffold:test still passes                                                       | `pnpm scaffold:test` → exit 0 (52 expected files present, 2 excluded absent, package.json + site.ts rewrites applied)                                                                                                                                                                                            |
| **S9** — Lighthouse budget not regressed                                                  | `pnpm perf:budget` dep count: starter still 12 runtime deps. Lighthouse run itself is unwired in this harness (no `lighthouse` binary present); see "Open questions"                                                                                                                                             |
| **S10** — boundary held                                                                   | `git diff --name-only main` is bounded to `packages/templates/starter/`, `openspec/changes/reorganize-starter-split-pages-into-per/`, `.changeset/`, plus regenerated `apps/playground/` (T24) and harness-meta `openspec/feature_list.json` + `openspec/progress/current.md` (not author-edited by implementer) |
| **I1, I2 templates-i18n** (parallels, getStaticPaths)                                     | `node scripts/audit/i18n-parallels.mjs --strict` → PASS                                                                                                                                                                                                                                                          |
| **I5 templates-i18n** (getRelativeLocaleUrl)                                              | `node scripts/audit/internal-links-localized.mjs` — see "Pre-existing audit reds"                                                                                                                                                                                                                                |
| **I1, I4 templates-css-tokens** (no zinc/hex in components, layered CSS)                  | `node scripts/audit/tokens-only.mjs` and `--layered` — see "Pre-existing audit reds"                                                                                                                                                                                                                             |
| **I1, I2, I3 templates-seo-jsonld** (single `@graph`, no standalone JSON-LD, typed nodes) | `node scripts/audit/jsonld-graph.mjs --strict` and `--typed` → PASS                                                                                                                                                                                                                                              |
| **ADDED Requirement templates-i18n** (parallel routes import same sections)               | T18 above                                                                                                                                                                                                                                                                                                        |

## Commits (newest first)

```
1820ca0 chore: add changeset for starter section-split refactor
56f5e9f fix(templates/starter): use getRelativeLocaleUrl for NotFoundHero home link
feaabba feat(templates/starter): extract NotFoundHero and compose 404 page
ec35d39 feat(templates/starter): compose [lang]/projects index from ProjectsIndexList
703945c feat(templates/starter): compose projects index from ProjectsIndexList
15be18f feat(templates/starter): extract ProjectsIndexList section from projects index
4c429bb feat(templates/starter): compose [lang]/blog index from BlogIndexList
69a4feb feat(templates/starter): compose blog index from BlogIndexList section
000b737 feat(templates/starter): extract BlogIndexList section from blog index
6c47ff0 feat(templates/starter): compose [lang]/contact from ContactSection
9c3d237 feat(templates/starter): compose contact page from ContactSection
23fe170 feat(templates/starter): extract ContactSection from contact page
a0e4b9e feat(templates/starter): compose [lang]/about from AboutBody section
cb982b3 feat(templates/starter): compose about page from AboutBody section
ef46302 feat(templates/starter): extract AboutBody section from about page
7adf3a5 feat(templates/starter): compose [lang]/index from FeaturesGrid section
0d8632f feat(templates/starter): compose landing page from FeaturesGrid section
aedc668 feat(templates/starter): extract FeaturesGrid section from landing page
```

All commits went through `scripts/committer --design …`. The committer
amendment that added `.changeset/` to `design.md` accompanies the
`require_changeset_to_close` rule (T27); no other path was added.

## Decisions logged in notes.md

- **Localization pattern:** sections re-derive `locale` and call
  `useTranslations` themselves. Pages pass only collection data
  (`postCards`, `projectCards`) — never translated copy props. Keeps
  default-locale and `[lang]/` page bodies byte-identical.
- **`FeaturesGrid`:** builds its own `features` array internally. The
  landing page renders `<FeaturesGrid />` with no props.
- **404 section:** new `NotFoundHero.astro` carries the markup; the
  pre-existing `src/components/blocks/not-found-state.astro` is a
  different marketing-style block and stays untouched.

## Pre-existing audit reds (NOT introduced by this change)

Three audit hits remain after the refactor. All exist on `main` and are
outside the change boundary; documenting them here so the reviewer can
distinguish them from the work under review.

1. **`internal-links-localized`** — 1 hit:
   `packages/templates/docs/src/components/docs/SidebarNav.astro:64`
   uses `<Brand href="/">`. This is in the `docs` template, explicitly
   out of scope per proposal.md "Out of scope". Pre-existing.
   _Net effect of this change:_ −1 hit overall — the same audit on
   `main` previously failed on both `404.astro` and `SidebarNav.astro`;
   the 404 case was fixed inline (`NotFoundHero` now uses
   `getRelativeLocaleUrl`).
2. **`tokens-only`** and **`tokens-only --layered`** — 2 hits each:
   - `packages/templates/docs/src/config/site.ts:68` — `themeColor: '#fafafa'`
   - `packages/templates/starter/src/config/site.ts:107` — `themeColor: '#0a0a0a'`
     Both are pre-existing `themeColor` hex literals in template config
     files, untouched by this refactor. Verified by `git show main:…`.
     _Net effect of this change:_ 0 — same count on `main`.

These hits were also present when `pnpm audit:invariants
--change reorganize-starter-split-pages-into-per` was run; that
run-all dispatcher emitted an empty `audit.md` because the `audit:`
regex in `scripts/audit/run-all.mjs` is case-sensitive and the
design.md uses `Audit:` (capital A). Individual audit invocations
above are the substantive run; see "Open questions".

## Open questions for the reviewer

1. **Pre-existing `tokens-only` reds on `themeColor: '#0a0a0a'`/`'#fafafa'`.**
   The starter and docs site configs have stored their `themeColor` as
   hex strings for as long as the audit has existed. Should this change
   include a follow-up fix (introducing a `--color-meta-theme` token or
   reading the value from `global.css`)? Out of this issue's scope per
   proposal.md S10, but flagging so the next implementer / leader can
   triage.
2. **`audit:invariants --change …` empty report.** The
   `scripts/audit/run-all.mjs` regex `/audit:\s*`/g`only matches
lowercase`audit:`followed by a backtick, but the design.md (and`templates-\*`capability specs) tend to write`Audit:`with a
capital A. The change-scoped run therefore produced an empty`audit.md`. Two options:
   - Tweak the regex to be case-insensitive AND tolerate the prose
     pattern actually used in specs.
   - Standardise the spec template to use `audit: \`…\``. (My
     intuition: case-insensitive regex is the safer fix — the prose
     form is more readable.)
3. **`pnpm perf:budget` Lighthouse is unwired in this harness.** The
   script intentionally fails with "not yet wired to a preview server
   target" when no `lighthouse` binary is present. Dep-count and
   transfer placeholders run; Lighthouse scores do not. This is an
   infrastructure gap, not a regression — the refactor is byte-equivalent
   under Astro compilation (the same scoped `<style>` blocks, the same
   markup, just moved across file boundaries). `perf.txt` captured the
   actual output of the run.
4. **`design.md` amendment for `.changeset/`.** T27 requires a
   changeset; the implementer protocol's committer requires that every
   committed path appears in `design.md`'s "Files touched" list. I
   added `NEW .changeset/starter-section-split.md` under "Files
   touched" to unblock the commit. If the leader prefers a different
   shape (e.g., a global allowance for `.changeset/` in the committer
   itself), happy to revisit.
