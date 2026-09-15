---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Callout + alert restyle.** The docs template's `Callout` and the registry `alert` atom now share the shadcn alert layout: a two-column grid with a fixed icon column, a 14px title tinted to the variant's status color, a muted body with relaxed leading, and 16px×12px padding on a 10px radius. Callout drops its scoped `<style>` block for token-resolved Tailwind utilities. Mirrored into `packages/templates/{starter,docs}` and `apps/docs`.
