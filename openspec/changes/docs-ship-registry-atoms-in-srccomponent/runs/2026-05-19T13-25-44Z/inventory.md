# Inventory — docs-ship-registry-atoms-in-srccomponent (T1)

## (a) Registry ↔ Starter byte parity — singletons

Every `diff -q packages/registry/base/<atom>.astro
packages/templates/starter/src/components/ui/<atom>.astro` exited 0
(identical) for the 14 top-level singleton atoms:

| atom | result |
|---|---|
| alert.astro | identical |
| avatar.astro | identical |
| badge.astro | identical |
| button.astro | identical |
| input.astro | identical |
| kbd.astro | identical |
| label.astro | identical |
| link.astro | identical |
| separator.astro | identical |
| skeleton.astro | identical |
| textarea.astro | identical |
| text.astro | identical |
| toaster.astro | identical |
| tooltip.astro | identical |

## (a) Registry ↔ Starter byte parity — compound families

`diff -q packages/registry/base/<family>/<filename>
packages/templates/starter/src/components/ui/<filename>` exited 0
for every file:

- accordion: `accordion.astro`, `accordion-item.astro` — identical
- card: `card.astro`, `card-content.astro`, `card-description.astro`,
  `card-footer.astro`, `card-header.astro`, `card-title.astro` —
  identical
- dialog: `dialog.astro`, `dialog-description.astro`,
  `dialog-title.astro` — identical
- dropdown-menu: `dropdown-menu.astro`, `dropdown-menu-item.astro` —
  identical
- tabs: `tabs.astro`, `tabs-content.astro`, `tabs-list.astro`,
  `tabs-trigger.astro` — identical

Total starter atoms verified: 31 files (30 atoms + `text.astro`).

## (b) Registry ↔ Starter `lib/toast.ts`

`diff -q packages/registry/lib/toast.ts
packages/templates/starter/src/lib/toast.ts` exited 0 (identical).

## (c) Docs-template baseline (pre-change)

`packages/templates/docs/src/components/ui/` currently contains:

- `text.astro` (shipped by PR #40; not modified by this change)

Every other atom name listed in §(a) is **missing** from the docs
template — they will be created by T2–T7.

`packages/templates/docs/src/lib/` currently contains:

- `cn.ts` (shipped with `text.astro` in PR #40; not modified)
- `image/`, `jsonld/` (pre-existing helper trees; not modified)

`packages/templates/docs/src/lib/toast.ts` is **missing** — created
by T8.

## (d) apps/docs mirror parity

The full loop
```
for f in packages/templates/starter/src/components/ui/*.astro; do
  name=$(basename "$f")
  diff -q "$f" "apps/docs/src/components/ui/$name"
done
diff -q packages/registry/lib/toast.ts apps/docs/src/lib/toast.ts
```
exited 0 with **no "differ" lines**. `apps/docs/src/components/ui/`
already ships all 30 atoms + `text.astro` byte-equivalent to the
registry; `apps/docs/src/lib/toast.ts` is byte-equivalent to
`packages/registry/lib/toast.ts`.

**Conclusion: apps/docs parity confirmed; no apps/docs file will be
staged for commit at T9.**

## (e) CLI template cache baseline

`git ls-files packages/astro-ignite/templates/docs/src/components/ui/`
returns **zero entries** — the cache currently ships no `ui/` directory
under the docs template.

`git ls-files packages/astro-ignite/templates/docs/src/lib/` returns
only the `image/` and `jsonld/` trees:

```
packages/astro-ignite/templates/docs/src/lib/image/blur.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/blogPosting.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/breadcrumbList.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/creativeWork.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/index.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/organization.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/person.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/types.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/webPage.ts
packages/astro-ignite/templates/docs/src/lib/jsonld/website.ts
```

i.e. `cn.ts` and `toast.ts` are **both missing** from the cache today.
The proposal predicted this; `cn.ts` is unrelated drift that the T10
regeneration will pick up alongside the new atoms.

Scenarios covered: **S1**, **S2**, **S3**, **S5**, **S8**.
