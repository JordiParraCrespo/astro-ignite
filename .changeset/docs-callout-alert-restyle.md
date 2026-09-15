---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Docs template visual refresh (components).**

- `Callout` and the registry `alert` atom share the shadcn alert layout: a two-column grid with a fixed icon column, a 14px title tinted to the variant's status color, a muted body with relaxed leading, and 16px×12px padding on a 10px radius. `Callout` drops its scoped `<style>` block for token-resolved utilities.
- The docs prose rules in `DocsLayout` now live in Tailwind's `components` layer, so atoms rendered inside MDX (`Card`, `Callout`, `Steps`, `Banner`) keep their own margins and type instead of inheriting the prose `h3`/`p` spacing. This fixes the empty band above card titles in `CardGroup` and `Columns`.
- `card` family follows shadcn v4 spacing: the card owns vertical padding and a `gap-5` column, header/content/footer own horizontal padding only; title is 16px semibold, description has relaxed leading.
- `Steps`/`Step` move from scoped CSS to utilities (counter, badge and rail via `before:`/`after:`), with a lighter number badge and medium-weight title.
- `accordion-item` trigger tightened to 15px with 14px vertical padding.
- Fenced code blocks use a light/dark Shiki theme pair (`github-light` / `github-dark`, `defaultColor: false`) switched by the theme class, so they share the token surface and border with `CodeBlock` in both themes instead of rendering dark in light mode. Every fenced block gets a hover-revealed copy button.
- `OnThisPage` is clerk-style: a continuous rail drawn as an SVG path measured from the rendered links, bending where the heading depth changes, with the active segment in the foreground color and a dot at its end. No-JS fallback keeps a plain 1px rail and the active text style. Labels are 13px with a titled header.
- `SidebarNav` is rebuilt on utilities and gains group icons (`icon` on groups and items), native `<details>` folding for `collapsed` groups, direct-path slugs, translated `groupKey`/`labelKey`, and optional top-level tabs (`tab` on a group) rendered as a segmented row once two or more tabs exist. Group headings drop the mono eyebrow for a 12px medium label. The template config no longer lists the apps/docs-only Components and Blocks groups.
- Landing pages: a `landing: true` frontmatter flag makes the layout skip its standard header and the on-this-page column and run the content full width (paragraphs stay capped at 64ch). A new `Hero` MDX component (title, eyebrow, lede slot, `actions` slot) owns the page's `<h1>`; `Button` is registered for MDX. The template's introduction is rewritten as a landing: hero, three tiles, a "what you get" card grid, a three-step quick start. Mirrored into `apps/docs`.
- `button` atom fix: the base class carried `border-transparent`, which Tailwind emitted after the variants' `border-border`, so `outline` and `secondary` never showed their border. Each variant now sets exactly one border color.
- `Hero` zeroes paragraph margins in its `actions` row, since MDX wraps multi-line children in `<p>` and the prose margin pushed button labels off-center.
- Accent + type scale: new `--color-accent` / `--color-accent-fg` tokens (indigo, tuned per theme) drive prose links, the active sidebar item and tab, the on-this-page marker and the hero eyebrow; buttons stay on `--color-primary`. Prose body moves to 16px/1.7, h2 to 24px, h3 to 19px, and lists get their disc/decimal markers back (Tailwind's preflight had removed them).

Mirrored into `packages/templates/{starter,docs}` and `apps/docs`.
