# Proposal: add-e2e-testing-to-all-templates-and-app

## Why

`pnpm scaffold:test` proves that the CLI can copy a template, install
dependencies, and produce a build that passes Lighthouse. It says nothing
about whether the page actually _behaves_ correctly: the cookie banner
might never appear, the locale switcher might jump to a 404, the theme
toggle might silently fail to toggle, the contact form might submit but
not POST, the sidebar might not link to the page that ships with the
template. Issue #27 asks us to close that gap with a workspace-level
end-to-end suite that boots each target and drives a browser.

The motivation is regression coverage that the locked practices in
`AGENTS.md` already declare are mandatory — i18n with parallel routes,
tri-state-ish theme toggle that flips `.light` on `<html>`, consent-gated
analytics, working contact form, working docs sidebar / search. Static
audits (`scripts/audit/*.mjs`) cover structure; e2e covers behavior.
Together they make "the locked practices are live in every shipped
template" a thing CI can prove, not just claim.

## Scope

In scope:

- A workspace-root Playwright install with one `playwright.config.ts`
  that defines one **project** per target. Each project boots its own
  Astro dev or preview server via Playwright's `webServer` option.
- A `tests/e2e/` tree at the workspace root containing:
  - `tests/e2e/shared/` — small helpers for the things every target
    exercises (capture console errors, click the theme toggle, read /
    seed `cookie-consent` in localStorage, mock an analytics endpoint,
    mock the email transport, fixture data for `siteConfig.locales`).
  - `tests/e2e/common/` — parametrised specs that run against every
    non-playground target (homepage console, header/footer nav, theme
    toggle, locale switcher, 404, cookie banner, analytics gating).
  - `tests/e2e/starter/` — starter-only specs (contact form, blog
    index → post).
  - `tests/e2e/docs-template/` — docs-template-only specs (sidebar nav,
    MDX content, search dialog open / pagefind smoke).
  - `tests/e2e/site/`, `tests/e2e/docs-app/`, `tests/e2e/playground/` —
    target-shaped specs that point at the same shared / common specs
    plus any app-specific overrides.
- `pnpm test:e2e` at the workspace root that runs the full suite.
  `pnpm test:e2e --project=<name>` runs one target.
- CI: a new `e2e` job in `.github/workflows/ci.yml` that runs
  `pnpm test:e2e` after Playwright installs its browsers, alongside the
  existing `e2e-scaffold` job.
- Delta requirements filed against `templates-i18n`,
  `templates-css-tokens`, `templates-consent`, and `cli-scaffold` that
  add e2e coverage as a verification mechanism for each capability's
  existing invariants. No long-lived spec is rewritten — only
  `## ADDED Requirements` sections in the delta files.
- Documentation: `tests/e2e/AGENTS.md` plus short pointers in the
  workspace `AGENTS.md`, each template's `AGENTS.md`, and each app's
  `AGENTS.md` so contributors know where to add a spec.
- A changeset summarising the new test harness (no public API impact).

Out of scope:

- Visual / screenshot regression. `expect(page).toHaveScreenshot()` is
  flaky across CI runners without a baseline pipeline; defer.
- Cross-browser matrix. Only Chromium runs in CI to start; Firefox /
  WebKit projects are wired in the config but disabled by default.
  (Lighthouse + scaffold:test already exercise build / runtime; the
  point of this suite is _behavior_, not browser quirks.)
- Performance / Lighthouse budgets. Already covered by `pnpm perf:budget`
  and `.lighthouserc.json`.
- Modifying any `packages/templates/*/src/` or `apps/*/src/` _behavior_.
  E2e tests _observe_ existing code; if a test exposes a real bug, that
  is a separate change, not part of this one.
- A blog-only template, the harness scaffolding feature, or any other
  feature listed under a different id in `openspec/feature_list.json`.
  This change adds tests for what ships today.
- Tri-state ("light / dark / system") cycling for the theme toggle.
  `packages/templates/starter/src/components/ThemeToggle.astro` is
  binary (light ↔ dark, system as the unset default). The spec asserts
  the implemented behaviour; if we ever expand to a three-state cycle,
  the test updates with the component, not the other way around.

## Scenarios

### S1 — Workspace exposes `pnpm test:e2e`

- **GIVEN** the workspace at HEAD on this branch
- **WHEN** `pnpm test:e2e --list` runs from the repo root
- **THEN** it exits 0 and lists at least one spec per target
  (`starter`, `docs-template`, `site`, `docs-app`, `playground`).
  Playwright is resolvable from the root `node_modules`.

### S2 — Each non-playground target's homepage loads without console errors

- **GIVEN** any of the targets `starter`, `docs-template`, `site`,
  `docs-app` are booted by their Playwright project's `webServer`
- **WHEN** the test navigates to `/`
- **THEN** the response is 200, the `<title>` is non-empty, and no
  `page.on('console', ...)` events of severity `error` have fired
  (favicon 404s and other known-noise messages are filtered through an
  allow-list in `tests/e2e/shared/console.ts`).

### S3 — Header internal nav navigates to the expected route

- **GIVEN** any non-playground target's home page
- **WHEN** the test clicks each link in `<header>` whose `href` is
  internal (starts with `/` or the current origin)
- **THEN** the resulting URL matches the link's `href` after
  `getRelativeLocaleUrl` normalisation, no console errors fire, and the
  next page's `<h1>` is present. Verifies `templates-i18n` I5 in a live
  browser, not just statically.

### S4 — Footer legal links navigate

- **GIVEN** the starter or docs target's home page
- **WHEN** the test clicks each legal link in the footer
  (privacy, terms, cookies)
- **THEN** the page navigates to `/legal/<slug>`, a `<h1>` is rendered,
  and the JSON-LD `@graph` block is present. (Cross-check for
  `templates-seo-jsonld` — non-binding, no new invariant.)

### S5 — Theme toggle flips `<html>.classList` and persists

- **GIVEN** any non-playground target's home page on first visit
  (localStorage cleared via `context.addInitScript`)
- **WHEN** the test clicks the theme toggle once
- **THEN** `<html>.classList.contains('light')` is `true`,
  `localStorage.getItem('theme')` is `'light'`, and after a full-page
  reload the class is still present (verifies the anti-flash inline
  script reads from localStorage). A second click toggles back to dark
  and clears `.light`.

### S6 — Locale switcher swaps to the localized route

- **GIVEN** a test-only fixture that runs the same target with
  `siteConfig.locales = ['en', 'es']` (an env-var-gated override in
  `astro.config.mjs` for the e2e dev server, _not_ a permanent
  template change)
- **WHEN** the user is on `/about` and clicks the Spanish entry in the
  LocaleSwitcher
- **THEN** the URL becomes `/es/about`, the `<html lang>` attribute
  becomes `es`, and the LocaleSwitcher no longer shows "Spanish" as a
  selectable option for the current page. Verifies `templates-i18n` I6
  in a live browser.

### S7 — LocaleSwitcher stays hidden when only one locale is configured

- **GIVEN** the default target with `siteConfig.locales = ['en']`
- **WHEN** the home page renders
- **THEN** the LocaleSwitcher is either absent from the DOM or rendered
  with no clickable entries. Guards against shipping a confusing
  single-locale switcher.

### S8 — Cookie banner appears on a fresh visit

- **GIVEN** a fresh browser context (cleared storage, no
  `cookie-consent` value)
- **WHEN** the test navigates to `/` for any target whose template ships
  `CookieBanner.astro`
- **THEN** `#cookie-banner` is visible, contains the policy link to
  `/legal/cookies` (or `[lang]/legal/cookies`), and Plausible /
  configured analytics endpoint has not been requested
  (`page.route('https://plausible.io/**', route => { hits++; ... })`
  asserts `hits === 0` for the duration of the visit). Verifies
  `templates-consent` I1–I3.

### S9 — Analytics fires after consent

- **GIVEN** the cookie banner is visible
- **WHEN** the test clicks "Accept"
- **THEN** the banner hides, `localStorage.getItem('cookie-consent')`
  is `'accept'`, and on the next navigation a request to the configured
  analytics endpoint fires exactly once. Verifies `templates-consent`
  I1 in the "consent granted" branch.

### S10 — 404 page renders for an unknown route

- **GIVEN** any target's dev server
- **WHEN** the test navigates to `/this-route-does-not-exist`
- **THEN** the response is 404, the page renders the template's
  `404.astro` (visible heading text matches the template's known 404
  copy), and no console errors fire.

### S11 — Starter contact form submits with mocked email

- **GIVEN** the starter dev server with the email transport patched at
  the boundary (`MOCK_EMAIL=1` env var routes `sendContactEmail` to a
  no-op that records calls; OR Playwright intercepts the POST and
  returns a synthetic success — implementer picks one and documents it
  in the test)
- **WHEN** the test fills name / email / message on `/contact` and
  clicks "Send"
- **THEN** the success state renders on the same page (Astro Actions
  flow), the recorded mock has been called exactly once with the
  submitted payload, and no real `https://api.resend.com/**` request
  has been made.

### S12 — Starter blog index navigates to a post

- **GIVEN** the starter home page
- **WHEN** the test clicks the "Blog" header link, then clicks the
  first post card on `/blog`
- **THEN** the URL matches `/blog/<slug>` for a slug that exists under
  `src/content/blog/en/`, an `<article>` is rendered, and the page's
  `BlogPosting` JSON-LD node is present inside the layout's `@graph`.

### S13 — Docs sidebar navigates between pages

- **GIVEN** the docs-template dev server's home page
- **WHEN** the test clicks each link in the sidebar (`SidebarNav.astro`)
- **THEN** each click resolves to a 200 with the expected `<h1>` and no
  console errors.

### S14 — Docs MDX page renders prose + callouts

- **GIVEN** the docs-template dev server
- **WHEN** the test navigates to a page that exercises Callout +
  CodeBlock + ComponentShowcase
- **THEN** the page renders, the rendered prose contains the expected
  text, and Callout / CodeBlock components have rendered their expected
  ARIA roles / classes.

### S15 — Docs search dialog opens; built-site search returns results

- **GIVEN** the docs-template's _built_ site served by `astro preview`
  (Playwright project `docs-template-built` uses `pnpm build && astro
preview` so the `postbuild: pagefind --site dist` step has run)
- **WHEN** the test presses Cmd/Ctrl+K (or clicks the search trigger)
- **THEN** the `<dialog>` opens, the pagefind bundle loads, typing
  "introduction" (or another known string in the docs template's
  content) returns at least one result, and clicking a result navigates
  to the matching page. Under the dev-server Playwright project the
  test only asserts that the dialog opens and shows the
  "search-only-in-prod" hint — it does not assert results, because the
  pagefind bundle does not exist under `astro dev`.

### S16 — Playground smoke

- **GIVEN** CI has just regenerated `apps/playground/` via
  `pnpm scaffold:test --full` (Playwright project depends on the
  scaffold step)
- **WHEN** Playwright boots `apps/playground` and visits `/` and
  `/this-route-does-not-exist`
- **THEN** both load with the expected headings, no console errors,
  and no real analytics request. This is a thin smoke — the deeper
  coverage comes from the `starter` project on the canonical template.

### S17 — CI runs the suite

- **GIVEN** the change is merged
- **WHEN** the next push or PR runs `.github/workflows/ci.yml`
- **THEN** a new `e2e` job runs, installs Playwright browsers (with the
  `actions/cache` hash on `pnpm-lock.yaml`), invokes
  `pnpm test:e2e --project=starter --project=docs-template
 --project=site --project=docs-app`, and a separate
  `e2e-scaffold-then-playground` job runs the playground smoke after
  scaffold. Any failure marks the workflow red.

### S18 — Tests are offline / deterministic

- **GIVEN** the suite runs in an environment without outbound network
  (or with all network blocked except the dev server)
- **WHEN** `pnpm test:e2e` runs
- **THEN** every spec passes. No spec depends on `resend.com`,
  `plausible.io`, `fonts.bunny.net`, or any other external host —
  fonts are already self-hosted by the templates, and every other
  external call is mocked at the `page.route` layer or stubbed via env
  var.

### S19 — Adding a spec follows a documented workflow

- **GIVEN** a contributor adds a new e2e spec for the starter
- **WHEN** they follow `tests/e2e/AGENTS.md`
- **THEN** the spec lives at `tests/e2e/starter/<slug>.spec.ts`, runs
  under the `starter` project automatically (Playwright's `testMatch`
  picks it up), and the existing helpers in `tests/e2e/shared/` are
  reused rather than re-implemented.

### S20 — Workspace-level format / typecheck / lint stay green

- **GIVEN** the change is on the branch
- **WHEN** `pnpm format:check`, `pnpm typecheck`, and `pnpm lint` run
- **THEN** all three exit 0. The Playwright TypeScript project resolves
  via `tests/e2e/tsconfig.json` (separate from `packages/*` and
  `apps/*`) so the test files type-check without polluting the
  template's tsconfig include lists.

### S21 — `pnpm audit:invariants --change add-e2e-testing-to-all-templates-and-app` passes

- **GIVEN** the change at HEAD
- **WHEN** the audit dispatcher reads `design.md`'s "Invariants this
  change touches" section
- **THEN** every cited audit command exits 0. The new invariants this
  change adds (e2e-coverage requirements per capability) audit by
  running the corresponding `pnpm test:e2e --grep ...` subset and
  treating exit 0 as the audit pass.
