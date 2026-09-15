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

Mirrored into `packages/templates/{starter,docs}` and `apps/docs`.
