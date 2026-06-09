---
'astro-ignite': patch
'create-astro-ignite': patch
---

Accessibility fixes surfaced by the Lighthouse gate now testing branch templates: light-mode `--color-fg-muted` darkened to zinc-600 (zinc-500 was ~4.4:1 on surface-2 chips, under the AA 4.5:1 floor), feature-card titles render as `h3` (was an `h2`→`h4` skip), post prev/next titles render as `p` (not document headings), and the Brand link only carries an `aria-label` in icon-only `mark` variant so the visible wordmark matches the accessible name.
