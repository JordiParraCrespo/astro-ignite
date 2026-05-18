# Delta: templates-i18n — reorganize-starter-split-pages-into-per

This change refactors `packages/templates/starter/` pages to be
composition-only by extracting their visual sections into dedicated
section components. It is structural, not routing. The capability's
existing Requirements (parallel routes, `getStaticPaths` parity, content
collection layout, `getRelativeLocaleUrl`, `LocaleSwitcher` in chrome)
are preserved.

The change does layer one new requirement on top: when both
`src/pages/<foo>.astro` and `src/pages/[lang]/<foo>.astro` exist, they
must compose the _same_ section components — i.e., parallel routes stay
truly parallel even at the markup-import level, not just at the route
level. Today they happen to be identical below the frontmatter; after
this change the equality is enforced by sharing the same `.astro`
imports.

## ADDED Requirements

### Requirement: Default-locale and `[lang]/` parallels import the same section components

For every page that exists at `src/pages/<route>.astro` _and_ at
`src/pages/[lang]/<route>.astro`, the set of components imported from
`src/components/sections/**` in each file SHALL be identical. Neither
file may inline a section subtree that the other delegates to a section
component.

This requirement is scoped to the **starter template's compositional
sections**; it does not constrain pages that legitimately differ (e.g.
the default-locale-only `404.astro` and `rss.xml.ts`, which have no
`[lang]/` parallel).

#### Scenario: Editing the landing features section

- **GIVEN** a contributor changes the landing page's features grid
- **WHEN** they modify only `src/pages/index.astro`
- **THEN** an audit comparing the section-import set against
  `src/pages/[lang]/index.astro` flags the asymmetry, because the two
  files must import the same `<FeaturesGrid />`. Editing the section
  component itself once is the correct shape.

#### Scenario: Auditing a fresh starter clone

- **GIVEN** `siteConfig.locales = ['en']` (the default)
- **WHEN** the audit runs against `packages/templates/starter/`
- **THEN** the audit passes: every default-locale page and its
  `[lang]/` parallel share an identical section-import set, even though
  `[lang]/` routes are dormant.

## MODIFIED Requirements

_None._ Existing requirements (I1–I6) are not redefined; this change
sits next to them as an additional structural assertion.

## REMOVED Requirements

_None._

## Notes

- **Audit hook.** The compositional invariant is statically checkable
  by parsing both `.astro` files and extracting their `import` lines
  whose module path matches `@/components/sections/**`. If the
  implementer adds a script (suggestion:
  `scripts/audit/sections-parity.mjs`), it lives under `scripts/audit/`
  and is invoked from `pnpm audit:invariants`. The change does not
  require adding a new audit script; the equivalence is also caught by
  reviewer eyeballs against `tasks.md` T18 and by the
  `i18n-parallels.mjs --strict` audit failing if `getStaticPaths` shapes
  diverge.
- **Relationship to existing I2.** I2 already requires the `[lang]/`
  parallel to _exist_ with a parity-shaped `getStaticPaths`. The ADDED
  requirement above tightens "exists" to "imports the same sections" —
  it does not relax or replace I2.
- **`getRelativeLocaleUrl` invariance (I5).** All
  `getRelativeLocaleUrl` calls stay in page frontmatter (where
  `getCollection` results are mapped to URLs); section components
  receive pre-built `href` strings via props. No section component
  introduces a hardcoded `/about`-style link.
