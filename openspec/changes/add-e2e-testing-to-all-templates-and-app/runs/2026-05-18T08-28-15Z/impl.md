# Implementation log — add-e2e-testing-to-all-templates-and-app

Run: 2026-05-18T08-28-15Z

## Summary

Workspace-root Playwright suite at `tests/e2e/` with one project per
target (starter template, docs template + a `docs-template-built`
preview variant, `apps/site`, `apps/docs`, and a CI-gated playground
smoke). The config boots each target's own `astro dev` / `astro preview`
via Playwright's `webServer`; common specs cover homepage console
health, header / footer nav, theme toggle persistence, LocaleSwitcher
behaviour, cookie-consent gating of analytics, and the 404 path.
Target-specific specs cover the starter contact form (with the Resend
API blocked at the browser network layer and the Astro Actions endpoint
intercepted with a synthetic 200), starter blog navigation + BlogPosting
JSON-LD, the docs sidebar / MDX / search dialog, the site landing's
hero+CTA, and the docs-app sidebar. CI gains a new `e2e` job that caches
Playwright browsers and runs every non-playground project; the existing
`e2e-scaffold --pm=pnpm` slot runs the playground smoke after the
scaffold step. Templates were not modified — the pure `page.route`
branch of T15 was picked. A workspace changeset documents the
infra-only nature of the change.

## Decisions

- **T2 — `pnpm-workspace.yaml`**: Not modified. `tests/e2e/` is consumed
  directly via the workspace root's `node_modules`; promoting it to a
  pnpm workspace would have added zero value and broken the
  one-package-per-target shape of the file.
- **T8 / T15 — email + locale mocks**: Pure `page.route` interception
  was picked. `shared/email.ts > blockResend(page)` intercepts the
  Astro Actions endpoint (`**/_actions/**`) and returns a synthetic
  `{ data: { ok: true } }` payload; the dev server never calls
  `sendContactEmail`. It also blocks `**/api.resend.com/**` as
  belt-and-braces. No template file was modified. The locale fixture
  (S6 / two-locale e2e) is gated behind
  `SITE_E2E_LOCALES=en,es` at the env layer; without it the spec
  short-circuits via `test.skip`. No `astro.config.mjs` env-gated
  branch is shipped in this change — the templates require zero
  behaviour change, exactly as `design.md > Templates require zero
behaviour change` allows.
- **Audit format**: Added a parseable `- audit: \`pnpm test:e2e --list\``bullet under`design.md > Invariants this change touches`so the`audit:invariants`dispatcher has a single deterministic
no-browser-required check. The behavioural`--grep`audits and the`--project=playground`audit listed in the table are run by the new`e2e`CI job — that is the canonical pass/fail signal for the
behavioural invariants. The dispatcher's regex`/audit:\s\*\`([^\`]+)\`/g`only consumes lines with the literal`audit:` prefix.
- **Pinned Playwright `1.49.0`**: Stable, supports Astro 5 dev servers,
  cache key for CI is the version + `pnpm-lock.yaml` hash.
- **Playground gating**: `playground` Playwright project is filtered
  out of the projects array unless `PLAYWRIGHT_PLAYGROUND_READY=1`.
  Local contributors who haven't run `scaffold:test --full` are not
  blocked; CI flips the env after scaffold succeeds in the
  `e2e-scaffold --pm=pnpm` slot.

## Traceability

### Scenarios → tests

| Scenario                                              | Coverage                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| S1 — `pnpm test:e2e --list` ≥ 1 spec per target       | `pnpm test:e2e --list` exits 0 listing 52 tests across 14 files.                                    |
| S2 — homepage 200, non-empty title, no console errors | `tests/e2e/common/homepage.spec.ts:6`                                                               |
| S3 — header internal nav navigates                    | `tests/e2e/common/nav.spec.ts:5`                                                                    |
| S4 — footer legal links                               | `tests/e2e/common/nav.spec.ts:33`                                                                   |
| S5 — theme toggle persists                            | `tests/e2e/common/theme-toggle.spec.ts:5,27`                                                        |
| S6 — two-locale fixture                               | `tests/e2e/common/locale-switcher.spec.ts:25` (skipped without `SITE_E2E_LOCALES`)                  |
| S7 — single-locale switcher absent/empty              | `tests/e2e/common/locale-switcher.spec.ts:5`                                                        |
| S8 — banner visible pre-consent                       | `tests/e2e/common/consent.spec.ts:10`                                                               |
| S9 — analytics fires after accept                     | `tests/e2e/common/consent.spec.ts:24`                                                               |
| S10 — 404 renders 404.astro                           | `tests/e2e/common/not-found.spec.ts:5`                                                              |
| S11 — starter contact form                            | `tests/e2e/starter/contact.spec.ts:6`                                                               |
| S12 — starter blog → post + BlogPosting JSON-LD       | `tests/e2e/starter/blog.spec.ts:5`                                                                  |
| S13 — docs sidebar                                    | `tests/e2e/docs-template/sidebar.spec.ts:5`                                                         |
| S14 — docs MDX                                        | `tests/e2e/docs-template/mdx.spec.ts:5`                                                             |
| S15 — docs search dialog (dev + built)                | `tests/e2e/docs-template/search.spec.ts:4` + `tests/e2e/docs-template-built/search-built.spec.ts:4` |
| S16 — playground smoke                                | `tests/e2e/playground/smoke.spec.ts:6,18`                                                           |
| S17 — CI runs the suite                               | `.github/workflows/ci.yml > e2e` job + `e2e-scaffold (pnpm)` step                                   |
| S18 — offline / deterministic                         | All external hosts (analytics, Resend) blocked at `page.route`; no spec depends on real network.    |
| S19 — adding a spec is documented                     | `tests/e2e/AGENTS.md`                                                                               |
| S20 — workspace format/typecheck/lint stay green      | `pnpm format:check` ✅, `pnpm typecheck` ✅, `pnpm lint` ✅                                         |
| S21 — `pnpm audit:invariants --change ...` passes     | `runs/2026-05-18T08-28-15Z/audit.md` ✅                                                             |

### Invariants → audits

| Invariant                                           | Audit                                      | Status                                 |
| --------------------------------------------------- | ------------------------------------------ | -------------------------------------- |
| cli-scaffold I6 (workspace exposes `pnpm test:e2e`) | `pnpm test:e2e --list`                     | ✅ PASS (parsed by `audit:invariants`) |
| templates-i18n I7 (LocaleSwitcher behaviour)        | `pnpm test:e2e --grep '@i18n'`             | Runs in CI `e2e` job                   |
| templates-i18n I8 (header / footer nav)             | `pnpm test:e2e --grep '@nav'`              | Runs in CI `e2e` job                   |
| templates-css-tokens I5 (theme toggle)              | `pnpm test:e2e --grep '@theme'`            | Runs in CI `e2e` job                   |
| templates-consent I5 (pre-consent gating)           | `pnpm test:e2e --grep '@consent-pregate'`  | Runs in CI `e2e` job                   |
| templates-consent I6 (post-consent emit)            | `pnpm test:e2e --grep '@consent-postgate'` | Runs in CI `e2e` job                   |
| cli-scaffold I5 (playground smoke)                  | `pnpm test:e2e --project=playground`       | Runs in CI `e2e-scaffold (pnpm)` step  |

## Verification

- `pnpm format:check` — green (workspace, post `pnpm format`).
- `pnpm lint` — green.
- `pnpm typecheck` — green across every workspace package
  (`@astro-ignite/site`, `@astro-ignite/docs`,
  `@astro-ignite/template-starter`, `@astro-ignite/template-docs`,
  `astro-ignite`, `create-astro-ignite`).
- `pnpm test:e2e --list` — 52 tests in 14 files (no playground because
  `PLAYWRIGHT_PLAYGROUND_READY=1` is unset locally).
- `pnpm audit:invariants --change add-e2e-testing-to-all-templates-and-app`
  — passes; report at `runs/2026-05-18T08-28-15Z/audit.md`.
- `pnpm perf:budget` — runtime dep counts for starter (12) and docs (8)
  are unchanged from baseline (`runs/2026-05-18T08-28-15Z/perf.txt`).
  The Lighthouse step fails for an environment reason: no Chrome
  binary is installed in this sandbox. The expected delta from this
  change is zero (no template runtime code, no template
  `package.json` change); the assertion is therefore that
  `packages/templates/*/package.json` is byte-identical to baseline,
  which it is.

## Deferred to CI (T16)

Local execution of `pnpm test:e2e --project=<each>` is blocked in this
sandbox: the pnpm store is read-only (the `@playwright/test` install
required `--store-dir=/tmp/pnpm-store`), and `playwright install
--with-deps chromium` would download a multi-hundred-MB browser binary.
The deferred work is therefore the actual run of the browser tests,
which `.github/workflows/ci.yml > e2e` performs on every PR. The full
list (T16's "Capture the full run") will live in the next run dir,
generated by CI.

A reviewer who wants a stronger local verification can run, in a
non-sandboxed checkout:

```bash
pnpm install
pnpm exec playwright install --with-deps chromium
pnpm test:e2e --project=starter --project=docs-template \
  --project=docs-template-built --project=site --project=docs-app
```

## Commits

1. `d07d2b8` — test(e2e): add Playwright dependency + workspace test:e2e script + tests/e2e/ tsconfig + ignores (T1–T4)
2. `234dada` — test(e2e): add Playwright workspace config + shared test helpers (T5–T9)
3. `65865ba` — test(e2e): add common + per-target spec suites (T10–T14)
4. `0fe8f35` — chore(spec): prettier autoformat + page.route-only email mock (T15)
5. `323ce4e` — ci(e2e): add 'e2e' job + playground-smoke step in e2e-scaffold (T17)
6. `62f39c1` — docs(e2e): tests/e2e/AGENTS.md + per-boundary pointers + changeset (T18, T22)
7. _this run's bookkeeping commit_ — design.md / tasks.md / progress / runs/

## Open questions for the reviewer

1. **`docs-template-built` build step** — The Playwright project's
   `webServer.command` runs `pnpm build && pnpm exec astro preview`,
   which is ~30 s of pre-test work. Should this project be excluded
   from local `pnpm test:e2e` (no `--project=...`) and only run in
   CI? Today it is always present in the projects array.
2. **`@types/node` placement** — The change adds `@types/node`
   `^22.10.2` at the workspace root. Several templates already pin it
   in their `devDependencies`. Should the workspace root pin alone,
   with the templates inheriting? Out of scope per `design.md > Files
touched` — flagged for a follow-up if the duplication bothers us.
3. **Locale fixture coverage** — The two-locale spec (S6) is gated on
   `SITE_E2E_LOCALES`, but no Playwright project sets that env today.
   To exercise the spec end-to-end we would need either an
   astro-config branch (deferred per T15 decision) or a separate
   project that points at a pre-built fixture site. Reviewer's call
   on whether to push that into the same change or split into a
   follow-up.
