# Implementation Log — starter-use-the-text-component-for-all-t

Run dir: `openspec/changes/starter-use-the-text-component-for-all-t/runs/2026-05-18T09-59-13Z/`

## Summary

Refactored every body-copy and heading site in the starter template
from inline-Tailwind typography utilities + page-scoped `<style>` blocks
to the existing `<Text>` atom. Touched 15 files under
`packages/templates/starter/` (5 default-locale pages, 5 `[lang]/`
parallels, `Footer.astro`, `not-found-state.astro`, and the three
specialised layouts `ArticleLayout` / `ProjectLayout` / `LegalLayout`).
No new files. The atom contract did **not** need extending — every
target maps cleanly onto the existing variant set
(`display | h1 | h2 | h3 | h4 | lead | body | small | muted | eyebrow | code`)
plus `as` / `tone` / `weight` / `class`. Therefore neither
`packages/registry/base/text.astro` nor its starter mirror
`packages/templates/starter/src/components/ui/text.astro` was modified,
so they remain byte-identical to their state on `main` (S5 holds
vacuously). The `.field-error` class on `contact.astro` /
`[lang]/contact.astro` retains the semantic danger color via a tiny
scoped rule; typography is supplied by `<Text variant="small">`.

## Scenario → audit / verification traceability

| Scenario | Evidence |
|----------|----------|
| **S1** — pages under `src/pages/` use `<Text>` | Files modified: `pages/index.astro`, `pages/about.astro`, `pages/contact.astro`, `pages/blog/index.astro`, `pages/projects/index.astro` (and `[lang]/` parallels). T12 grep returns zero hits across the starter `src/`. |
| **S2** — non-allow-listed components use `<Text>` | `components/Footer.astro` and `components/blocks/not-found-state.astro` refactored. `Hero.astro`, `Nav.astro`, `CookieBanner.astro`, `Brand.astro`, `ThemeToggle.astro`, `LocaleSwitcher.astro`, `Analytics.astro`, `seo/*`, `image/*`, and `ui/*` left untouched per inventory. |
| **S3** — layouts use `<Text>` for hand-rolled header | `layouts/ArticleLayout.astro`, `layouts/ProjectLayout.astro`, `layouts/LegalLayout.astro` all refactored. MDX `<slot />` + `.prose` global styles left intact (out of scope). |
| **S4** — no typography utility soup on raw heading / `<p>` | T12 grep regression check — zero hits across the entire starter `src/`, including in `Hero.astro` / `Nav.astro` / `CookieBanner.astro` / `ui/*` (those use scoped `<style>` blocks, not class soup, so they pass even without being explicitly allowed). |
| **S5** — atom extensions in lockstep | Inventory T2 concluded no extension was needed. `packages/registry/base/text.astro` and `packages/templates/starter/src/components/ui/text.astro` are unchanged from `main` — `git diff main -- packages/registry/base/text.astro packages/templates/starter/src/components/ui/text.astro` is empty. |
| **S6** — `tokens-only` PASS for change | ❌ Two **baseline** failures (`themeColor: '#0a0a0a'` and `'#fafafa'`) in `src/config/site.ts` files. Both predate this feature (`f02e323` initial commit). Both are out of scope of `## Files touched`. My refactor introduces zero new hex/zinc violations. |
| **S7** — `tokens-only --layered` PASS | Same baseline failures as S6 (the audit re-runs I1 first). `Hero.astro` and `Nav.astro` still carry `<style>` blocks, so the layered heuristic side of the audit passes; the I1 hex baseline is the only blocker. |
| **S8** — `no-react-in-atoms --named-only --registry --family-layout` | ✅ PASS — scanned 32 files. |
| **S9** — full audit suite green for the change | `pnpm audit:invariants --change starter-use-the-text-component-for-all-t` runs three audits (tokens-only, tokens-only --layered, no-react-in-atoms). The two tokens-only invocations fail on the pre-existing baseline above. Report at `runs/2026-05-18T09-59-13Z/audit.md`. |
| **S10** — scaffold/Lighthouse pass | Dep-count check ✅ (no new runtime deps; 12 starter / 8 docs). Full Lighthouse step skipped in this sandbox — no Chrome binary, same condition documented in the prior closed feature's `add-e2e-testing-…/runs/2026-05-18T08-28-15Z/perf.txt`. Report at `runs/.../perf.md`. |
| **S11** — boundary | `git diff --name-only main -- ':!openspec'` lists 15 files, all under `packages/templates/starter/`. Zero `apps/**`, zero `packages/templates/docs/**`, zero other `packages/registry/**` files. |

## Invariant → audit traceability

| Invariant | Audit | Status |
|-----------|-------|--------|
| `templates-css-tokens` I1 (no raw zinc / hex) | `node scripts/audit/tokens-only.mjs` | ❌ **2 pre-existing baseline hits** (`site.ts` themeColor). Zero new hits introduced by this refactor. |
| `templates-css-tokens` I4 (above-the-fold scoped `<style>`) | `node scripts/audit/tokens-only.mjs --layered` | Re-runs I1, so same 2 baseline hits. Layered-CSS heuristic side passes — `Hero.astro` and `Nav.astro` retain their `<style>` blocks. |
| `registry-atoms` I1 (no React/Vue/Svelte in `base/`) | `node scripts/audit/no-react-in-atoms.mjs` | ✅ implicit — `--named-only --registry --family-layout` run passed; no new client framework imports added. |
| `registry-atoms` I2 (no default exports in atom `.ts`) | `… --named-only` | ✅ PASS. |
| `registry-atoms` I3 (`cn` in `registryDependencies`) | `… --registry` | ✅ PASS. |
| `registry-atoms` I4 (compound families layout) | `… --family-layout` | ✅ PASS — `text` is single-file. |

## Open questions for the reviewer

1. **`themeColor` hex baseline.** The two pre-existing hex literals in
   `src/config/site.ts` files (`#0a0a0a` and `#fafafa`) trip
   `tokens-only.mjs` I1. They live in config (not "component / page
   files" per the spec's Requirement text), but the audit's
   `componentFiles()` walks all `.ts` under `src/`. Options for the
   reviewer:
   1. Accept as baseline and open a follow-up ticket to either narrow
      the audit's path filter or move `themeColor` into a runtime
      `getComputedStyle()` read.
   2. Require I fix it in-scope (would need a `MOD
src/config/site.ts` line added to `design.md` plus a clean
      hex-free expression for the `<meta name="theme-color">` value).
   I went with (1) for this round because the feature's scope is
   explicitly about routing typography through `<Text>` and `site.ts`
   is not in `## Files touched`. Happy to flip to (2) on a
   CHANGES_REQUESTED.

2. **Lighthouse step in this sandbox.** `pnpm perf:budget --change …`
   couldn't run Lighthouse (no Chrome binary). The same environment
   limitation was accepted in the prior closed feature
   `add-e2e-testing-…/runs/…/perf.txt` (commit `a16b661`). CI on the
   PR will run the real Lighthouse pass.

3. **`playground` typecheck.** Full `pnpm typecheck` fails inside
   `apps/playground/src/components/ui/textarea.astro` — a parser
   sensitivity on the long Tailwind class list (`aria-invalid:` in a
   class containing `[:` token). `apps/playground/` is regenerated by
   CI's `pnpm scaffold:test` and is explicitly never hand-edited per
   `CLAUDE.md`. Starter typecheck (the actual target of this change)
   passes with 0 errors.

## Commits made (committer-logged)

1. `aeba6cd` — `spec(starter-use-the-text-component-for-all-t): inventory + design harness paths (T1, T2)`
2. `ce83c69` — `feat(starter): use <Text> on home + [lang]/home (T3, T8 index)`
3. `d9f855b` — `feat(starter): use <Text> on about + contact + [lang] parallels (T4, T5, T8)`
4. `232bc7a` — `feat(starter): use <Text> on blog + projects lists + [lang] parallels (T6, T7, T8)`
5. `1b97952` — `feat(starter): use <Text> in Footer + not-found-state + 3 layouts (T9, T10, T11)`
6. (final, pending) — close-out: tasks.md verification ticks, audit.md/perf.md run logs, impl.md, changeset, progress/current.md, design.md parseable audit bullets (T12-T20).
