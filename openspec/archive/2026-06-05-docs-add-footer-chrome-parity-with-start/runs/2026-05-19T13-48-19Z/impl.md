# impl — docs-add-footer-chrome-parity-with-start

Run: `runs/2026-05-19T13-48-19Z/`
Branch: `spec/50-docs-add-footer-chrome-parity-with-start`

## Summary

The docs template now ships footer chrome at parity with the starter.
A new `Footer.astro` composes the `<Text>` atom and resolves all
internal links through `getRelativeLocaleUrl`, then `BaseLayout`
renders it after `<slot />` so every page (docs landing, `[...slug]`
via `DocsLayout`, `legal/[...slug]` via `LegalLayout`, 404, and the
`[lang]/` parallels) inherits it. Three new i18n keys —
`footer.privacy`, `footer.terms`, `footer.cookies` — land in both
locale bundles, keeping them key-parallel. The `apps/docs` mirror and
the CLI template cache under `packages/astro-ignite/templates/docs/`
are updated in lockstep; a changeset records the patch bump for
`astro-ignite` and `create-astro-ignite`.

No new runtime dep was introduced (docs `package.json` unchanged
against `main`). The footer is JS-free and carries no scoped `<style>`
block.

## Traceability

| Scenario / Invariant                                                            | Verification                                                                                                                                                                                                                                                                                                                                                             | Result                              |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| S1 Footer renders on every docs page through BaseLayout                         | Build inspection: `packages/templates/docs/dist/index.html` contains `<footer class="border-t border-[var(--color-border)] mt-16">` between the main `<slot>` body and `<aside id="cookie-banner">`.                                                                                                                                                                     | PASS                                |
| S2 Footer composes ui/ atoms and uses design tokens only                        | `node scripts/audit/tokens-only.mjs` — new `Footer.astro` lines absent from FAIL list (the two pre-existing reds are `packages/templates/docs/src/config/site.ts:68` and `packages/templates/starter/src/config/site.ts:107`, both on `main`).                                                                                                                           | PASS for files in scope             |
| S3 Internal links go through `getRelativeLocaleUrl`                             | `node scripts/audit/internal-links-localized.mjs` — `Footer.astro` not in FAIL list (the pre-existing red is `SidebarNav.astro:70`, also on `main`).                                                                                                                                                                                                                     | PASS for files in scope             |
| S4 i18n bundles stay key-parallel                                               | `node -e "..."` structural diff of `packages/templates/docs/src/i18n/{en,es}.json` returns `en-only: []  es-only: []`. New `footer.{privacy,terms,cookies}` present in both.                                                                                                                                                                                             | PASS                                |
| S5 External links carry safe rel attributes + Resources hides when github unset | Build inspection: with default `siteConfig.social = {}`, the rendered footer omits the Resources column entirely. Template `Footer.astro:52` gates the column on `githubUrl &&`; the external `<a>` carries `rel="noopener noreferrer me"` and `target="_blank"`.                                                                                                        | PASS                                |
| S6 LocaleSwitcher echo not duplicated in footer                                 | Template `Footer.astro` contains no `<LocaleSwitcher />` import or instance — matches the starter pattern (existing chrome-level switcher in `DocsLayout` stays the single instance).                                                                                                                                                                                    | PASS                                |
| S7 `apps/docs` mirror is updated in lockstep                                    | `diff packages/templates/docs/src/components/common/Footer.astro apps/docs/src/components/common/Footer.astro` reports byte-identical. BaseLayout / i18n footer keys also mirrored.                                                                                                                                                                                      | PASS                                |
| S8 CLI template cache is refreshed                                              | `packages/astro-ignite/templates/docs/src/components/common/Footer.astro` added; `src/layouts/BaseLayout.astro` and `src/i18n/{en,es}.json` modified with the same footer wiring + keys. (Unrelated cache drift from unmerged feature #49 was reverted to keep the diff scoped.)                                                                                         | PASS                                |
| S9 No new runtime dependency                                                    | `git diff main -- packages/templates/docs/package.json apps/docs/package.json` empty. `scripts/perf/run.mjs --change ... --deps` (via `pnpm perf:budget`) reports `8 runtime deps` for docs (unchanged).                                                                                                                                                                 | PASS                                |
| S10 Perf budget holds on docs pages                                             | `pnpm perf:budget --change docs-add-footer-chrome-parity-with-start` — Lighthouse step skipped cleanly (no Chrome on PATH per the documented graceful-skip in `CLAUDE.md`). Deps gate green. CI Lighthouse is authoritative.                                                                                                                                             | DEFERRED to CI                      |
| S11 All workspace gates stay green                                              | `pnpm typecheck` → 0 errors across 8 projects. `pnpm format:check` → all matched files use Prettier style (after re-formatting the just-written `audit.md`). `pnpm test` → 9/9 vitest pass. `pnpm scaffold:test` → starter scaffold ok (52/52 files, package.json rewrite, site.ts substitutions). `pnpm audit:invariants --change ...` reds are pre-existing on `main`. | PASS (per-change reds pre-existing) |
| S12 Changeset describes the addition                                            | `.changeset/docs-add-footer-chrome-parity-with-start.md` names `astro-ignite` + `create-astro-ignite` patch bumps and describes the user-visible improvement. (`@astro-ignite/docs` / `@astro-ignite/template-docs` are in `.changeset/config.json#ignore` — they ride on the parent.)                                                                                   | PASS                                |
| templates-i18n I1, I2, I4                                                       | `node scripts/audit/i18n-parallels.mjs` (via per-change audit) — PASS, 2 templates scanned.                                                                                                                                                                                                                                                                              | PASS                                |
| templates-i18n I5 internal-links-localized                                      | `node scripts/audit/internal-links-localized.mjs` — `Footer.astro` lines clean (no hardcoded internal hrefs). Built HTML shows `/legal/privacy/`, `/legal/terms/`, `/legal/cookies/` — single-locale default form of `getRelativeLocaleUrl(locale, '/legal/<slug>')`.                                                                                                    | PASS for files in scope             |
| templates-css-tokens I1, I4                                                     | `node scripts/audit/tokens-only.mjs` and `tokens-only --layered` — `Footer.astro` lines clean. The `--layered` audit is a deprecated no-op (still green).                                                                                                                                                                                                                | PASS for files in scope             |
| templates-perf I1–I5                                                            | `pnpm perf:budget`: deps green; Lighthouse skipped cleanly per documented behavior. CI authoritative.                                                                                                                                                                                                                                                                    | DEFERRED to CI                      |

## Commits made (committer logs)

```
06f5eaa chore(docs-add-footer-chrome-parity-with-start): amend design.md with workflow paths + point progress at run dir
f642cbd feat(docs-add-footer-chrome-parity-with-start): T1 add footer.{privacy,terms,cookies} keys to docs template i18n bundles
12629fa feat(docs-add-footer-chrome-parity-with-start): T2 add docs template Footer.astro
8497a14 feat(docs-add-footer-chrome-parity-with-start): T3 render <Footer /> in docs template BaseLayout
049b61f feat(docs-add-footer-chrome-parity-with-start): T4 mirror footer.{privacy,terms,cookies} keys in apps/docs i18n bundles
687fb54 feat(docs-add-footer-chrome-parity-with-start): T5 mirror Footer.astro in apps/docs
5d6e608 feat(docs-add-footer-chrome-parity-with-start): T6 render <Footer /> in apps/docs BaseLayout
2a3b89b feat(docs-add-footer-chrome-parity-with-start): T7 refresh CLI template cache (docs Footer + BaseLayout + i18n)
ab7ba8a feat(docs-add-footer-chrome-parity-with-start): T8 add changeset
```

(A `chore: T9–T14 close-out` commit follows this `impl.md` write — see the
final closeout commit in `git log`.)

## Open questions for the reviewer

1. **Pre-existing audit reds.** `internal-links-localized` and
   `tokens-only` each report one unrelated red on `main`
   (`SidebarNav.astro:70`, `config/site.ts:68 themeColor: '#fafafa'`,
   and `packages/templates/starter/src/config/site.ts:107`). They are
   out of scope for this change but cause the per-change audit
   dispatcher to exit non-zero. Confirm the reviewer is comfortable
   tracking these as a separate cleanup ticket (or instructing the
   implementer to extend scope).
2. **Scaffold:test docs coverage.** `scripts/scaffold-test.mjs` only
   exercises the starter template — there is no `--template=docs`
   path. To verify the docs side I built the docs template
   (`pnpm --filter @astro-ignite/template-docs build`) and inspected
   `dist/index.html`: the new `<footer>` renders between the slot
   body and the cookie banner with the expected Legal links. If the
   reviewer wants scaffold:test extended to a second template variant,
   that's a follow-up.
3. **Local Lighthouse skip.** No Chrome on PATH, so the local perf
   gate skipped per the documented graceful-skip in `CLAUDE.md`. CI
   `Lighthouse CI (mobile)` will be the gating signal.
4. **CLI cache scoping.** Running `copy-templates.mjs` synchronously
   refreshes every cached file from the source template. Because
   feature #49 (`docs-ship-registry-atoms-in-srccomponent`) is not yet
   on `main`, a full refresh would pull dozens of unrelated files
   (ui atoms, lib helpers, docs components). I reverted those and
   committed only the four files in scope (Footer.astro + BaseLayout +
   en.json + es.json). The reviewer should confirm this scoping is
   acceptable — the alternative would be to ship the full cache and
   risk leaking #49's content before that change merges.
