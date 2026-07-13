# Benchmarks

The pitch is "Lighthouse 100s on mobile out of the box." This page documents how we measure, how to reproduce, and what's in the budget.

## Targets

CI gates every release of the upstream `astro-ignite` template against these thresholds, mobile config:

| Category       | Hard floor | Soft target |
| -------------- | ---------- | ----------- |
| Performance    | 95         | 100         |
| Accessibility  | 95         | 100         |
| Best Practices | 95         | 100         |
| SEO            | 95         | 100         |

The hard floor (95) blocks PRs in the upstream repo. The soft target (100) prints warnings but doesn't block — Lighthouse mobile has real measurement variance and one flaky run shouldn't gate a merge.

## Routes audited

- `/` — docs landing page
- `/introduction` — a docs content page (representative — first page)
- `/legal/privacy` — legal page

These cover the major layout types. If you add new layouts, add them to your local Lighthouse config.

## Reproducing locally

```bash
pnpm build
pnpm preview &
sleep 2
npx lhci autorun --upload.target=temporary-public-storage
```

Or simpler:

```bash
pnpm build
npx serve dist &
# open Chrome DevTools → Lighthouse → Mobile, run audit on the served URL
```

Run each audit 3 times, take the median. Single runs vary 1-3 points routinely.

## What's in the perf budget

The template's homepage cold load (gzipped, mobile 4G simulation):

| Asset                    | Approximate size  | Notes                             |
| ------------------------ | ----------------- | --------------------------------- |
| HTML                     | 8-12 KB           | Inlined critical CSS varies       |
| Fonts                     | 0 KB               | System font stack only — no remote font requests |
| Critical CSS (inline)    | 2-4 KB            | Beasties output, varies per page  |
| Tailwind CSS (async)     | 8-15 KB           | After above-the-fold paints       |
| Hero image (LCP)         | ~25 KB            | AVIF, depends on source           |
| JS                       | <2 KB             | Vanilla `<script>` blocks only    |

Total to first paint: ~60-80 KB. LCP image arrives shortly after — `<link rel="preload">` kicks the request off during HTML parse.

## Why Lighthouse 100 is sometimes flaky

- **Network simulation:** Lighthouse simulates 4G with throttling; CPU throttling is 4× slowdown. Real-machine variance affects timing scores.
- **Server cold-start:** the first request after `pnpm preview` is slower than steady-state.
- **Browser warm-up:** running Lighthouse multiple times in the same Chrome process caches differently than a fresh launch.

For consistent numbers: run Lighthouse CI in a clean Docker container, 3 runs per URL, median.

## What hurts perf in this template (and how to avoid)

| Footgun                                                     | Symptom                                   | Fix                                              |
| ----------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------ |
| Adding `client:load` to a React island                      | TBT spikes, JS payload grows              | Use `client:idle` or `client:visible` instead    |
| Forgetting `width`/`height` on hero                         | Layout shift (CLS)                        | Set both — required on `<PriorityImage>`             |
| Inline `<img>` instead of `<Image>`                         | No AVIF/WebP, no responsive srcset        | Use the wrapper                                  |
| Adding `prefers-color-scheme` `@media` blocks for dark mode | Conflicts with the `.dark` class strategy | Use the `.dark` selector pattern in `global.css` |
| Adding a remote font without preloading + `font-display: swap` | FOIT/FOUC, LCP delayed    | Preload the above-the-fold weight, use `swap`, and add metric overrides (see `FONTS.md`) |

## Budget enforcement

To enforce a perf budget locally, add a `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4321/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

Run via `npx lhci autorun`.

## Real-world deltas

Common things that drop Lighthouse mobile from 100 → 95 in production:

- Heavy embedded third-party (YouTube embeds, Twitter widgets, Stripe pricing tables): 5-15 points off Performance.
- Large above-the-fold images without `<PriorityImage>` props correctly set: 3-8 points.
- Forgotten `client:load` on what should be a `client:visible` component: variable, can be huge.
- Cumulative layout shift from web fonts without metric overrides: 5-10 points — not a risk out of the box (the template ships zero remote fonts), but applies the moment you add one; see `FONTS.md`.

## Bundle size monitoring

The build prints a per-page asset breakdown. To track over time:

```bash
pnpm build > build.log 2>&1
```

Diff `build.log` between commits. If the JS column grows unexpectedly, an island was added with `client:load`.

For a richer view: add `astro-bundle-size-plugin` (community) or roll your own integration that hooks `astro:build:done` and tabulates `dist/_astro/*` sizes.
