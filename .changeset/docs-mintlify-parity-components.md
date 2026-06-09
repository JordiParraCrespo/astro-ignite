---
'astro-ignite': minor
'create-astro-ignite': minor
---

Docs template reaches Mintlify component parity (#95). Nine new MDX primitives, all Astro + vanilla JS and Tailwind-utility styled, implemented from the Claude Design handoff: `Expandable` (nested-property disclosure), `ParamField`/`ResponseField` (API parameter rows with type / required / default / deprecated badges and a body/query/path/header location pill), `Icon` (29-name lucide-style stroke set), `Tree` (box-drawing file trees), `Update` (changelog timeline with self-connecting rail), `Mermaid` (token-themed diagrams, lazy-loaded only when a diagram scrolls into view), `Columns` (generic grid wrapper), `Banner` (dismissible solid/subtle announcement strip), and `Tiles`/`Tile` (compact nav grid). The existing `Tabs`, `Accordion`, and `Tooltip` atoms are now registered for MDX authoring without imports, and `Callout` gains Mintlify's `info` and `check` variants. New `--color-info` / `--color-accent-purple` / `--color-accent-rose` tokens, plus deeper light-mode status hues for AA contrast on white.
