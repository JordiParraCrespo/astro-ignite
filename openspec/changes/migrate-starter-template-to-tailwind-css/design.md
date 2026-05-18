---
name: migrate-starter-template-to-tailwind-css
capabilities:
  - templates-css-tokens
  - templates-perf
---

## Files touched

The `committer --design` parser reads the `NEW` / `MOD` / `DEL` prefixes
in this section to gate which paths the implementer may write.

### `packages/templates/starter/` — source of truth for the migration

- MOD `packages/templates/starter/src/components/common/Hero.astro`
- MOD `packages/templates/starter/src/components/common/Header.astro`
- MOD `packages/templates/starter/src/components/common/Footer.astro`
- MOD `packages/templates/starter/src/components/common/Brand.astro`
- MOD `packages/templates/starter/src/components/common/LocaleSwitcher.astro`
- MOD `packages/templates/starter/src/components/common/ThemeToggle.astro`
- MOD `packages/templates/starter/src/components/common/FeaturesGrid.astro`
- MOD `packages/templates/starter/src/components/common/Analytics.astro`
- MOD `packages/templates/starter/src/components/about/AboutBody.astro`
- MOD `packages/templates/starter/src/components/blog/BlogIndexList.astro`
- MOD `packages/templates/starter/src/components/projects/ProjectsIndexList.astro`
- MOD `packages/templates/starter/src/components/contact/ContactSection.astro`
- MOD `packages/templates/starter/src/components/not-found/NotFoundHero.astro`
- MOD `packages/templates/starter/src/components/legal/CookieBanner.astro`
- MOD `packages/templates/starter/src/components/seo/SEO.astro` (only if it carries a `<style>` — verify before editing)
- MOD `packages/templates/starter/src/components/seo/JsonLd.astro` (verify only)
- MOD `packages/templates/starter/src/layouts/BaseLayout.astro`
- MOD `packages/templates/starter/src/layouts/ArticleLayout.astro`
- MOD `packages/templates/starter/src/layouts/LegalLayout.astro`
- MOD `packages/templates/starter/src/layouts/ProjectLayout.astro`
- MOD `packages/templates/starter/src/pages/**/*.astro` (any page that inlines a `<style>` block — most pages compose sections and do not)
- MOD `packages/templates/starter/src/styles/global.css` (no token changes — keep `@theme`, `.light` overrides, `@layer base`, `.hairline`, `.mono`, `.caret`/`@keyframes ig-blink`; remove any rules that exist only to support scoped blocks now deleted)
- MOD `packages/templates/starter/astro.config.mjs` (drop Beasties integration **iff** measurement supports it — see "Beasties decision" below)
- MOD `packages/templates/starter/package.json` (drop the `astro-beasties` / `astro-critters` / equivalent dep iff the integration is removed; no new deps added)
- MOD `packages/templates/starter/CLAUDE.md` (Invariants section #4 rewritten — single-layer Tailwind)
- MOD `packages/templates/starter/AGENTS.md` (mirror — single source via symlink, edit the underlying file once)

### Root documentation

- MOD `AGENTS.md` (Tech-stack bullet on Tailwind / scoped `<style>` rewritten; Template-invariants item 4 rewritten)
- MOD `.claude/skills/new-template/SKILL.md` (if its 15-item audit checklist still mentions the layered CSS strategy, update item 4 to "Tailwind-first; tokens resolved via `var(--color-*)`")

### `apps/site/` — marketing mirror (mandatory per the architecture rules)

- MOD `apps/site/src/components/common/Header.astro`
- MOD `apps/site/src/components/common/Footer.astro`
- MOD `apps/site/src/components/common/Brand.astro`
- MOD `apps/site/src/components/common/LocaleSwitcher.astro`
- MOD `apps/site/src/components/common/ThemeToggle.astro`
- MOD `apps/site/src/components/landing/*.astro` (every section with a `<style>` block)
- MOD `apps/site/src/components/legal/CookieBanner.astro`
- MOD `apps/site/src/layouts/ArticleLayout.astro`
- MOD `apps/site/src/layouts/LegalLayout.astro`
- MOD `apps/site/src/layouts/ProjectLayout.astro`
- MOD `apps/site/src/styles/global.css` (mirror starter rules — no token changes)
- MOD `apps/site/astro.config.mjs` (Beasties decision mirrored from starter)
- MOD `apps/site/package.json` (mirror Beasties drop iff applicable)

### CLI template cache

- MOD `packages/astro-ignite/templates/starter/**` — refreshed via `node packages/astro-ignite/scripts/copy-templates.mjs` after the starter source migration is complete. Do not hand-edit; the script regenerates the tree.

### Audit & spec deltas

- MOD `scripts/audit/tokens-only.mjs` — remove the `--layered` heuristic body; keep the flag accepted but make it a deprecated no-op that prints a one-line notice and exits 0. (Preserving the flag avoids breaking older `design.md` files that still list it.)
- MOD `openspec/specs/templates-css-tokens/spec.md` — applied via this change's spec delta at `openspec/changes/migrate-starter-template-to-tailwind-css/specs/templates-css-tokens/spec.md`. Replaces the "Layered CSS strategy" requirement; updates the invariants table to drop the I4 row.
- MOD `openspec/specs/templates-perf/spec.md` — applied via this change's spec delta. Either removes the Beasties requirement + I4 audit row entirely (decision = drop), or keeps both but rewords the requirement to apply only when measured LCP demands it (decision = retain). The spec delta below is written for the "drop" branch; flip to "modify" if measurement supports retention.

### Generated / not committed by hand

- `apps/playground/**` — regenerated by `pnpm scaffold:test --full`. Never hand-edited.

### Changeset

- NEW `.changeset/migrate-starter-template-to-tailwind-css.md` — documents the styling-strategy switch as a breaking change for users who already scaffolded the previous starter and are pulling in updates by hand (component class strings have changed; `<style>` blocks have moved).

## New / changed signatures

This is a styling migration; no public API surfaces change.

The only behavioral change of note is the audit:

```diff
- node scripts/audit/tokens-only.mjs --layered
+ node scripts/audit/tokens-only.mjs --layered   # deprecated no-op; exits 0 with a notice
```

Component prop interfaces (`Hero.Props`, `Header.Props`, etc.) are
unchanged. Page frontmatter contracts (JSON-LD assembly, `getStaticPaths`
i18n parallels) are unchanged.

## Beasties decision

The implementer **MUST** record a measured LCP comparison in this
section of `design.md` before opening the change for review. The
template is:

```
Beasties measurement — captured 20XX-XX-XX
- Build A: starter on main, Beasties enabled
  LCP (mobile, simulated 4G), median of 5 runs on `/`: ___ ms
- Build B: migration branch, Beasties enabled
  LCP (mobile, simulated 4G), median of 5 runs on `/`: ___ ms
- Build C: migration branch, Beasties disabled
  LCP (mobile, simulated 4G), median of 5 runs on `/`: ___ ms

Decision: <DROP | RETAIN>
Rationale: <one sentence — typically "B − C < 50 ms so the dep is not
pulling its weight" for DROP, or "B − C ≥ 100 ms so the dep stays" for
RETAIN>
```

If DROP: also remove the Beasties requirement + I4 audit row from the
`templates-perf` spec delta and drop the integration from
`astro.config.mjs` and `package.json` in starter + apps/site.

If RETAIN: replace the spec delta in this change with a MODIFIED
Requirement that keeps Beasties but reworded so the new single-layer
Tailwind strategy is compatible (no language tying Beasties to "above
the fold" since that concept is dissolving).

The spec delta files written by this change assume the **DROP** branch;
the implementer flips them to **MODIFIED Requirements** if measurement
favors retain.

## Invariants this change touches

| Spec / Id                                                                  | Statement                                                        | Audit                                                        | Effect of this change                                                                                                                                                                         |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `templates-css-tokens` I1                                                  | No raw zinc / hex in component files                             | `node scripts/audit/tokens-only.mjs`                         | Stays — must still pass on the migrated tree                                                                                                                                                  |
| `templates-css-tokens` I2                                                  | `global.css` defines `--color-*` tokens                          | `node scripts/audit/tokens-only.mjs --config`                | Stays — global.css token block unchanged                                                                                                                                                      |
| `templates-css-tokens` I3                                                  | Tri-state dark mode wired (`.light` flips tokens)                | `node scripts/audit/tokens-only.mjs --darkmode`              | Stays — must still pass; tokens still drive theming                                                                                                                                           |
| `templates-css-tokens` I4                                                  | Above-the-fold uses scoped `<style>` heuristic                   | `node scripts/audit/tokens-only.mjs --layered`               | **Removed.** Spec delta below drops this row. The audit flag stays as a deprecated no-op so older changes' `design.md` files do not break their `pnpm audit:invariants --change <name>` runs. |
| `templates-perf` I1 / I2 / I3                                              | Lighthouse budget on `/` and inner page; total transfer ≤ 150 KB | `node scripts/perf/run.mjs --page / --page /blog --transfer` | Stays — must still pass; this is the perf gate that the migration is judged against                                                                                                           |
| `templates-perf` I4                                                        | Critical CSS inlined (Beasties output present)                   | `node scripts/perf/run.mjs --critical-css`                   | **Removed if measurement says DROP; modified if RETAIN.** See "Beasties decision" above.                                                                                                      |
| `templates-perf` I5                                                        | No undeclared runtime dep added                                  | `node scripts/perf/run.mjs --deps`                           | Stays — must still pass; the migration removes deps (Beasties) but adds none                                                                                                                  |
| (orthogonal) `templates-i18n`, `templates-seo-jsonld`, `templates-consent` | Locked practices                                                 | individual audits                                            | Unchanged — the migration touches only styling; no route, JSON-LD, or consent gate code is altered                                                                                            |

The implementer runs:

```bash
pnpm audit:invariants --change migrate-starter-template-to-tailwind-css
pnpm perf:budget
pnpm test:e2e --project=starter
pnpm scaffold:test --full
```

All four must pass before the change is opened for review.

## Performance budget applicability

This change directly impacts the `templates-perf` capability — the
whole purpose of the migration is to be a no-op (or improvement) on
Lighthouse. The reviewer runs `pnpm perf:budget` against the migrated
starter and rejects the change if any metric in the budget table
regresses by more than the day-1 baseline tolerance.

Specifically:

- LCP must not regress by more than 100 ms vs. the captured baseline
  in `openspec/progress/history.md` under "perf baseline".
- CLS must remain ≤ 0.05; this is the most likely regression because
  Tailwind classes resolve at parse time but `<style>` blocks resolved
  during HTML streaming — verify on the contact-form page in
  particular, where layout shifts have historically appeared.
- Total compressed transfer on `/` must remain ≤ 150 KB. The Tailwind
  output for the starter is currently ~28 KB compressed; the migration
  is expected to push that to ~40 KB while removing ~20 KB of scoped
  CSS — a net ≤ +10 KB transfer.

## Rejected alternative — keep the layered split but tighten the audit

The obvious alternative is to keep scoped `<style>` blocks above the
fold and just widen the `tokens-only.mjs --layered` heuristic to cover
every component that renders above the fold, not just `Hero.astro` /
`Header.astro`. That fails for three reasons:

1. **"Above the fold" is not statically decidable.** What's above the
   fold on `/` (Hero) is below the fold on `/blog/<slug>` (Hero is gone;
   Article body is on top). Per-page heuristics rot fast and have
   already produced false-positives twice in the project history.
2. **Token drift is uncatchable inside `<style>` blocks.** The existing
   audit only walks Tailwind class strings; raw `clamp()` / hex / px
   values in scoped CSS pass through. Tailwind-only styling moves
   _all_ color references back into class strings the audit walks.
3. **Tailwind v4 compiles in ~80 ms on this codebase.** The original
   motivation for the layered split — keep critical CSS tiny — is
   measurable, and the measurement (captured in the Beasties decision
   table above) shows the layered approach is no longer paying for the
   cognitive overhead it adds.

A second alternative — migrate but keep Beasties unconditionally —
was rejected because we want the _measurement_ on the record so future
contributors don't reintroduce the dep without evidence. The decision
table format above forces the implementer to capture the LCP delta.

## Why no new dep

This migration removes a build-time dep (Beasties, if measurement
favors drop) and adds none. The expanded Tailwind output is generated
by the Tailwind v4 compiler that already ships with the starter; no
new integration is needed.
