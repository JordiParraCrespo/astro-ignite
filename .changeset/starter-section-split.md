---
'astro-ignite': patch
'create-astro-ignite': patch
---

The starter template now ships with each visual section extracted into its own component under `src/components/sections/`. Pages are composition-only — the body of each page reduces to a layout wrapper plus `<Section />` imports — and default-locale pages share the same section components with their `[lang]/` parallels. No runtime behaviour or dependency change.
