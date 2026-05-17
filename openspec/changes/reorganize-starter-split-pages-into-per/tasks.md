# Tasks: reorganize-starter-split-pages-into-per

Ordering rationale:

- Create each new section component **before** wiring its page to import
  it. The tree stays buildable at every intermediate commit.
- Refactor each page pair (default-locale + `[lang]/`) together, so the
  S3 "same imports" invariant is true at every snapshot.
- Run audits/perf last; they're the regression fences, not the
  authoring step.

The "Covers" labels reference scenarios `S<n>` from `proposal.md` and
invariants `I<n>` from the `templates-i18n`, `templates-css-tokens`,
`templates-seo-jsonld`, and `templates-perf` capability specs.

---

- [x] **T1.** Create
      `packages/templates/starter/src/components/sections/landing/FeaturesGrid.astro`.
      Move the features-grid markup (currently lines ~60–86 of
      `src/pages/index.astro`) into the new file. Accept `heading: string`
      and `features: { index: string; tag: string; title: string; body: string }[]`
      as props (or re-derive `t` inside the component per the pattern
      decision logged in `runs/<ts>/notes.md`). The component owns no
      JSON-LD; the grid uses Tailwind utilities (no scoped style block).
      Covers **S2**, **S4** (no zinc/hex introduced), **S5**
      (no `<script type="application/ld+json">`).

- [x] **T2.** Update `src/pages/index.astro` to import and render
      `<FeaturesGrid …/>` underneath `<Hero …/>`. Remove the inline
      `<section class="px-5 pt-12 pb-16">` block and the features-grid
      markup. The frontmatter still builds the `features` array and the
      Hero props; the body is now `<BaseLayout>` → `<Hero/>` →
      `<FeaturesGrid/>`. Covers **S1**, **S3** (paired with T3).

- [x] **T3.** Update `src/pages/[lang]/index.astro` to import and render
      the same `<FeaturesGrid …/>` with the same `<Hero …/>` underneath.
      Preserve the existing `getStaticPaths`. Confirm the file's set of
      section-component imports equals the set in `src/pages/index.astro`
      from T2. Covers **S3**, `templates-i18n` I1/I2.

- [x] **T4.** Create
      `packages/templates/starter/src/components/sections/about/AboutBody.astro`.
      Move the `<article class="page">` (page header + prose) and the
      scoped `<style>` block from `src/pages/about.astro` into the new
      file. Decide and implement the localization pattern (props-down vs.
      section-side `useTranslations`); record the choice in
      `runs/<ts>/notes.md`. Covers **S2**, **S4**.

- [x] **T5.** Replace the body of `src/pages/about.astro` with
      `<BaseLayout …><AboutBody …/></BaseLayout>`. Keep the `schemas`
      array in the frontmatter and pass it to `BaseLayout`. Delete the
      page's scoped `<style>` block. Covers **S1**, **S5**.

- [x] **T6.** Apply T5 to `src/pages/[lang]/about.astro` — same body,
      `getStaticPaths` preserved. Confirm import-set equality with
      `src/pages/about.astro`. Covers **S3**, `templates-i18n` I1/I2.

- [x] **T7.** Create
      `packages/templates/starter/src/components/sections/contact/ContactSection.astro`.
      Move the entire `<section class="page">` (page header + alert
      blocks + form + honeypot + submit Button) and the scoped `<style>`
      block from `src/pages/contact.astro`. The component accepts the
      `result` and `inputError` props derived from
      `Astro.getActionResult(actions.contact)` (or re-derives them
      itself — implementer's choice, recorded in notes.md). Covers
      **S2**, **S4**.

- [x] **T8.** Update `src/pages/contact.astro` body to
      `<BaseLayout …><ContactSection result={result} inputError={inputError}/></BaseLayout>`
      (or `<ContactSection />` if section re-derives). Keep the
      `schemas` array in the frontmatter. Delete the page's scoped
      `<style>` block. Covers **S1**, **S5**.

- [x] **T9.** Apply T8 to `src/pages/[lang]/contact.astro`. Confirm
      import-set equality. Covers **S3**.

- [x] **T10.** Create
      `packages/templates/starter/src/components/sections/blog/BlogIndexList.astro`.
      Move the `<section class="page">` (page header + empty state or
      post-grid `<ul>`) and the scoped `<style>` block from
      `src/pages/blog/index.astro`. Accepts the prepared
      `postCards: PostCard[]` and the rendered copy strings as props
      (or builds them itself). The `PostCard` type stays declared near
      the data-prep site (page frontmatter or a small helper in
      `src/lib/`); whichever, do not move `getCollection` into the
      section. Covers **S2**, **S4**.

- [x] **T11.** Update `src/pages/blog/index.astro` body to
      `<BaseLayout …><BlogIndexList postCards={postCards} …/></BaseLayout>`.
      Keep `getCollection`, `getRelativeLocaleUrl`, and the `schemas`
      array in the page frontmatter. Delete the page's scoped `<style>`
      block. Covers **S1**, **S5**, `templates-i18n` I5
      (`getRelativeLocaleUrl` stays at page level).

- [x] **T12.** Apply T11 to `src/pages/[lang]/blog/index.astro`. Confirm
      import-set equality. Covers **S3**.

- [x] **T13.** Create
      `packages/templates/starter/src/components/sections/projects/ProjectsIndexList.astro`.
      Apply the same pattern as T10 (page header + project grid + scoped
      style); accept `projectCards: ProjectCard[]` as a prop. Covers
      **S2**, **S4**.

- [x] **T14.** Update `src/pages/projects/index.astro` body to
      `<BaseLayout …><ProjectsIndexList projectCards={projectCards} …/></BaseLayout>`.
      Keep `getCollection`, `getRelativeLocaleUrl`, and `schemas` in the
      frontmatter. Covers **S1**, **S5**.

- [x] **T15.** Apply T14 to `src/pages/[lang]/projects/index.astro`.
      Confirm import-set equality. Covers **S3**.

- [x] **T16.** Refactor `src/pages/404.astro` to composition-only.
      Either (a) extract a new
      `src/components/sections/not-found/NotFoundHero.astro` carrying the
      `<section class="not-found">` and its scoped `<style>`, or (b)
      reuse / repurpose the existing
      `src/components/blocks/not-found-state.astro` as the section
      component. Record the choice in `runs/<ts>/notes.md`. Either way,
      `src/pages/404.astro` body becomes
      `<BaseLayout … noindex={true}><NotFoundHero …/></BaseLayout>` with
      no inline section markup and no scoped `<style>`. There is no
      `[lang]/404.astro` in the starter today; do not introduce one.
      Covers **S1**, **S2**, **S4**.

- [x] **T17.** Run a tree audit: for every refactored page, confirm
      (a) zero inline `<section>` / `<article class="page">` / `<form>` /
      grid markup in the page body, (b) zero `<style>` blocks in the
      page file, (c) the rendered tree is exactly
      `<BaseLayout …>` containing 1+ section-component invocations.
      Acceptable check: visual diff each page file against its
      pre-change version and confirm only frontmatter + section
      `<Component />` imports remain in the template body. Covers
      **S1** (live verification).

- [x] **T18.** For each page that has a `[lang]/` parallel
      (`index`, `about`, `contact`, `blog/index`, `projects/index`),
      diff the section-import set of the default file vs. the `[lang]/`
      file. The two sets must be equal. Covers **S3** (live verification).

- [x] **T19.** Grep every new file under
      `packages/templates/starter/src/components/sections/` for raw
      zinc (`bg-zinc-`, `text-zinc-`, `border-zinc-`,
      `ring-zinc-`) and hex literals matching `#[0-9a-fA-F]{3,8}`.
      Confirm zero matches outside `global.css`. Covers **S4** (no zinc /
      hex regression), `templates-css-tokens` I1.

- [x] **T20.** Grep every new file under
      `packages/templates/starter/src/components/sections/` for
      `application/ld+json`. Confirm zero matches. Covers **S5**,
      `templates-seo-jsonld` I2.

- [x] **T21.** Diff
      `packages/templates/starter/package.json` against `main`. Confirm
      `dependencies` has no added entries. Covers **S6**,
      `templates-perf` I5.

- [x] **T22.** Run `pnpm typecheck` from the repo root. Confirm exit 0.
      Covers **S7** (typecheck half).

- [x] **T23.** Run
      `pnpm audit:invariants --change reorganize-starter-split-pages-into-per`.
      Confirm exit 0. Audits exercised:
      `i18n-parallels.mjs` (I1/I2/I3 of `templates-i18n`),
      `internal-links-localized.mjs` (I5 of `templates-i18n`),
      `tokens-only.mjs` and `tokens-only.mjs --layered` (I1/I4 of
      `templates-css-tokens`), `jsonld-graph.mjs --strict` (I1/I2 of
      `templates-seo-jsonld`). Covers **S7** (audit half).

- [x] **T24.** Run `pnpm scaffold:test`. Confirm exit 0 — CLI scaffolds
      the starter into a clean `apps/playground/`, installs, builds,
      Lighthouse. Covers **S8**.

- [x] **T25.** Run `pnpm perf:budget` against the starter. Capture the
      report under
      `openspec/changes/reorganize-starter-split-pages-into-per/runs/<ts>/perf.txt`
      with per-page scores for `/`, `/blog`, plus the
      `--transfer`/`--critical-css`/`--deps` checks. Performance,
      Accessibility, Best Practices, and SEO must each be ≥ 95; LCP, INP,
      CLS, TBT, and total compressed transfer for `/` must each be inside
      the `templates-perf` budget. Covers **S9**,
      `templates-perf` I1–I5.

- [x] **T26.** Run `git diff --name-only main` and confirm the touched
      paths are limited to
      `packages/templates/starter/`,
      `openspec/changes/reorganize-starter-split-pages-into-per/`, and
      `.changeset/`. `apps/playground/` is permitted iff
      `pnpm scaffold:test` regenerated it during T24. Covers **S10**.

- [x] **T27.** Add a changeset under `.changeset/` summarising the
      starter section-split refactor (compositional pages, no runtime
      behaviour change, no public API impact). Required by
      `feature_list.json` rule `require_changeset_to_close`.
