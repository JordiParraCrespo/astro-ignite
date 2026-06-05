# Design: docs-add-footer-chrome-parity-with-start

## Files touched

### `packages/templates/docs/` — the docs template (source of truth)

- NEW `packages/templates/docs/src/components/common/Footer.astro` —
  docs-flavored footer chrome. Mirrors the structural shape of
  `packages/templates/starter/src/components/common/Footer.astro` but
  with three deliberate trim points:
  1. The Legal column drops the in-column RSS link (the docs template
     ships no `rss.xml.ts` — see "Rejected alternatives"). The column
     contains exactly three items: Privacy, Terms, Cookies.
  2. A second "Resources" column (rendered only when
     `siteConfig.social.github` is set) lists "GitHub" as the single
     external link with `rel="noopener noreferrer me"` and
     `target="_blank"`. The starter's full `social` map iteration is
     replaced by this single-entry resources column because the docs
     template's `social` field defaults to `{}` and only the GitHub
     repo is meaningful in a docs context.
  3. The top description paragraph reads from
     `siteConfig.description[locale]` (same as the starter); the brand
     mark line above it uses `siteConfig.name[locale]` rendered through
     `<Text variant="body" weight="semibold">` — no `<Brand />` import
     (the brand mark is heavy and the starter's footer doesn't use it
     either; this keeps parity).
  - Styling: Tailwind arbitrary-value utilities resolving to
    `--color-fg`, `--color-fg-muted`, `--color-border`, etc. No scoped
    `<style>` block. The footer is below-the-fold by definition, so
    the templates-css-tokens "layered CSS" heuristic (which only flags
    `Hero.astro` / `Header.astro` overuse) does not apply to it.
  - Body copy renders through `<Text>` (the `ui/text.astro` atom that
    landed via #40 / `docs-use-the-text-component-for-all-typo`): the
    site-name line is `<Text variant="body" weight="semibold">`, the
    description is `<Text variant="muted">`, the column headings are
    `<Text variant="h4" as="h3">`, and the copyright + "Built with"
    bottom row uses `<Text variant="small" tone="muted">`. Raw
    `<h3>` / `<p>` with inline typography utilities are not used.
- MOD `packages/templates/docs/src/layouts/BaseLayout.astro` —
  add `import Footer from '@/components/common/Footer.astro';` and
  render `<Footer />` after the `<slot />` in the `<body>`. The
  current body shape is:
  ```html
  <body>
    <a href="#main" class="skip-link">…</a>
    <slot />
    <CookieBanner />
  </body>
  ```
  The new shape is:
  ```html
  <body>
    <a href="#main" class="skip-link">…</a>
    <slot />
    <footer />
    <CookieBanner />
  </body>
  ```
  The `<CookieBanner />` stays last so it overlays everything else
  including the footer. No other change to BaseLayout.
- MOD `packages/templates/docs/src/i18n/en.json` — add three keys
  inside the existing `"footer"` block: `"privacy": "Privacy"`,
  `"terms": "Terms"`, `"cookies": "Cookies"`. Insertion order matches
  the starter so a diff between the two bundles is small.
- MOD `packages/templates/docs/src/i18n/es.json` — add the same three
  keys with Spanish values: `"privacy": "Privacidad"`, `"terms":
"Términos"`, `"cookies": "Cookies"`. (The Spanish "Cookies" stays the
  English loanword to match the starter's es.json.)

### `apps/docs/` — manual mirror

Per `apps/docs/CLAUDE.md`, this app is a manual mirror of the docs
template — the same files change in the same PR:

- NEW `apps/docs/src/components/common/Footer.astro` — verbatim copy of
  the template file (alias imports `@/...` resolve through the
  apps/docs `tsconfig`).
- MOD `apps/docs/src/layouts/BaseLayout.astro` — same Footer import +
  placement as the template.
- MOD `apps/docs/src/i18n/en.json` and `apps/docs/src/i18n/es.json` —
  add the three new `footer.{privacy,terms,cookies}` keys.

### `packages/astro-ignite/templates/docs/` — CLI template cache

- MOD `packages/astro-ignite/templates/docs/src/components/common/Footer.astro`
  (NEW after refresh), the cached `BaseLayout.astro`, and the cached
  `i18n/{en,es}.json` files — refreshed by running
  `packages/astro-ignite/scripts/copy-templates.mjs` as part of the
  prepack step (or by hand once). The implementer commits the
  resulting diff alongside the template changes so a fresh `pnpm pack`
  ships the chrome.

### `.changeset/` — version bump record

- NEW `.changeset/docs-add-footer-chrome-parity-with-start.md` —
  changeset naming the three affected packages
  (`@astro-ignite/template-docs`, `@astro-ignite/docs`, `astro-ignite`)
  as `patch` bumps. Body explains the user-visible improvement:
  scaffolded docs sites now render a footer with legal-page entry
  points, brand mark, and an attribution line; existing users can
  mirror the change by copying `Footer.astro` from the template and
  inserting `<Footer />` into their `BaseLayout`.

### Spec deltas (under this change's `specs/` tree)

- NEW
  `openspec/changes/docs-add-footer-chrome-parity-with-start/specs/templates-i18n/spec.md`
  — adds one `## ADDED Requirements` scenario covering the docs
  template's footer chrome and its locale-aware links / key-parallel
  i18n bundles. The long-lived spec already covers the "internal
  links use `getRelativeLocaleUrl`" and "LocaleSwitcher in chrome"
  invariants that apply here; the delta just pins the footer as a
  chrome surface that the locked practices apply to.
- NEW
  `openspec/changes/docs-add-footer-chrome-parity-with-start/specs/templates-css-tokens/spec.md`
  — empty `## ADDED Requirements` block (no new requirements); the
  change is bound by the existing I1 and I4 invariants against the
  new component file.
- NEW
  `openspec/changes/docs-add-footer-chrome-parity-with-start/specs/templates-perf/spec.md`
  — empty `## ADDED Requirements` block; the change is bound by the
  existing I1 / I3 / I4 / I5 invariants against the clean docs build.

### Workflow artifacts (per the implementer protocol)

- MOD `openspec/changes/docs-add-footer-chrome-parity-with-start/design.md`
  — this file; amended in-flight by the implementer when workflow
  paths need to be declared.
- MOD `openspec/changes/docs-add-footer-chrome-parity-with-start/tasks.md`
  — checkboxes flipped to `[x]` as tasks land.
- MOD `openspec/changes/docs-add-footer-chrome-parity-with-start/runs/`
  — run-scoped reports (`impl.md`, `audit.md`, `perf.md`, `review.md`)
  emitted by the implementer / dispatchers / reviewer.
- MOD `openspec/progress/current.md` — pointer to the active run dir.

## New signatures

### `Footer.astro` (template + apps/docs mirror)

```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';

import Text from '@/components/ui/text.astro';
import { siteConfig } from '@/config/site';
import { useTranslations } from '@/i18n';

const locale = Astro.currentLocale ?? siteConfig.defaultLocale;
const t = useTranslations(locale);
const siteName = siteConfig.name[locale] ?? siteConfig.name[siteConfig.defaultLocale]!;
const description =
  siteConfig.description[locale] ?? siteConfig.description[siteConfig.defaultLocale]!;

const legalLinks = [
  { label: t('footer.privacy'), href: getRelativeLocaleUrl(locale, '/legal/privacy') },
  { label: t('footer.terms'), href: getRelativeLocaleUrl(locale, '/legal/terms') },
  { label: t('footer.cookies'), href: getRelativeLocaleUrl(locale, '/legal/cookies') },
];

const githubUrl = typeof siteConfig.social.github === 'string' ? siteConfig.social.github : null;
const docsHomeHref = getRelativeLocaleUrl(locale, '/');

const year = new Date().getFullYear();
---

<footer class="border-t border-[var(--color-border)] mt-16">
  <div class="max-w-[80rem] mx-auto px-5 py-10 grid gap-8 md:grid-cols-4">
    <div class="md:col-span-2">
      <Text variant="body" weight="semibold">{siteName}</Text>
      <Text variant="muted" class="mt-2 max-w-md">{description}</Text>
    </div>

    <div>
      <Text variant="h4" as="h3" class="mb-3">{t('footer.legal')}</Text>
      <ul class="space-y-2">
        {
          legalLinks.map((link) => (
            <li>
              <a
                href={link.href}
                class="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                {link.label}
              </a>
            </li>
          ))
        }
      </ul>
    </div>

    {
      githubUrl && (
        <div>
          <Text variant="h4" as="h3" class="mb-3">
            {t('footer.social')}
          </Text>
          <ul class="space-y-2">
            <li>
              <a
                href={docsHomeHref}
                class="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                {t('nav.documentation')}
              </a>
            </li>
            <li>
              <a
                href={githubUrl}
                rel="noopener noreferrer me"
                target="_blank"
                class="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      )
    }
  </div>

  <div class="border-t border-[var(--color-border)]">
    <div
      class="max-w-[80rem] mx-auto px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
    >
      <Text variant="small" tone="muted">© {year} {siteName}. {t('footer.rights')}</Text>
      <Text variant="small" tone="muted">{t('footer.builtWith')}</Text>
    </div>
  </div>
</footer>
```

The component takes no props — every value comes from `siteConfig` or
`useTranslations(locale)`.

### `BaseLayout.astro` diff (template + apps/docs mirror)

```diff
 import CookieBanner from '@/components/legal/CookieBanner.astro';
 import Analytics from '@/components/common/Analytics.astro';
+import Footer from '@/components/common/Footer.astro';
@@
   <body>
     <a href="#main" class="skip-link">Skip to main content</a>
     <slot />
+    <Footer />
     <CookieBanner />
   </body>
```

### i18n bundle diff (template + apps/docs mirror, both en.json and es.json)

```diff
   "footer": {
     "rights": "All rights reserved.",
     "builtWith": "Built with astro-ignite.",
     "rss": "RSS feed",
     "legal": "Legal",
-    "social": "Social"
+    "social": "Social",
+    "privacy": "Privacy",
+    "terms": "Terms",
+    "cookies": "Cookies"
   },
```

(Spanish values: `"Privacidad"`, `"Términos"`, `"Cookies"`.)

## Invariants this change touches

This change is constrained by the following invariants from the
capabilities it touches. Each invariant is identified by its `I<n>` id
in the matching `openspec/specs/<capability>/spec.md` and audited by
the cited command.

### `templates-i18n` (`openspec/specs/templates-i18n/spec.md`)

- **I1** — Default locale at `/`, non-default at `/[lang]/`.
  Audit: `node scripts/audit/i18n-parallels.mjs`.
  Untouched directly (no new page is added), but the new Footer
  renders on every `[lang]/` parallel via BaseLayout, so the localized
  link surface must keep working end-to-end.
- **I2** — `getStaticPaths` emits one entry per locale minus default.
  Audit: `node scripts/audit/i18n-parallels.mjs --strict`.
  Untouched — no new page.
- **I4** — `siteConfig.locales` defaults to `['en']`.
  Audit: `node scripts/audit/i18n-parallels.mjs --config`.
  Untouched — we don't modify `siteConfig`.
- **I5** — Internal links use `getRelativeLocaleUrl`.
  Audit: `node scripts/audit/internal-links-localized.mjs`.
  Applies directly: every legal-column link and the docs-landing
  link in the resources column are built via
  `getRelativeLocaleUrl(locale, '/legal/<slug>')` or
  `getRelativeLocaleUrl(locale, '/')`. The GitHub link is external
  and exempt.
- **I6** — `LocaleSwitcher` present in chrome, hides unlocalized items.
  Audit: manual.
  Untouched — the existing LocaleSwitcher placement is kept; the
  footer does not duplicate it (see S6 + Rejected alternatives).

### `templates-css-tokens` (`openspec/specs/templates-css-tokens/spec.md`)

- **I1** — No raw zinc / hex in component files.
  Audit: `node scripts/audit/tokens-only.mjs`.
  Applies to the new `Footer.astro`: every color flows through
  `--color-fg`, `--color-fg-muted`, `--color-border`, etc.
- **I2** — `global.css` defines `--color-*` tokens.
  Audit: `node scripts/audit/tokens-only.mjs --config`.
  Untouched — `global.css` is not modified.
- **I3** — Tri-state dark mode wired (`.light` class flips tokens).
  Audit: `node scripts/audit/tokens-only.mjs --darkmode`.
  Untouched — the footer inherits the same token-resolved colors
  the rest of the chrome uses; flipping `.light` recolours it
  automatically.
- **I4** — Above-the-fold uses scoped `<style>` (layered CSS).
  Audit: `node scripts/audit/tokens-only.mjs --layered`.
  Applies _negatively_: the footer is below-the-fold by definition,
  so it does NOT carry a scoped `<style>` block. The `--layered`
  heuristic targets `Hero.astro` and `Header.astro` overuse — it
  does not flag the footer. If the heuristic ever expands to flag
  below-the-fold Tailwind soup, the footer's tokenized utility
  classes are still valid (they all resolve through
  `--color-*` tokens).

### `templates-perf` (`openspec/specs/templates-perf/spec.md`)

- **I1** — Lighthouse budget met on home page.
  Audit: `node scripts/perf/run.mjs --page /`.
  Applies — the new footer renders on `/` and must not push the
  page past the budget. The component is Astro + vanilla (no JS, no
  fonts loaded), so the expected delta is a few hundred bytes of
  static HTML.
- **I2** — Lighthouse budget met on one inner page.
  Audit: `node scripts/perf/run.mjs --page /<inner>`.
  Applies — same as I1 against e.g. `/introduction`.
- **I3** — Total transfer ≤ 150KB compressed (home).
  Audit: `node scripts/perf/run.mjs --transfer`.
  Applies — the implementer confirms via the gate.
- **I4** — Critical CSS inlined (Beasties output present).
  Audit: `node scripts/perf/run.mjs --critical-css`.
  Applies — the footer's tokenized utilities must still be inlined
  by Beasties for the home / inner pages.
- **I5** — No undeclared runtime dep added since last archive.
  Audit: `node scripts/perf/run.mjs --deps`.
  Applies — the implementer MUST NOT add a new runtime dep in
  `packages/templates/docs/package.json` or `apps/docs/package.json`.

### Per-change audit

`pnpm audit:invariants --change docs-add-footer-chrome-parity-with-start`
dispatches the three capability audits above plus the per-change
manifest assembled by `scripts/audit/run-all.mjs`.

Audit commands (parseable by `scripts/audit/run-all.mjs --change`):

- audit: `node scripts/audit/i18n-parallels.mjs`
- audit: `node scripts/audit/internal-links-localized.mjs`
- audit: `node scripts/audit/tokens-only.mjs`
- audit: `node scripts/audit/tokens-only.mjs --layered`

## Performance budget applicability

The change capabilities match `/^(templates|registry)-/`, so per
`openspec/feature_list.json` `rules.require_perf_budget_to_close_when`
the perf-budget step **is required** to close. The reviewer runs:

- `node scripts/perf/run.mjs --page /` against the docs build — must
  stay ≥ 95 across the four Lighthouse mobile scores.
- `node scripts/perf/run.mjs --page /introduction` (or the equivalent
  representative inner-page slug shipped with the template seed
  content) — same thresholds.
- `node scripts/perf/run.mjs --transfer` — total transfer for `/` stays
  within the templates-perf transfer budget.

The implementer is expected to keep the footer JS-free (no `<script>`
inside `Footer.astro`; no new client-side handler) and to avoid adding
new font references (the footer reuses the system / Geist stack the
rest of the chrome uses).

## Rejected alternatives

### Render the footer only on the docs landing (`/`), not under DocsLayout

Rejected because the issue body explicitly asks for "every docs page
(including 404 and legal) inherits it" — and the natural place to wire
that is `BaseLayout.astro`. Wiring it into `DocsLayout` /
`LegalLayout` separately would duplicate the import three times and
require remembering to add it to every future layout.

### Move the Footer into a registry `block`

Rejected because the issue's "Out of scope" section explicitly keeps
it as a template component for now ("consistent with starter"). When
a docs-flavored block tier is added in a future change (see #2 /
`registry-block-pricing-card` for the first block), the Footer can be
considered alongside.

### Add an RSS link to the docs footer

Rejected because the docs template ships no `rss.xml.ts` and no blog
collection. The `footer.rss` i18n key stays in the bundles (it's
already there and a future blog-on-docs change can light it up
without re-translation), but the rendered footer doesn't reference
it.

### Add a second `<LocaleSwitcher />` instance inside the footer

Rejected because:

1. The starter footer does the same (no duplicate LocaleSwitcher) — we
   keep parity.
2. `DocsLayout` already renders a `LocaleSwitcher` next to the
   breadcrumbs at the top of every docs page; a second instance in
   the footer adds chrome without a clear user benefit.
3. The templates-i18n I6 invariant ("LocaleSwitcher present in
   chrome") is satisfied by the existing placement.

### Import `<Brand variant="mark" />` for the footer top row

Rejected because the starter footer also doesn't use `<Brand />` — it
renders the site name as a `<Text variant="body" weight="semibold">`
line. Keeping the same shape avoids an inconsistency between the two
footers and avoids the layout shift / scale concerns of inlining the
Geist Mono `>_` mark at footer scale.

### Add a new runtime dependency (e.g. icon library for social links)

Rejected because the templates-perf I5 invariant forbids it without
written justification, and the social column ships only a GitHub
link — rendered as plain text "GitHub". An inline SVG icon would be
nice-to-have but is out of scope (and the starter footer doesn't ship
one either).
