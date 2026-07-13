# Benchmarks

The pitch is "tuned for Lighthouse 100s on mobile" — in practice, the enforced CI floor is ≥95, mobile only. This page documents how we measure, how to reproduce, and what's in the budget.

## Targets

CI gates every release of the upstream `astro-ignite` template against these thresholds, mobile config only (there is no desktop gate):

| Category       | Enforced floor |
| -------------- | -------------- |
| Performance    | 95             |
| Accessibility  | 95             |
| Best Practices | 95             |
| SEO            | 95             |

95 is the hard floor that blocks PRs in the upstream repo — Lighthouse mobile has real measurement variance and a single flaky run shouldn't gate a merge on a hard 100. The template is tuned to land at 100 in a clean run; treat 95 as the guarantee, not the aim.

## Routes audited

- `/` — homepage hero
- `/blog` — collection page
- `/blog/<post>` — article page (representative — first post)
- `/projects/<project>` — case study page

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
| Fonts                     | 0 KB              | System font stack — no font requests by default |
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
| Wiring up a client-side framework component                 | TBT spikes, JS payload grows              | This template has no client framework — stick with Astro + vanilla JS / native HTML |
| Forgetting `width`/`height` on hero                         | Layout shift (CLS)                        | Set both — required on `<PriorityImage>`             |
| Inline `<img>` instead of `<Image>`                         | No AVIF/WebP, no responsive srcset        | Use the wrapper                                  |
| Adding a custom font without fallback metrics               | LCP delayed, potential CLS on swap        | See [`FONTS.md`](./FONTS.md) — the default system stack has neither problem |
| Adding `prefers-color-scheme` `@media` blocks for dark mode | Conflicts with the `.dark` class strategy | Use the `.dark` selector pattern in `global.css` |

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
- Cumulative layout shift from web fonts without metric overrides: 5-10 points (the template ships a system font stack by default, which has no swap to shift; see `FONTS.md` if you add a custom font).

## Bundle size monitoring

The build prints a per-page asset breakdown. To track over time:

```bash
pnpm build > build.log 2>&1
```

Diff `build.log` between commits. If the JS column grows unexpectedly, an island was added with `client:load`.

For a richer view: add `astro-bundle-size-plugin` (community) or roll your own integration that hooks `astro:build:done` and tabulates `dist/_astro/*` sizes.
