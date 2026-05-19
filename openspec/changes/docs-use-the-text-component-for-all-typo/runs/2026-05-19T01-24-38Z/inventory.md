# T1 Inventory — docs-use-the-text-component-for-all-typo

Run: `openspec/changes/docs-use-the-text-component-for-all-typo/runs/2026-05-19T01-24-38Z/`

Enumeration of every `<h1>`–`<h6>` and `<p>` element under
`packages/templates/docs/src/{pages,components,layouts}/**/*.astro` and
`apps/docs/src/{pages,components,layouts}/**/*.astro`, classified
against the four buckets in T1:

- **(a)** body copy or heading inside an in-scope file → refactor to
  `<Text>`
- **(b)** chrome / atom / scoped-style-encapsulated and excepted
- **(c)** MDX-rendered through `<slot />` and out of scope
- **(d)** live-preview demo block on a docs page that demonstrates the
  atom contract — out of scope

## A — Docs template (`packages/templates/docs/`)

### Layouts

| File                                       | Element                                  | Class                  | Bucket | Target variant                                                    |
| ------------------------------------------ | ---------------------------------------- | ---------------------- | ------ | ----------------------------------------------------------------- |
| `src/layouts/DocsLayout.astro:90`          | `<h1>{title}</h1>`                       | (none, scoped `h1`)    | (a)    | `<Text variant="h1">`                                             |
| `src/layouts/DocsLayout.astro:91`          | `<p class="docs-lede">{description}</p>` | `docs-lede`            | (a)    | `<Text variant="lead" class="docs-lede">`                         |
| `src/layouts/DocsLayout.astro:102` (slot)  | MDX prose                                | `docs-prose`           | (c)    | unchanged (`.docs-prose` `<style is:global>` stays)               |
| `src/layouts/LegalLayout.astro:61`         | `<h1>{title}</h1>`                       | (scoped `h1`)          | (a)    | `<Text variant="h1">`                                             |
| `src/layouts/LegalLayout.astro:62-71`      | `<p class="legal-meta">…</p>`            | `legal-meta`           | (a)    | `<Text variant="muted" class="legal-meta">`                       |
| `src/layouts/LegalLayout.astro:74` (slot)  | MDX prose                                | `prose legal-prose`    | (c)    | unchanged                                                         |
| `src/layouts/BaseLayout.astro`             | _none_ (audited)                         | —                      | —      | no `<h*>` / `<p>` in this file                                    |

### Components — docs

| File                                                       | Element                                                          | Class                                | Bucket | Target                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------ | ------ | ----------------------------------------------------------------- |
| `src/components/docs/ComponentShowcase.astro:24`           | `<h1 class="showcase__title">{name}</h1>`                        | `showcase__title`                    | (a)    | `<Text variant="h1" class="showcase__title">`                     |
| `src/components/docs/ComponentShowcase.astro:25`           | `<p class="showcase__desc">{description}</p>`                    | `showcase__desc`                     | (a)    | `<Text variant="lead" class="showcase__desc">`                    |
| `src/components/docs/SidebarNav.astro:79`                  | `<h2 class="sidebar-group-title mono">{group.group}</h2>`        | `sidebar-group-title mono`           | (a)    | `<Text variant="eyebrow" as="h2" class="sidebar-group-title mono">` (keep `mono` for `font-family` since `eyebrow` does not set it) |
| `src/components/docs/Breadcrumbs.astro`                    | _none_ (audited)                                                 | —                                    | —      | no `<h*>` / `<p>`                                                 |
| `src/components/docs/Callout.astro`                        | _none_                                                           | —                                    | —      | no `<h*>` / `<p>`                                                 |
| `src/components/docs/CodeBlock.astro`                      | _none_                                                           | —                                    | —      | no `<h*>` / `<p>`                                                 |
| `src/components/docs/OnThisPage.astro`                     | _none_                                                           | —                                    | —      | no `<h*>` / `<p>`                                                 |
| `src/components/docs/PrevNext.astro`                       | _none_                                                           | —                                    | —      | no `<h*>` / `<p>`                                                 |
| `src/components/docs/SearchBox.astro`                      | _none_                                                           | —                                    | —      | no `<h*>` / `<p>`                                                 |

### Components — common, image, seo (allow-listed chrome / atoms)

| File                                          | Bucket | Note                                                |
| --------------------------------------------- | ------ | --------------------------------------------------- |
| `src/components/common/Analytics.astro`       | (b)    | no body typography                                  |
| `src/components/common/Brand.astro`           | (b)    | mark/logo chrome                                    |
| `src/components/common/LocaleSwitcher.astro`  | (b)    | nav chrome                                          |
| `src/components/common/ThemeToggle.astro`     | (b)    | chrome control                                      |
| `src/components/image/Image.astro`            | (b)    | atom                                                |
| `src/components/image/HeroImage.astro`        | (b)    | atom (no `<h*>` / `<p>`)                            |
| `src/components/seo/SEO.astro`                | (b)    | metadata only                                       |
| `src/components/seo/JsonLd.astro`             | (b)    | metadata only                                       |

### Components — legal

| File                                                       | Element                                                              | Class                              | Bucket | Target                                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `src/components/legal/CookieBanner.astro:30`               | `<h2 id="cookie-banner-title">{t('cookies.banner.title')}</h2>`      | (scoped `h2`)                      | (a)    | `<Text variant="h4" as="h2" id="cookie-banner-title">` (matches the 1rem / 600-weight set by the atom h4) |
| `src/components/legal/CookieBanner.astro:31`               | `<p id="cookie-banner-description">{t('cookies.banner.description')}</p>` | (scoped `p`)                  | (a)    | `<Text variant="muted" id="cookie-banner-description">`                                                   |

### Pages

```
grep -REn '<(h[1-6]|p)\b' packages/templates/docs/src/pages/
→ no matches
```

| File                                                  | Bucket | Note                                                                       |
| ----------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| `src/pages/index.astro`                               | (b)    | delegate to `BaseLayout`; no inline `<h*>` / `<p>`                         |
| `src/pages/[...slug].astro`                           | (b)    | delegate to `DocsLayout`                                                   |
| `src/pages/legal/[...slug].astro`                     | (b)    | delegate to `LegalLayout`                                                  |
| `src/pages/[lang]/index.astro`                        | (b)    | parallel of `index.astro`                                                  |
| `src/pages/[lang]/[...slug].astro`                    | (b)    | parallel of `[...slug].astro`                                              |
| `src/pages/[lang]/legal/[...slug].astro`              | (b)    | parallel of `legal/[...slug].astro`                                        |

**Conclusion T8:** No page-level changes required in the template.

## B — Apps mirror (`apps/docs/`)

### Layouts (mirror of template)

| File                                       | Bucket | Action                                                              |
| ------------------------------------------ | ------ | ------------------------------------------------------------------- |
| `apps/docs/src/layouts/DocsLayout.astro`   | (a)    | mirror docs template DocsLayout substitution                        |
| `apps/docs/src/layouts/LegalLayout.astro`  | (a)    | mirror docs template LegalLayout substitution                       |
| `apps/docs/src/layouts/BaseLayout.astro`   | —      | no `<h*>` / `<p>`                                                   |
| `apps/docs/src/layouts/ComponentsLayout.astro` | —  | no `<h*>` / `<p>` (audited)                                         |

### Components — docs / legal (mirror)

| File                                                      | Bucket | Action                                                                                        |
| --------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| `apps/docs/src/components/docs/ComponentShowcase.astro`   | (a)    | mirror template substitution. The apps copy adds `file`/`anno` chips in `.showcase__meta` (`<span>` elements, not `<p>`); these stay raw. |
| `apps/docs/src/components/docs/SidebarNav.astro`          | (a)    | mirror, with two surfaces: `<h2 class="sidebar-group-title mono">{groupLabel}</h2>` AND the collapsible `<summary class="sidebar-group-title mono">…</summary>`. Both get the eyebrow treatment via `<Text variant="eyebrow" as="h2"…>` and `<Text variant="eyebrow" as="summary"…>`. |
| `apps/docs/src/components/legal/CookieBanner.astro`       | (a)    | mirror template substitution                                                                  |

### Components — blocks (apps-only surface)

| File                                                      | Element                                                                | Bucket | Target                                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| `apps/docs/src/components/blocks/not-found-state.astro:17`| `<span class="mono text-xs … text-fg-subtle">{code}</span>`            | (a)    | `<Text variant="eyebrow" class="mono">{code}</Text>` (per design.md T14 — the optional eyebrow `<span>` becomes a Text) |
| `apps/docs/src/components/blocks/not-found-state.astro:18-20` | `<h1 class="m-0 text-[clamp(40px,6vw,56px)] font-medium tracking-[-0.045em] leading-none text-fg">{title}</h1>` | (a) | `<Text variant="h1">{title}</Text>`                                                       |
| `apps/docs/src/components/blocks/not-found-state.astro:23`| `<p class="m-0 text-[15px] text-fg-muted leading-relaxed max-w-[36ch]">{description}</p>` | (a)    | `<Text variant="muted" class="max-w-[36ch]">{description}</Text>`                          |

### Components — common, image, seo, ui (allow-listed)

Identical to the template list above. Plus the `ui/*` family (32
existing atoms — atom sources, not consumers).

### Pages — apps-only marketing surfaces

#### `apps/docs/src/pages/components/index.astro`

Page-frame typography → `<Text>`. Live-preview demo blocks
(`<article class="comp">…<div class="preview">…</div></article>` and the
chrome static previews) stay raw per § "Sweep rule for apps/docs
marketing pages".

| Line  | Element                                          | Bucket | Target                                          |
| ----- | ------------------------------------------------ | ------ | ----------------------------------------------- |
| 41    | `<p class="cat__eyebrow mono">…</p>`             | (a)    | `<Text variant="eyebrow" class="cat__eyebrow mono">` |
| 42    | `<h1 class="cat__title">Components</h1>`         | (a)    | `<Text variant="h1" class="cat__title">`        |
| 43-46 | `<p class="cat__lede">…</p>`                     | (a)    | `<Text variant="lead" class="cat__lede">`       |
| 65    | `<h2>Brand</h2>` (group head)                    | (a)    | `<Text variant="h2">`                           |
| 66-68 | `<p class="grp__lede">…</p>`                     | (a)    | `<Text variant="lead" class="grp__lede">`       |
| 75    | `<h3>Brand</h3>` (component head, inside `.comp__head`) | (a)    | `<Text variant="h3">`                           |
| 109   | `<h2>Registry primitives</h2>`                   | (a)    | `<Text variant="h2">`                           |
| 110-113 | `<p class="grp__lede">…</p>`                   | (a)    | `<Text variant="lead" class="grp__lede">`       |
| 120, 143, 159, 184, 199, 223, 236, 248, 260, 279, 295, 314, 334, 352, 370, 387, 410, 428, 445 | per-component `<h3>{name}</h3>` inside `.comp__head` | (a) | `<Text variant="h3">` |
| 176   | `<p style="margin: 0;"><Text variant="code">…</Text></p>` inside text-atom live preview | (d) | stay raw — live preview demo |
| 391   | `<p class="small-muted" style="margin:0 0 8px;">` inside dialog live preview | (d) | stay raw — live preview demo |
| 462   | `<h2>Blocks</h2>` (group head)                   | (a)    | `<Text variant="h2">`                           |
| 463-465 | `<p class="grp__lede">…</p>`                   | (a)    | `<Text variant="lead" class="grp__lede">`       |
| 470-472 | `<p class="more-link mono">`                   | (a)    | `<Text variant="small" class="more-link mono">` (small body, not an eyebrow; preserves existing 12px/14px feel) |
| 479   | `<h2>Chrome</h2>`                                | (a)    | `<Text variant="h2">`                           |
| 480-484 | `<p class="grp__lede">…</p>`                   | (a)    | `<Text variant="lead" class="grp__lede">`       |
| 490, 512, 539, 562, 577, 597, 624 | chrome static-preview `<h3>{name}</h3>` inside `.comp__head` | (a) | `<Text variant="h3">` |

#### `apps/docs/src/pages/blocks/index.astro`

| Line  | Element                                       | Bucket | Target                                          |
| ----- | --------------------------------------------- | ------ | ----------------------------------------------- |
| 13    | `<p class="page__eyebrow">…</p>`              | (a)    | `<Text variant="eyebrow" class="page__eyebrow">` |
| 14    | `<h1 class="page__title">…</h1>`              | (a)    | `<Text variant="h1" class="page__title">`       |
| 15-19 | `<p class="page__desc">…</p>`                 | (a)    | `<Text variant="lead" class="page__desc">`      |
| 27    | `<h2 class="card__title">{name}</h2>`         | (a)    | `<Text variant="h3" as="h2" class="card__title">` (the card title is 14px mono per the scoped block — `h3` is the smallest sans variant, but the design's intent is keeping the lowercase mono look via the class; the atom contributes a margin reset only) |
| 28    | `<p class="card__desc">…</p>`                 | (a)    | `<Text variant="small" class="card__desc">`     |

#### `apps/docs/src/pages/blocks/not-found-state.astro`

Delegate-only — uses `<ComponentShowcase>` + `<NotFoundState>` (both
covered above). No direct `<h*>` / `<p>`.

#### `apps/docs/src/pages/design.astro`

Mixed page-frame chrome + demo content. Apply `<Text>` only to the
canvas-level header and section heads (the top-level `<h2>` / `<p
class="section-sub">` rendered directly under `<section
class="canvas-section">`). Everything inside `<div class="card …">`
(brand cards, color cards, type cards, ui cards, hero tile, features
tile, docs tile, terminal) is **demo content** and stays raw.

| Line  | Element                                            | Bucket | Target                                          |
| ----- | -------------------------------------------------- | ------ | ----------------------------------------------- |
| 183   | `<div class="canvas-meta mono">…</div>` (eyebrow)  | (b)    | NOT a `<h*>` / `<p>` — div; skip (out of scope by element) |
| 184   | `<h1>astro-ignite — design system</h1>`            | (a)    | `<Text variant="h1">`                           |
| 185-189 | `<p class="canvas-lede">…</p>`                   | (a)    | `<Text variant="lead" class="canvas-lede">`     |
| 200   | `<h2>Brand</h2>` (canvas section head)             | (a)    | `<Text variant="h2">`                           |
| 201   | `<p class="section-sub">…</p>` (canvas section head) | (a)  | `<Text variant="muted" class="section-sub">`    |
| 265   | `<h2>Color</h2>`                                   | (a)    | `<Text variant="h2">`                           |
| 266   | `<p class="section-sub">…</p>`                     | (a)    | `<Text variant="muted" class="section-sub">`    |
| 333   | `<h2>Typography</h2>`                              | (a)    | `<Text variant="h2">`                           |
| 334-336 | `<p class="section-sub">…</p>`                   | (a)    | `<Text variant="muted" class="section-sub">`    |
| 425   | `<h2>Components</h2>`                              | (a)    | `<Text variant="h2">`                           |
| 426   | `<p class="section-sub">…</p>`                     | (a)    | `<Text variant="muted" class="section-sub">`    |
| 611   | `<h2>Marketing</h2>`                               | (a)    | `<Text variant="h2">`                           |
| 612   | `<p class="section-sub">…</p>`                     | (a)    | `<Text variant="muted" class="section-sub">`    |
| 631-634 | `<h3 class="hero-headline">…</h3>` inside `<div class="card hero-tile">` | (d) | stay raw — marketing demo content |
| 635-638 | `<p class="hero-lede">…</p>` inside hero tile    | (d)    | stay raw — marketing demo                       |
| 652   | `<h3 class="features-title">…</h3>` inside features tile | (d) | stay raw — marketing demo                       |
| 654-657 | `<p class="mono features-aside">…</p>` inside features tile | (d) | stay raw — marketing demo                |
| 681   | `<h2>Docs</h2>`                                    | (a)    | `<Text variant="h2">`                           |
| 682-686 | `<p class="section-sub">…</p>`                   | (a)    | `<Text variant="muted" class="section-sub">`    |

The `.section-head-row` inside cards (e.g., line 270, 297, 341, etc.)
uses `<div class="section-title">…</div>` not `<h*>`; those divs are
not in the `<h*>` / `<p>` enumeration and stay untouched.

#### Per-component showcase pages — `apps/docs/src/pages/components/*.astro`

20 pages. Each delegates to `<ComponentShowcase>` plus a small set of
live-preview elements. Per the design's "Sweep rule for apps/docs
marketing pages", elements inside live previews stay raw. Non-demo body
copy (captions / "use it like this:" paragraphs) wraps in `<Text>`.

| File                                            | Element                                  | Bucket | Action                                                                                                          |
| ----------------------------------------------- | ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| `pages/components/accordion.astro:23,26,29`     | `<p>{…}</p>` inside `<AccordionItem>` body | (d)  | stay raw — accordion body, demonstrates atom slot content                                                       |
| `pages/components/card.astro:33`                | `<p>{…}</p>` inside `<CardContent>`      | (d)    | stay raw — card body, demonstrates atom slot content                                                            |
| `pages/components/kbd.astro:17,23`              | `<p class="line">…<Kbd /> …</p>`         | (a)    | wrap in `<Text variant="muted" class="line">…<Kbd /> …</Text>` (per design.md "non-demo body copy ... wrap in `<Text>`") |
| `pages/components/tabs.astro:30,33,36`          | `<p>{…}</p>` inside `<TabsContent>`      | (d)    | stay raw — tabs body, demonstrates atom slot content                                                            |
| `pages/components/text.astro` (rest)            | every `<Text>` already                   | (b)    | already on the atom; no change                                                                                  |
| `pages/components/{button,link,badge,input,textarea,label,separator,alert,avatar,skeleton,tabs,dialog,dropdown-menu,tooltip,toast,kbd,accordion}.astro` | _other than the rows above_ | (b)/(d) | delegate-only or demo content                                                                                   |

#### `[lang]/` parallels

Each non-`[lang]/` page above has a `[lang]/` parallel (`apps/docs/src/pages/[lang]/**`).
The parallels mirror the default-locale page line-for-line aside from
`getStaticPaths` and the locale lookup. Same substitutions apply.

Mirror entries:

- `apps/docs/src/pages/[lang]/components/index.astro` ↔ `apps/docs/src/pages/components/index.astro`
- `apps/docs/src/pages/[lang]/blocks/index.astro` ↔ `apps/docs/src/pages/blocks/index.astro`
- `apps/docs/src/pages/[lang]/blocks/not-found-state.astro` ↔ `apps/docs/src/pages/blocks/not-found-state.astro` (delegate-only, no change)
- `apps/docs/src/pages/[lang]/components/{button,…}.astro` ↔ default-locale equivalents
- `apps/docs/src/pages/[lang]/components/kbd.astro` ↔ `apps/docs/src/pages/components/kbd.astro`
- (`design.astro` has **no** `[lang]/` parallel — confirmed via `ls`)

#### Root pages (delegate-only)

| File                                                      | Bucket | Note                                              |
| --------------------------------------------------------- | ------ | ------------------------------------------------- |
| `apps/docs/src/pages/index.astro`                         | (b)    | delegate to layout, no inline `<h*>` / `<p>`      |
| `apps/docs/src/pages/[...slug].astro`                     | (b)    | delegate                                          |
| `apps/docs/src/pages/legal/[...slug].astro`               | (b)    | delegate                                          |
| `apps/docs/src/pages/[lang]/index.astro`                  | (b)    | delegate                                          |
| `apps/docs/src/pages/[lang]/[...slug].astro`              | (b)    | delegate                                          |
| `apps/docs/src/pages/[lang]/legal/[...slug].astro`        | (b)    | delegate                                          |

## C — Allow-list (out of scope per § Scope)

- All `src/components/ui/*` atom sources (template + apps copies). The
  apps copy contains 32 atoms; the docs template's `ui/` folder is new
  this change and will contain only `text.astro` after T2.
- Above-the-fold chrome with scoped `<style>`: `SidebarNav.astro` (the
  outer chrome — only the `.sidebar-group-title` surface refactors).
- All `src/components/seo/*` and `src/components/image/*`.
- All `src/components/common/{Brand,LocaleSwitcher,ThemeToggle,Analytics}.astro`.
- MDX `<slot />` rendering through `<style is:global>.docs-prose` /
  `.legal-prose` blocks.
- Live-preview demo elements inside `<article class="comp">` /
  `<div class="preview">` blocks (per § "Sweep rule").

## Atom extension (T2c)

**No extension required.** Every target surface above maps to an
existing variant in
`packages/registry/base/text.astro` (`display | h1 | h2 | h3 | h4 |
lead | body | small | muted | eyebrow | code`). T2c is a no-op for this
run.

## Design-touched-but-missing infrastructure

The atom file `packages/templates/docs/src/components/ui/text.astro`
imports `cn` from `@/lib/cn`, which is the same alias the starter
mirror uses. The starter ships
`packages/templates/starter/src/lib/cn.ts`; the docs template does
not. Without that file the atom won't resolve.

**Resolution:** add `packages/templates/docs/src/lib/cn.ts` (byte-equal
to `packages/templates/starter/src/lib/cn.ts` and the registry's
`packages/registry/lib/cn.ts`). The `design.md` § Files touched is
amended in the same first commit to add this NEW entry. Without this
amendment the committer would reject the atom commit; with it the
intent of design.md is honored (the spec author's note that
"`@/lib/cn` resolves to the template's local `src/lib/cn.ts`" assumed
the file already existed).

## Coverage map

| Scenario | Files referenced in inventory                                                              |
| -------- | ------------------------------------------------------------------------------------------ |
| S2       | template pages — all delegate-only (no changes). Apps pages: `components/index.astro`, `blocks/index.astro`, `design.astro`, `components/kbd.astro`, plus `[lang]/` parallels. |
| S3       | template: `ComponentShowcase`, `SidebarNav`, `CookieBanner`. Apps: same three + `blocks/not-found-state.astro`. |
| S4       | template: `DocsLayout`, `LegalLayout`. Apps: same two.                                     |
| S12      | apps mirror enumerated above; every template surface has a matching apps surface.          |
| S13      | every changed file lies under `packages/templates/docs/`, `apps/docs/`, or
            `openspec/changes/docs-use-the-text-component-for-all-typo/` (harness paperwork).
            S5 fires only if T2c is needed — it is not.                                                  |
