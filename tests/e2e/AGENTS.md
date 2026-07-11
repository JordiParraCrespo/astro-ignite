# tests/e2e — Playwright suite

End-to-end tests for the templates and apps that ship in this repo.
Drives a real browser (Chromium by default) against each target's
running dev server (or built+previewed site) and asserts the locked
practices declared in [AGENTS.md](../../AGENTS.md) actually work for
users — not just that the source files exist.

## Layout

```
tests/e2e/
  AGENTS.md                       # this file
  tsconfig.json                   # isolated TS project — does not pollute templates
  shared/                         # console allow-list, theme, consent, locale, email helpers
  common/                         # parametrised specs (run on every non-playground target)
  starter/                        # @astro-ignite/template-starter only
  docs-template/                  # @astro-ignite/template-docs only (dev-server half)
  docs-template-built/            # docs template against astro preview after pagefind builds
  site/                           # apps/site only
  docs-app/                       # apps/docs only
  playground/                     # apps/playground smoke (gated on PLAYWRIGHT_PLAYGROUND_READY=1)
  playwright-report/              # html report (gitignored)
  test-results/                   # per-run artifacts (gitignored)
```

Each project's `webServer` boots the right command (`astro dev` or
`astro preview`) on a port unique to that project, so a full
`pnpm test:e2e` can run targets in parallel.

## Adding a spec

1. Pick the target. Project-specific specs live under that target's
   directory; cross-target specs go under `common/` and are picked up
   by every project that opts in via `targets.ts`.
2. Reuse the helpers in [`shared/`](./shared/) rather than re-rolling
   network mocks or storage helpers. Add to `shared/` only when the new
   helper would be needed by ≥ 2 specs.
3. Tag the test with one of the canonical `@grep` markers so
   `pnpm audit:invariants` and CI sub-filtering can find it:
   - `@nav` — header / footer navigation, internal links, 404
   - `@theme` — theme toggle behaviour
   - `@i18n` — LocaleSwitcher behaviour
   - `@consent-pregate` — banner + analytics-silent pre-consent
   - `@consent-postgate` — banner accept → analytics-fires post-consent
   - `@starter`, `@docs`, `@docs-built`, `@site`, `@docs-app`,
     `@playground` — target-specific tags
4. Do **not** edit template runtime code from a test. If the test
   exposes a real bug, open a separate change.

## Env-var contract

| Variable                      | Set by                               | Effect                                                                                                                                     |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `SITE_E2E`                    | playwright.config.ts (webServer.env) | Templates can short-circuit prod-only code in `astro.config.mjs`. Templates currently make no use of it; reserved for future feature work. |
| `SITE_E2E_LOCALES`            | playwright config / per-spec env     | Comma-separated list of locales for the two-locale fixture. Reserved for fixtures that exercise a non-default-locale flow.                 |
| `PLAYWRIGHT_PLAYGROUND_READY` | CI after scaffold step               | Enables the `playground` Playwright project. Off locally so contributors who haven't run `pnpm scaffold:test --full` are not blocked.      |
| `CI`                          | GitHub Actions                       | Enables retry, single-worker mode, and forbids `test.only`.                                                                                |

## Local debug

```bash
pnpm test:e2e                                 # full suite
pnpm test:e2e --list                          # enumerate, no run
pnpm test:e2e --project=starter               # one target
pnpm test:e2e --project=starter --headed      # see the browser
pnpm test:e2e --project=starter --debug       # PWDEBUG=1 inspector
pnpm exec playwright test --ui                # interactive UI
pnpm exec playwright show-report tests/e2e/playwright-report
```

## Network mocks — the contract

- **Analytics**: every spec runs `trackAnalyticsHits(page)` (from
  `shared/consent.ts`) which `page.route`'s the configured analytics
  host (default `plausible.io`) and aborts every request. The test
  asserts on the aborted-count, not on the real Plausible response.
- **Email**: `shared/email.ts > blockResend(page)` blocks
  `api.resend.com` at the browser layer via `page.route`, so the real
  Resend API is never reached. It only _observes_ (via
  `page.on('request')`, not `page.route`) requests to the Astro
  Actions endpoint to count hits — it doesn't intercept them, because
  `page.route` interception broke Astro's 303-redirect-with-cookie
  flow for form-style action submissions. The dev server does invoke
  the real `contact` action handler and `sendContactEmail`; the
  Resend transport itself no-ops (logs instead of sending) because
  `RESEND_API_KEY` is unset in the test env.
- **Fonts / CDNs**: every template ships the system font stack only —
  no remote font fetches. No spec depends on an external host being
  reachable.

No spec depends on real outbound network. Run the suite offline; it
must still pass.
