# Components

Every atom under `src/components/ui/` ships **pre-installed** — copied from the astro-ignite registry at scaffold time, owned by this repo. There's no install step and no runtime dependency; import them like any local file and edit them freely.

```astro
---
import Button from '@/components/ui/button.astro';
---

<Button variant="outline" size="sm" href="/getting-started">Get started</Button>
```

## Props & variants

Atoms are typed Astro components (`export type Props = …`). They follow a consistent shape:

- **Variant + size props** where it makes sense.
- **Polymorphic `as`-by-`href`** on `Button` and `Link` — pass `href` and it renders an `<a>`; omit it and `Button` renders a `<button>`. The correct native attributes are typed for each case.
- **A `class` passthrough** — anything you pass is merged onto the base classes via `cn` (see below), so you can extend without forking.
- **`...rest` spread** — remaining attributes (`type`, `aria-*`, `data-*`, …) land on the underlying element.

The full prop surface, by atom:

| Atom        | Props                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `button`    | `variant` (`default` · `secondary` · `outline` · `ghost` · `destructive` · `link`), `size` (`sm` · `md` · `lg` · `icon`), `href?`, `class?`                                                                  |
| `link`      | `variant` (`default` · `muted` · `underline`), `class?`                                                                                                                                                      |
| `text`      | `variant` (`display` · `h1`-`h4` · `lead` · `body` · `small` · `muted` · `eyebrow` · `code`), `as?`, `tone` (`default` · `muted` · `subtle`), `weight` (`normal` · `medium` · `semibold` · `bold`), `class?` |
| `badge`     | `variant` (`default` · `secondary` · `outline` · `destructive` · `success` · `warning`), `class?`                                                                                                            |
| `alert`     | `variant` (`default` · `destructive` · `warning` · `success`), `class?`                                                                                                                                      |
| `avatar`    | `src?`, `alt?`, `fallback?`, `size` (`sm` · `md` · `lg`), `class?`                                                                                                                                           |
| `input`     | standard `<input>` attrs, `class?`                                                                                                                                                                           |
| `textarea`  | standard `<textarea>` attrs, `rows` (default `4`), `class?`                                                                                                                                                  |
| `select`    | standard `<select>` attrs, `class?`                                                                                                                                                                          |
| `checkbox`  | standard `<input type="checkbox">` attrs, `class?`                                                                                                                                                           |
| `switch`    | standard `<input type="checkbox">` attrs (rendered `role="switch"`), `class?`                                                                                                                                |
| `label`     | standard `<label>` attrs, `class?`                                                                                                                                                                           |
| `separator` | `orientation` (`horizontal` · `vertical`), `class?`                                                                                                                                                          |
| `skeleton`  | standard `<div>` attrs, `class?`                                                                                                                                                                             |
| `kbd`       | standard `<kbd>` attrs, `class?`                                                                                                                                                                             |
| `tooltip`   | `content` (required), `side` (`top` · `bottom`), `class?`                                                                                                                                                    |
| `toaster`   | `position` (`top-right` · `top-left` · `bottom-right` · `bottom-left`, default `bottom-right`), `class?`                                                                                                     |

> **Tokens, not hardcoded color.** Variants are written in token-resolving Tailwind utilities (`bg-primary`, `text-fg`, `border-border`). That's why a [theme](./THEMING.md) edit restyles every atom at once — and why your overrides should use tokens too.

## The `cn` helper

Every atom merges classes with `cn` from `src/lib/cn.ts`. It flattens strings, arrays, and conditional objects into one class string:

```ts
import { cn } from '@/lib/cn';

cn('px-3', 'py-2', isActive && 'bg-surface-2', { 'opacity-50': disabled });
// → "px-3 py-2 bg-surface-2"  (falsy values dropped)
```

`cn` is a small conditional joiner — it does **not** resolve conflicting Tailwind classes the way `tailwind-merge` would. If you pass `p-2` _and_ `p-4`, both end up in the string; let the later utility win, or drop the one you don't want.

## Compound families

Six families ship as multiple parts — one file per part, grouped under `src/components/ui/<family>/` — so you compose the structure yourself:

```astro
---
import Card from '@/components/ui/card/card.astro';
import CardHeader from '@/components/ui/card/card-header.astro';
import CardTitle from '@/components/ui/card/card-title.astro';
import CardDescription from '@/components/ui/card/card-description.astro';
import CardContent from '@/components/ui/card/card-content.astro';
---

<Card>
  <CardHeader>
    <CardTitle>Plan</CardTitle>
    <CardDescription>Everything you need to launch.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>
```

| Family          | Parts                                                                      | Key props                                                                              |
| --------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `card`          | card, card-header, card-title, card-description, card-content, card-footer | none required — plain containers, `class?` on each                                     |
| `tabs`          | tabs, tabs-list, tabs-trigger, tabs-content                                | `Tabs` needs `defaultValue`; `TabsTrigger`/`TabsContent` each need a matching `value`  |
| `accordion`     | accordion, accordion-item                                                  | `AccordionItem` needs `title`; optional `open` (default `false`)                       |
| `dialog`        | dialog, dialog-title, dialog-description                                   | `Dialog` needs `id`; optional `labelledBy` (point it at your `DialogTitle`'s own `id`) |
| `dropdown-menu` | dropdown-menu, dropdown-menu-item                                          | `DropdownMenu` needs `id`; optional `align` (`start` · `end`)                          |
| `radio-group`   | radio-group, radio-group-item                                              | `RadioGroupItem` needs `name` (shared across the group) and `value`                    |

Interactive ones use native primitives — `<dialog>` for dialog, the popover API for dropdown-menu, `<details name>` for accordion, and the `<ai-tabs>` custom element for tabs. No React, no Radix, no framework runtime.

> Note: this template's own MDX prose kit ships a separate set of docs-authoring primitives (`Callout`, `CodeGroup`, `Tabs` for docs content, `Steps`, etc.) registered in `src/components/docs/mdx-components.ts` — see [`README.md`](../README.md)'s "What ships" table. Those are unrelated to the `src/components/ui/` atoms documented here.

A tabs example, since `defaultValue`/`value` must match across parts:

```astro
---
import Tabs from '@/components/ui/tabs/tabs.astro';
import TabsList from '@/components/ui/tabs/tabs-list.astro';
import TabsTrigger from '@/components/ui/tabs/tabs-trigger.astro';
import TabsContent from '@/components/ui/tabs/tabs-content.astro';
---

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="pricing">Pricing</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="pricing">…</TabsContent>
</Tabs>
```

`dialog` and `dropdown-menu` open via attributes on your own trigger element, not a prop on the family itself:

```astro
---
import Button from '@/components/ui/button.astro';
import Dialog from '@/components/ui/dialog/dialog.astro';
import DialogTitle from '@/components/ui/dialog/dialog-title.astro';

import DropdownMenu from '@/components/ui/dropdown-menu/dropdown-menu.astro';
import DropdownMenuItem from '@/components/ui/dropdown-menu/dropdown-menu-item.astro';
---

<!-- dialog: the trigger carries data-dialog-open="<dialog id>" -->
<Button data-dialog-open="confirm-dialog">Delete</Button>
<Dialog id="confirm-dialog" labelledBy="confirm-title">
  <DialogTitle id="confirm-title">Are you sure?</DialogTitle>
  <Button data-dialog-close>Cancel</Button>
</Dialog>

<!-- dropdown-menu: native popover API. The trigger carries popovertarget, and
     must declare anchor-name: --anchor to match the menu's [position-anchor:--anchor] —
     without it the menu still opens, just unanchored from the trigger. -->
<Button popovertarget="user-menu" style="anchor-name: --anchor">Account</Button>
<DropdownMenu id="user-menu">
  <DropdownMenuItem href="/settings">Settings</DropdownMenuItem>
  <DropdownMenuItem destructive>Sign out</DropdownMenuItem>
</DropdownMenu>
```

## Toasts

Toasts are imperative and not wired into any layout by default. Render `<Toaster />` once — in your root layout, or on whichever pages need it:

```astro
---
import Toaster from '@/components/ui/toaster.astro';
---

<Toaster position="bottom-right" />
```

Then fire a toast from anywhere with the helper:

```ts
import { toast } from '@/lib/toast';

toast('Saved', { variant: 'success', duration: 4000 });
```

`variant` is `'default' | 'success' | 'destructive' | 'warning'`; `duration` is in milliseconds. It dispatches a `window` event (`ai-toast`) that `<Toaster />` listens for — no context provider, no prop drilling.

## Adding a new atom to your own project

These atoms aren't published as an importable library — you own the copies. To pull in a _new_ one that wasn't part of this template, either copy the file straight from the [registry source](https://github.com/JordiParraCrespo/astro-ignite/tree/main/packages/registry/base) (bring `cn.ts` too if you don't already have it), or, if the target project has a shadcn `components.json`, add the astro-ignite registry namespace and install it with the shadcn CLI:

```json
{
  "registries": {
    "@astro-ignite": "https://astroignite.dev/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @astro-ignite/tooltip
```

Compound families bring their whole folder; `cn` resolves transitively.
