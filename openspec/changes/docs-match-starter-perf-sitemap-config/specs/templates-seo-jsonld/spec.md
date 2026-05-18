# Delta: templates-seo-jsonld — docs-match-starter-perf-sitemap-config

The long-lived `templates-seo-jsonld` capability today covers the
JSON-LD `@graph` emission contract only (one `<script
type="application/ld+json">` per page, typed via `schema-dts`,
cross-references via `@id`). This change broadens the capability's
scope to also cover **sitemap priority defaults** — the second
machine-readable SEO signal shipped by every template — so the
capability owns the SEO surface as a whole rather than just one
half of it.

The boundary statement in the long-lived spec
(`openspec/specs/templates-seo-jsonld/spec.md` — "Owned by:
`packages/templates/<kind>/src/layouts/`, every `.astro` page that
contributes a node, `src/lib/seo/graph.ts` (the assembler)") is
preserved verbatim. The delta below documents the additional
ownership of `astro.config.mjs`'s `sitemap()` integration config for
the same set of templates. Future spec readers can find the broader
scope here without having to grep change history.

I1, I2, and I3 stand at their existing thresholds — JSON-LD emission
is unchanged. The new requirements below cover sitemap priority
defaults.

## ADDED Requirements

### Requirement: Every shipped template configures sitemap `serialize` with priority signals

Every template under `packages/templates/<kind>/` whose
`astro.config.mjs` registers the `@astrojs/sitemap` integration
SHALL pass a `serialize(item)` callback and a default `priority`
value to that integration. The callback SHALL lift the landing-page
URL (`new URL(item.url).pathname === '/'`) to `item.priority = 1.0`
and demote any URL containing `/legal/` to `item.priority = 0.3`.
The default `priority` SHALL be `0.7` (above the sitemap-protocol
default of `0.5`, below the landing-page lift). The default
`changefreq` SHALL be `'weekly'` (preserved from the existing
config).

The rationale: landing pages are the canonical entry point and
deserve the maximum priority; legal templates (privacy, terms,
cookies) are noindex-eligible boilerplate and should not outrank
real content; everything in between is real content worth a slightly-
above-default priority.

#### Scenario: Docs template after this change

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/docs/astro.config.mjs` is read
- **THEN** the `sitemap({ … })` call passed to `integrations`
  contains all of:
  - `priority: 0.7`,
  - `changefreq: 'weekly'`,
  - a `serialize(item)` function that maps `pathname === '/'` →
    `1.0`, `item.url.includes('/legal/')` → `0.3`, and returns the
    item.

#### Scenario: Starter template (reference)

- **GIVEN** the existing starter `astro.config.mjs`
- **WHEN** the `sitemap({ … })` call is read
- **THEN** the same three properties are present (the starter is
  the source of the pattern; the requirement formalises what
  starter already ships).

#### Scenario: `apps/docs/` mirror

- **GIVEN** the post-change tree
- **WHEN** `apps/docs/astro.config.mjs` is read
- **THEN** the same `priority`, `changefreq`, and `serialize` shape
  is present, byte-equivalent to the template.

#### Scenario: A new template ships without the serialize callback

- **GIVEN** a contributor adds a new template at
  `packages/templates/<kind>/` whose `astro.config.mjs` registers
  `sitemap()` without a `serialize` callback or without the default
  `priority: 0.7`
- **WHEN** `pnpm audit:invariants --change <name>` runs (with
  `templates-seo-jsonld` in the change's capabilities)
- **THEN** the audit fails until the callback and default priority
  are added.

### Requirement: Generated sitemap XML reflects the priority signals

For any template that satisfies the requirement above, the emitted
`dist/sitemap-0.xml` (or `sitemap-index.xml` + per-language files
if the integration splits them) SHALL contain `<priority>1.0</priority>`
on the landing-page `<url>` entry, `<priority>0.3</priority>` on every
`<url>` entry whose `<loc>` contains `/legal/`, and `<priority>0.7</priority>`
on at least one non-landing, non-legal page.

#### Scenario: Inspecting the docs build sitemap

- **GIVEN** `pnpm --filter @astro-ignite/template-docs build` has run
- **WHEN** `dist/sitemap-0.xml` is parsed
- **THEN** the XML contains:
  - exactly one `<url>` entry with `<loc>` equal to `<siteUrl>/`
    and `<priority>1.0</priority>`,
  - one or more `<url>` entries whose `<loc>` contains `/legal/`,
    every such entry carrying `<priority>0.3</priority>`,
  - at least one `<url>` entry for a guide page (e.g. `/quick-start`
    or `/introduction`) with `<priority>0.7</priority>`.

#### Scenario: Inspecting the apps/docs build sitemap

- **GIVEN** `pnpm --filter @astro-ignite/docs build` has run
- **WHEN** `dist/sitemap-0.xml` is parsed
- **THEN** the same assertions hold as for the template build.

## MODIFIED Requirements

_None._ The three existing requirements (one `@graph`, `schema-dts`
typing, `@id` cross-references) keep their current shape.

## REMOVED Requirements

_None._

## Notes

- **Capability broadening.** The capability is now `templates-seo-jsonld`
  in name (preserved for stability of the change-dispatch mapping)
  but covers machine-readable SEO signals more broadly: JSON-LD
  `@graph` plus sitemap priority defaults. A future rename of the
  capability folder (e.g. `templates-seo`) is a separate concern.
- **Audit hook.** The sitemap-priority assertion is cheap to verify
  with a small grep in `scripts/audit/` (one regex over each
  `astro.config.mjs` checking for the `serialize` literal pattern
  plus a default `priority` literal) and a separate XML check after
  the template build (XPath / regex over `dist/sitemap-*.xml`). The
  implementer either adds the assertion as a new small script under
  `scripts/audit/sitemap-priority.mjs` registered in
  `scripts/audit/run-all.mjs` for changes whose capabilities include
  `templates-seo-jsonld`, or runs the assertions inline in this
  change's `runs/<ts>/audit.md`. Either is acceptable provided
  `pnpm audit:invariants --change …` exercises them in CI.
- **No `changefreq` map.** Per scope, `changefreq` stays at
  `'weekly'` site-wide; a per-content-type heuristic is out of
  scope and tracked separately if needed.
