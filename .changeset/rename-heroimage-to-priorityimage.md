---
'astro-ignite': patch
'create-astro-ignite': patch
---

Rename the `HeroImage` component to `PriorityImage` in the starter and docs templates (and the `apps/site` / `apps/docs` mirrors). The component is the eager, `fetchpriority="high"` wrapper for above-the-fold LCP images — `PriorityImage` describes the loading contract it enforces rather than where it happens to be used. The file moves to `src/components/image/PriorityImage.astro`; `ArticleLayout`/`ProjectLayout` imports, the `Image.astro` comment, and the `IMAGES.md` / `BENCHMARKS.md` / `README.md` docs are updated to match. The lowercase `heroImage` content-collection field is unchanged.
