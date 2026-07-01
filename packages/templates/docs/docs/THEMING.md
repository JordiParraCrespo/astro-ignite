# Theming & tokens

Every color, radius, shadow, and font resolves through a small set of **CSS variables** declared in `src/styles/global.css`. Components never hardcode a color — they read tokens like `--color-bg` and `--color-primary`. A full reskin is a handful of edits in one file, not a sweep across the tree.

## The token layer

Tokens live in a Tailwind v4 `@theme` block at the top of `global.css`. There are two tiers:

- **The zinc scale** (`--color-zinc-50` … `--color-zinc-950`) — raw palette values, theme-invariant. Single source of truth for every neutral.
- **Functional tokens** — semantic names that point at the scale. Components only ever reference these:

| Token                                                    | Role                         |
| -------------------------------------------------------- | ---------------------------- |
| `--color-bg`                                             | Page background              |
| `--color-surface`, `--color-surface-2`                   | Raised panels, insets        |
| `--color-fg`                                             | Body text                    |
| `--color-fg-muted`, `--color-fg-subtle`                  | Secondary / tertiary text    |
| `--color-border`, `--color-border-strong`                | Hairlines, stronger dividers |
| `--color-primary`, `--color-primary-fg`                  | Interactive fill + its text  |
| `--color-ring`                                           | Focus ring                   |
| `--color-success` / `--color-warning` / `--color-danger` | Functional status only       |

Beyond color, the same block defines `--font-display` / `--font-mono`, `--radius` (`-sm` / `-md` / `-lg`), `--shadow` (`-sm`), container widths, and the `--ease-out-soft` motion curve.

> **No accent by default.** The shipped design has no accent color — the interactive color is just the inverted neutral (near-white on near-black). Introducing a brand accent is the most common reskin; the walkthrough below does exactly that.

## How components read tokens

Components express color through Tailwind v4 utilities that resolve a token — either the theme-mapped shorthand (`bg-primary`, `text-fg`, `border-border`) or the arbitrary form (`bg-[var(--color-bg)]`). The `button` atom's default variant is `bg-primary text-primary-fg`. Change `--color-primary` once and every button, link, and focus state moves with it.

`inlineStylesheets: 'always'` ships the full stylesheet in the HTML on first paint, so a token edit is the whole change — no separate stylesheet to sync.

## Default theme

The docs template ships `light` as the default theme. Change it in `src/config/site.ts`:

```ts
export const siteConfig = {
  // ...
  defaultTheme: 'light', // 'light' | 'dark' | 'system'
};
```

`ThemeToggle.astro` flips the `.light` class and persists the choice to `localStorage`. An anti-flash inline script in `BaseLayout` applies the stored preference — or `siteConfig.defaultTheme` on first visit — before first paint, so there's no flicker.

## Tri-state dark mode

The design is **dark-first** at the CSS level. With no class on `<html>`, the `@theme` values apply. A `.light` class flips the functional tokens to their light values:

```css
.light {
  --color-bg: var(--color-zinc-50);
  --color-fg: var(--color-zinc-950);
  --color-primary: var(--color-zinc-900);
  /* …the rest of the functional tokens, re-pointed at the scale */
}
```

The third state is "force dark on a light page" — a `.dark` class wins over `.light`:

```css
@variant dark (&:where(:not(.light), :not(.light) *));
```

## Walkthrough: a real reskin

Give the site a violet brand accent and slightly rounder corners — without touching a single component.

**1. Add your brand color to the scale**

Declare the new palette values alongside the zinc scale in the `@theme` block:

```css
@theme {
  /* …existing zinc scale… */
  --color-brand: oklch(62% 0.21 280);
  --color-brand-fg: var(--color-zinc-50);
}
```

**2. Re-point the functional tokens**

Make `--color-primary` your brand color in dark mode, and the focus ring a tint of it:

```css
@theme {
  /* functional tokens */
  --color-primary: var(--color-brand);
  --color-primary-fg: var(--color-brand-fg);
  --color-ring: var(--color-brand);
}
```

Do the same inside `.light` so the accent holds in light mode.

**3. Round the corners**

The whole UI scales off four radius tokens. Bump them once:

```css
@theme {
  --radius: 10px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

**4. Run it**

`pnpm dev` and click around. Buttons, links, focus rings, badges, and cards all carry the new accent and radius — because they were reading tokens the whole time. No component edits, no find-and-replace.

> **Swap the typeface.** Fonts are tokens too. Repoint `--font-display` / `--font-mono` — see [`FONTS.md`](./FONTS.md) for the system-stack default and how to wire in a custom font.

## Rules that keep it clean

- **Tokens only in components** — never `bg-zinc-900` or a raw hex. The zinc scale exists solely as the source of token values.
- **Add a token before a one-off color.** If two components need the same new color, it's a token.
- Keep the `.light` block in lock-step with `@theme`: every functional token you add needs a light value.
