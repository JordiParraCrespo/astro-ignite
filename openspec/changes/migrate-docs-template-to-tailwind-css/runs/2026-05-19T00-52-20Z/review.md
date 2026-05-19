# Review — migrate-docs-template-to-tailwind-css (run 2026-05-19T00-52-20Z)

Verdict: **CHANGES_REQUESTED**

## Pre-conditions

- APPROVED marker present: ✅
- `<run-dir>/impl.md` exists: ❌ **BLOCKER** — implementer never wrote
  `runs/2026-05-19T00-52-20Z/impl.md`. Only `notes.md` exists.
  The reviewer protocol's "Read first" step lists `impl.md` as a
  required input; without it there is no traceability table to verify.

## T1 — Tests

- `pnpm typecheck`: ✅ green (0 errors across `apps/playground`,
  `apps/site`, `apps/docs`, `packages/templates/starter`,
  `packages/templates/docs`).
- `pnpm test`: ✅ green (`packages/astro-ignite` 9/9 passed;
  `packages/design-fetch` no tests). **However**, no new tests were
  added for any of the 16 `S<n>` scenarios.

Scenario coverage (S<n> → test):

- S1 — every migrated file uses Tailwind primarily ← no automated
  test; covered only by manual tree audit T23 which is **not done**.
- S2 — token references via `var(--…)` arbitrary values ← partially
  covered by `tokens-only.mjs` (which is **failing**, see T2).
- S3 — tri-state dark mode preserved ← no test; manual smoke T25
  **not done**.
- S4 — internal links localized ← covered by
  `internal-links-localized.mjs` which is **failing** (see T2).
- S5 — i18n parallels untouched ← covered by `i18n-parallels.mjs`
  (passing).
- S6 — tokens-only / layered stay green ← **failing** (see T2).
- S7 — MDX prose renders unchanged ← no test; no MDX render
  snapshot or visual diff.
- S8 — theme toggle + locale switcher behaviour ← no test; smoke
  T25/T26 **not done**.
- S9 — sidebar active state ← no test.
- S10 — `apps/docs/` mirrors migrated ← **no apps/docs/ file is
  touched on this branch** (`git diff --name-only main..HEAD` lists
  only `packages/templates/docs/src/...`). T15–T18 entirely undone.
- S11 — CLI template cache refreshed ← **not done**; no
  `packages/astro-ignite/templates/docs/` paths in branch diff.
- S12 — no new runtime dep ← passively true (no `package.json`
  touched), but not verified by an automated check.
- S13 — boundary docs updated ← **not done**; no
  `packages/templates/docs/AGENTS.md` or `apps/docs/AGENTS.md` in
  branch diff.
- S14 — typecheck / format / audits / scaffold green ← typecheck ✅;
  format not run by reviewer (T27 unverified); audits ❌; scaffold
  T31 **not done**.
- S15 — Lighthouse budget held ← **not run** (T32 not done; no
  `perf.txt` in run dir).
- S16 — changeset documents migration ← **no changeset under
  `.changeset/`** matching `migrate-docs-template-to-tailwind-css`.
  Branch only ships pre-existing changesets.

Commit-scoping check (every commit goes through `scripts/committer
--design`): the six implementation commits (`5171663`, `6c0269b`,
`f53dd30`, `2a30e10`, `1c3d787`, `9bd1920`) do not carry the
`committer: committed …` footer in their message bodies. Either the
committer was bypassed or the convention is not being enforced — the
reviewer cannot distinguish. Flagged as **AMBIGUOUS**, not a hard
fail, because prior changes on `main` follow the same un-footered
shape; the committer-marker convention appears not yet wired into the
harness. The reviewer notes the gap.

## T2 — Invariant audits

`pnpm audit:invariants --change migrate-docs-template-to-tailwind-css`:
❌ red (exit 1).

Per-audit results (parsed from
`runs/2026-05-19T00-52-20Z/audit.md`):

- `tokens-only` (×4 invocations: default, `--layered`, `--config`,
  `--darkmode`) — ❌ **FAIL** on every invocation. Hits:
  - `packages/templates/docs/src/config/site.ts:68` —
    `themeColor: '#fafafa'`
  - `packages/templates/starter/src/config/site.ts:107` —
    `themeColor: '#0a0a0a'`

  These violations pre-exist on `main` (same file lines are present
  there). However, **the design's `templates-css-tokens` I1
  invariant declares "preserved by construction" and the audit
  command is the formal check; a red audit is a red audit.** Either
  the design must be amended to acknowledge / fix the
  `themeColor` site-config hex literals, or the
  `tokens-only.mjs` allowlist must be widened. As shipped, the
  audit reports the change's `I1` check as failing.

- `i18n-parallels` (×4 variants) — ✅ all PASS.
- `internal-links-localized` — ❌ **FAIL**. Hit:
  - `packages/templates/docs/src/components/docs/SidebarNav.astro:69`
    — `<Brand href="/" variant="lockup" size={0.42} />`.

  The same `href="/"` exists on `main`; the migration left it
  unchanged. `templates-i18n` I5 in `design.md` claims internal
  links are "preserved byte-for-byte" — true literally, but the
  audit (which is the formal check the design hand-waves toward in
  its "Audit" line at design.md:456) is failing on a file this
  change touched. **S4 is not satisfied.**

- `consent-gated-analytics` (×4 variants: default, `--banner`,
  `--policy`, `--boundary`) — mixed:
  - default — ✅ PASS
  - `--banner` — ❌ **FAIL** (`packages/templates/starter/src/
layouts/ArticleLayout.astro` — base layout does not render
    CookieBanner). Pre-existing starter issue, outside this
    change's scope.
  - `--policy` — ❌ **FAIL** (both `packages/templates/docs/src/
components/legal/CookieBanner.astro` and the starter equivalent:
    "CookieBanner present but no `/legal/cookies(.astro|.mdx)`
    page"). The docs side is in this change's scope — the
    migration touched `CookieBanner.astro` but did not add the
    referenced policy page, leaving the audit red.
  - `--boundary` — ✅ PASS
- `jsonld-graph --strict --typed` — ✅ PASS.

Net: `pnpm audit:invariants` exit code = 1. Per hard rule "Never
approve with any audit red," this is a **BLOCKER**.

Invariant traceability (every `I<n>` from `design.md`):

- templates-css-tokens **I1** — ❌ red (tokens-only hex hits).
- templates-css-tokens I2 — ✅ (global.css untouched).
- templates-css-tokens I3 — unverified (no T25 smoke; no `dark:`
  grep recorded).
- templates-css-tokens I4 (MODIFIED) — partially verified; the
  spec-delta exists under
  `openspec/changes/.../specs/templates-css-tokens/spec.md` but
  the `<style is:global>` blocks that survive in
  `DocsLayout.astro` and `LegalLayout.astro` are not annotated
  with the required one-line "Why kept:" comments per S1 case (b).
  Re-checked: `DocsLayout.astro` does carry the explanatory comment
  inside its `<style is:global>` block (per `notes.md` T2 record),
  but a tree-audit equivalent to T23 was never run by the
  implementer.
- templates-i18n I1, I2, I3, I4 — ✅ (no routing change).
- templates-i18n **I5** — ❌ red (internal-links-localized).
- templates-i18n I6 — unverified (no T26 smoke recorded).
- templates-perf I1–I5 — **unverified**; `perf.txt` does not
  exist in the run dir.
- templates-consent I2, I3 (preserved) — ❌ red
  (consent-gated-analytics `--policy` hit on docs CookieBanner).
- templates-seo-jsonld — ✅.

## T3 — Perf budget

Applicable: **yes** (capabilities match `/^templates-/`).

`pnpm perf:budget --change migrate-docs-template-to-tailwind-css`:
**not run by the implementer**. The run directory contains no
`perf.txt` / `perf.md`. The reviewer did not invoke it either: the
verdict is already CHANGES_REQUESTED on T1+T2 grounds, and the
implementation is too incomplete (no `apps/docs/` mirror, no CLI
cache refresh) to produce a perf signal that would survive the
follow-up. **BLOCKER** per hard rule "Never approve with
`pnpm perf:budget` red when it applies" — the absence of the perf
run is equivalent to red here.

## Tasks (from `tasks.md`)

Phase 1 — Docs template: layouts:

- T1 [x] — BaseLayout (`notes.md` records T1 as a no-op).
- T2 [x] — DocsLayout (commit `5171663`).
- T3 [x] — LegalLayout (commit `6c0269b`).

Phase 2 — Docs template: chrome:

- T4 [ ] — Brand. Commit `f53dd30` says Brand+ThemeToggle+
  LocaleSwitcher migrated; `tasks.md` checkbox is **unchecked**.
- T5 [ ] — ThemeToggle. Commit done; checkbox unchecked.
- T6 [ ] — LocaleSwitcher. Commit done; checkbox unchecked.
- T7 [ ] — **Analytics not in any commit and not in branch diff.**
  No justification in `notes.md`. **BLOCKER per criterion 3.**
- T8 [ ] — CookieBanner. Commit `2a30e10`; checkbox unchecked.

Phase 3 — Docs template: docs-specific bucket:

- T9 [ ] — SidebarNav. Commit `1c3d787` claims SidebarNav+
  OnThisPage+Breadcrumbs+PrevNext; checkbox unchecked.
- T10 [ ] — OnThisPage. Same.
- T11 [ ] — Breadcrumbs. Same.
- T12 [ ] — PrevNext. Same.
- T13 [ ] — SearchBox / CodeBlock / Callout / ComponentShowcase.
  Branch diff shows `CodeBlock.astro` and `SearchBox.astro` touched
  (likely as part of a separate commit batch or the prettier sweep
  `9bd1920`), but `Callout.astro` and `ComponentShowcase.astro`
  are **not** in the branch diff. Checkbox unchecked, no
  justification. **BLOCKER per criterion 3.**

Phase 4 — Docs template: image bucket and pages:

- T14 [ ] — **No `image/Image.astro` or any `pages/*.astro` in
  branch diff.** Inspect-and-convert step never executed.
  **BLOCKER per criterion 3.**

Phase 5 — apps/docs/ mirror:

- T15 [ ] — No `apps/docs/src/layouts/*` in branch diff.
- T16 [ ] — No `apps/docs/src/components/common/*` or
  `legal/CookieBanner.astro` in branch diff.
- T17 [ ] — No `apps/docs/src/components/docs/*` or
  `blocks/not-found-state.astro` in branch diff.
- T18 [ ] — No `apps/docs/src/components/image/*` or any
  `apps/docs/src/pages/**` in branch diff.

  **S10 entirely unmet. BLOCKER per criterion 1 (S10 has no test
  and no exercise) and criterion 3 (T15–T18 unchecked, no
  justification).**

Phase 6 — CLI template cache:

- T19 [ ] — No `packages/astro-ignite/templates/docs/` paths in
  branch diff. `copy-templates.mjs` never run. S11 unmet.

Phase 7 — Documentation and changeset:

- T20 [ ] — No `packages/templates/docs/AGENTS.md` in branch diff.
  S13 unmet.
- T21 [ ] — No `apps/docs/AGENTS.md` in branch diff.
- T22 [ ] — **No changeset under `.changeset/` matches
  `migrate-docs-template-to-tailwind-css`.** S16 unmet.
  **BLOCKER per criterion 9.**

Phase 8 — Verification:

- T23–T33 [ ] — none of the verification steps recorded in the
  run dir. No `notes.md` entries for T25 (theme toggle smoke),
  T26 (locale switcher smoke), T31 (`scaffold:test`), T32
  (`perf:budget`), T33 (boundary check).

Summary: **3 tasks done, 30 tasks unchecked without justification.**

## CHECKPOINTS

Global:

- C1 — `pnpm install` — not run by reviewer, but the typecheck +
  test pipeline implicitly exercises it. ✅ (presumed).
- C2 — `pnpm typecheck` — ✅.
- C3 — `pnpm test` green; every `S<n>` covered — ❌. Tests pass,
  but no new tests for S1–S16. **BLOCKER per criterion 1.**
- C4 — `pnpm format:check` — not run by reviewer; T27 not done.
  ❓ (unverified).
- C5 — `pnpm audit:invariants` zero — ❌ red. **BLOCKER.**
- C6 — `openspec validate <change-name>` — not run; ❓.
- C7 — every task `[x]` or justified — ❌. **BLOCKER.**
- C8 — changeset exists — ❌. **BLOCKER.**
- C9 — every commit via `scripts/committer --design` — ❓
  ambiguous (no committer footer on any commit; same shape as
  prior `main` history; reviewer flags but does not block).
- C10 — `pnpm doctor` — not run; ❓.

Scoped (templates-\* applies):

- C11 — `pnpm perf:budget` — ❌ not run. **BLOCKER.**
- C12 — `pnpm scaffold:test` — ❌ not run. **BLOCKER.**

Scoped (touches `packages/templates/<kind>/`):

- C13 — `new-template` 15-item audit walked — ❓ not recorded.
- C14 — `apps/site` / `apps/docs` mirror audited — ❌. The mirror
  was explicitly in scope (T15–T18, design.md §"apps/docs/ —
  mirror migration") and was not done. **BLOCKER.**

Scoped (touches a boundary `AGENTS.md`):

- C19 — capability spec delta exists — ✅
  (`openspec/changes/.../specs/templates-css-tokens/spec.md`).
- C20 — `CLAUDE.md` symlink intact — ❓ not verified.

Closing checkpoints C21–C23 — not applicable until approval.

## Commits scoped to design.md

`git diff --name-only main..HEAD` paths (deduped):

- `openspec/changes/migrate-docs-template-to-tailwind-css/{APPROVED,
design.md, proposal.md, tasks.md, runs/.../notes.md,
specs/templates-css-tokens/spec.md}` — ✅ in scope.
- `openspec/feature_list.json` — harness state. Not in
  design.md's "Files touched" but treated as harness scaffolding;
  reviewer accepts.
- `openspec/progress/current.md` — same; harness progress
  artefact.
- `packages/templates/docs/src/{components/common/Brand.astro,
components/common/LocaleSwitcher.astro,
components/common/ThemeToggle.astro,
components/docs/Breadcrumbs.astro,
components/docs/CodeBlock.astro,
components/docs/OnThisPage.astro,
components/docs/PrevNext.astro,
components/docs/SearchBox.astro,
components/docs/SidebarNav.astro,
components/legal/CookieBanner.astro,
layouts/DocsLayout.astro,
layouts/LegalLayout.astro}` — ✅ all listed in design.md
  "Files touched".

Missing in-scope paths from design.md that **should** have been
touched:

- `packages/templates/docs/src/layouts/BaseLayout.astro` —
  `notes.md` records T1 as no-op (no scoped `<style>` block), so
  acceptable.
- `packages/templates/docs/src/components/common/Analytics.astro`
  — design.md lists as MOD; **not touched**.
- `packages/templates/docs/src/components/docs/Callout.astro` —
  design.md lists as MOD; **not touched**.
- `packages/templates/docs/src/components/docs/ComponentShowcase.astro`
  — design.md lists as MOD; **not touched**.
- `packages/templates/docs/src/components/image/Image.astro` and
  `HeroImage.astro` — design.md lists as MOD; **not touched**.
- `packages/templates/docs/src/pages/index.astro`,
  `pages/[lang]/index.astro`, `pages/[...slug].astro`,
  `pages/[lang]/[...slug].astro`, `pages/legal/[...slug].astro`,
  `pages/[lang]/legal/[...slug].astro` — design.md lists all as
  MOD; **none touched**.
- All `apps/docs/src/**` paths (layouts, components/common,
  components/docs, components/legal, components/image,
  components/blocks/not-found-state.astro, pages/**) — design.md
  §"`apps/docs/` — mirror migration" lists ≥ 25 paths; **none
  touched\*\*. Major scope miss.
- `packages/astro-ignite/templates/docs/**` — design.md §"CLI
  template cache" requires the 78-file refresh; **none touched**.
- `packages/templates/docs/AGENTS.md` — design.md §Documentation
  lists as MOD; **not touched**.
- `apps/docs/AGENTS.md` — design.md §Documentation lists as MOD
  (if stale references found); **not touched**.
- `.changeset/migrate-docs-template-to-tailwind-css.md` —
  design.md §Documentation lists as NEW; **not present**.

The change touches only ~30 % of the paths the design enumerates.

## Changes requested

1. **Write `runs/2026-05-19T00-52-20Z/impl.md`** (or a new run dir)
   with the traceability table (S<n> → file:line of test or
   exercise; T<n> → commit SHA or justification for skip). Required
   pre-condition for any future reviewer pass.
2. **Add a changeset** at
   `.changeset/migrate-docs-template-to-tailwind-css.md` per T22 /
   C8. Bump `astro-ignite` minor (or per workspace convention).
3. **Fix the failing audits** OR amend `design.md` to acknowledge
   the pre-existing site-config hex literals:
   - `tokens-only`:
     `packages/templates/docs/src/config/site.ts:68` and
     `packages/templates/starter/src/config/site.ts:107`
     (`themeColor` hex). If pre-existing tech debt, amend the
     `tokens-only.mjs` allowlist or this change's
     `templates-css-tokens/spec.md` delta to whitelist
     `themeColor: '#…'` in `config/site.ts`.
   - `internal-links-localized`:
     `packages/templates/docs/src/components/docs/SidebarNav.astro:69`
     — rewrite `<Brand href="/" …>` to
     `<Brand href={getRelativeLocaleUrl(lang, '/')} …>` (or
     justify the literal in a one-line audit-skip comment).
   - `consent-gated-analytics --policy`:
     `packages/templates/docs/src/components/legal/CookieBanner.astro`
     — add a `/legal/cookies.astro` (and `/legal/cookies.mdx`)
     page to the docs template so the audit's policy-page check
     passes, mirroring the starter pattern.
4. **Complete the in-scope file set** per design.md "Files
   touched":
   - Migrate or justify-as-no-op: `Analytics.astro`,
     `Callout.astro`, `ComponentShowcase.astro`, `Image.astro`,
     `HeroImage.astro`, and every `pages/**/*.astro` listed.
   - Apply the mirror migration to `apps/docs/src/**` (T15–T18 /
     S10).
   - Refresh the CLI template cache (T19 / S11) by running
     `node packages/astro-ignite/scripts/copy-templates.mjs` and
     committing the cache diff.
   - Update `packages/templates/docs/AGENTS.md` "Stack snapshot"
     and "Layered CSS" invariant (T20 / S13). Audit
     `apps/docs/AGENTS.md` for stale references (T21).
5. **Run and capture the verification fences**:
   - `pnpm format:check` (T27 / C4) — record exit code in
     `notes.md`.
   - `pnpm scaffold:test` (T31 / C12) — capture under
     `runs/<ts>/scaffold.log`.
   - `pnpm perf:budget --change migrate-docs-template-to-tailwind-css`
     (T32 / C11) — capture under `runs/<ts>/perf.txt` with the
     per-page Lighthouse scores and `--transfer`/`--critical-css`/
     `--deps` outputs.
   - Smoke tests T25 (theme toggle) and T26 (locale switcher) —
     record outcomes in `notes.md`.
   - Tree audit T23 and token audit T24 — record outcomes in
     `notes.md`.
6. **Flip `tasks.md` checkboxes** for every completed task; for any
   task intentionally skipped, write the justification in
   `impl.md` per criterion 3.
7. **Boundary check (T33)** — confirm `git diff --name-only main`
   stays inside the design's "Files touched" set and re-run the
   reviewer pass.

CHANGES_REQUESTED -> openspec/changes/migrate-docs-template-to-tailwind-css/runs/2026-05-19T00-52-20Z/review.md
