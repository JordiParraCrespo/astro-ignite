# Registry Boundary

`packages/registry/` is the parts bin. `base/*` ships atoms; `blocks/*`
ships compositions. The starter template gets atoms copied into
`src/components/ui/` at scaffold time; users own them after that.

> **Blocks tier is currently empty.** No `registry:block` items live in
> `registry.json` and the `blocks/` directory is intentionally absent
> until a real composition worth distributing lands. The conventions
> below describe the shape blocks will take when reintroduced.

## Public Contracts

- **Specs:**
- `openspec/specs/registry-atoms/spec.md`
- `openspec/specs/registry-blocks/spec.md`
- **Manifest:** `registry.json` — conforms to the [shadcn registry
  schema](https://ui.shadcn.com/docs/registry). Each item has `name`,
  `type`, `title`, `description`, `files[]` (each file carries a `type`),
  and `registryDependencies[]`. The graph resolves transitively;
  internal deps stay bare here (`"cn"`) and are namespaced at emit time.
- **Build emission:** `packages/registry/scripts/build-registry.mjs` resolves every item
  into a shadcn `registry-item` JSON (file source inlined as `content`,
  internal deps rewritten to `@astro-ignite/<name>`). `apps/site` runs it
  at `pre(dev|build)` (`--out public/r`) so the payloads are hosted at
  `https://astroignite.dev/r/<name>.json` and installable via
  `npx shadcn@latest add @astro-ignite/<name>`. See `README.md`.
  `build-registry.test.mjs` (run by `pnpm test`) asserts every manifest
  item has a corresponding schema-shaped payload.
- **Helpers:** `lib/cn.ts` (class merge), `lib/toast.ts` (window event
  bus consumed by `<Toaster />`), `lib/clipboard.ts` (copy-to-clipboard
  helper backing `copy-button`).

## Boundary Rules

- **No client-side framework** in `base/` or `blocks/`. No `import 'react'`,
  no Radix, no `@headlessui/*`. Astro + vanilla JS only.
- Interactive primitives use native HTML first:
- Accordion → `<details name="...">`
- Dialog → `<dialog>`
- Dropdown → popover API
- Tooltip → CSS-only `:hover` + `:focus-visible`
- Custom elements (`<ai-tabs>`, `<ai-toaster>`) only when native HTML
  won't do it. Register idempotently in the same file as the markup.
- **One concept per file**, **named exports only** (default exports are
  forbidden in atom source `.ts` files; `.astro` default exports are the
  component itself and are fine).
- **Compound families** live in `base/<family>/`: `card/`, `tabs/`,
  `accordion/`, `dialog/`, `dropdown-menu/`. No flat `card.astro`.
- Every atom in `registry.json` depends on `cn` (transitively).
- Blocks **compose atoms** from `base/*`; never redeclare card / button
  markup inline inside a block.

## Expanding The Boundary

- Adding a new atom → place under `base/<name>.astro` (or
  `base/<family>/<part>.astro` if compound). Add to `registry.json` with
  `registryDependencies: ["cn", ...]`. Audit: `pnpm audit:invariants`.
- Adding a new block → place under `blocks/<name>/`. Atom deps go in
  `registryDependencies`. Demo it on a page under
  `apps/site/src/pages/blocks/<name>.astro`; the demo page must pass
  `pnpm perf:budget`.
- Removing or renaming a public registry item → delta in
  `openspec/changes/<name>/specs/registry-*/spec.md` reflecting the
  contract change. Bump major-style on the registry manifest if external
  consumers exist.
