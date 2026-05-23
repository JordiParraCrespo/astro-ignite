---
'astro-ignite': minor
'create-astro-ignite': minor
---

Organize the scaffolded `src/components/ui/` tree to mirror the registry's
`base/<family>/` source layout: compound families now ship in their own
folder instead of flat. Singletons (button, input, badge, …) stay flat.

- `ui/card.astro` → `ui/card/card.astro` (+ `card-header`, `card-title`,
  `card-description`, `card-content`, `card-footer`)
- `ui/tabs.astro` → `ui/tabs/tabs.astro` (+ `tabs-list`, `tabs-trigger`,
  `tabs-content`)
- `ui/accordion.astro` → `ui/accordion/accordion.astro` (+ `accordion-item`)
- `ui/dialog.astro` → `ui/dialog/dialog.astro` (+ `dialog-title`,
  `dialog-description`)
- `ui/dropdown-menu.astro` → `ui/dropdown-menu/dropdown-menu.astro`
  (+ `dropdown-menu-item`)

Applied to the `starter` and `docs` templates and mirrored to `apps/docs`.
`packages/registry/registry.json`'s `files[].target` paths are updated to
match, so `registry add <family>` now installs the family into its folder —
a true copy-paste of the registry source structure. The `base/<family>/`
registry source and every component's `@/lib/cn` import are unchanged.

Breaking for projects scaffolded from an earlier version that import these
family parts: update the import paths to the nested form.
