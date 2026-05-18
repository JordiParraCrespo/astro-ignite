# Tasks: restructure-starter-template-component-o

Ordering rationale:

- Create new subdirectories and move chrome (`common/*`) first because
  the layouts depend on the chrome paths — keeping the tree buildable
  at every commit means rewriting layout imports immediately after the
  files move.
- Move sections next, page-pair by page-pair (default + `[lang]/`), so
  the parity invariant from change #28 stays green at every snapshot.
- Merge the 404 surface (delete the registry block + collapse into
  `not-found/NotFoundHero.astro`) only after the section moves are
  done, so the implementer is not editing two 404 files simultaneously.
- Strip the registry blocks tier, then update audits / docs.
- Mirror to the other three trees (docs template, site, docs app,
  playground) once the starter tree is settled — the mirrors copy a
  known-good layout.
- Run audits / typecheck / scaffold / perf last; they are the
  regression fences, not the authoring step.

"Covers" labels reference scenarios `S<n>` from `proposal.md` and
invariants `I<n>` from the cited capability specs.

---

## Phase 1 — Starter: move chrome into `common/` and `legal/`

- [ ] **T1.** Create the new directory skeleton under
      `packages/templates/starter/src/components/`: `common/`, `blog/`,
      `projects/`, `about/`, `contact/`, `legal/`, `not-found/`.
      (`ui/`, `image/`, `seo/` already exist.) Commit as an empty
      structural prep step if convenient. Covers **S1**.

- [ ] **T2.** Move and rename
      `src/components/Nav.astro` →
      `src/components/common/Header.astro`. Preserve the file's
      content (frontmatter, markup, scoped `<style>` block) verbatim;
      update any internal imports (e.g. `Brand.astro`,
      `ThemeToggle.astro`, `LocaleSwitcher.astro`) to point at their
      new `common/` paths once those moves complete. Covers **S2**,
      **S4**, `templates-css-tokens` I4, `templates-i18n` I5/I6.

- [ ] **T3.** Move `src/components/Footer.astro`,
      `src/components/Brand.astro`,
      `src/components/ThemeToggle.astro`,
      `src/components/LocaleSwitcher.astro`,
      `src/components/Analytics.astro`, and
      `src/components/Hero.astro` into `src/components/common/`
      (preserving filenames, PascalCase). Update their internal
      imports (e.g. `Footer.astro` importing `Brand.astro` from
      `@/components/Brand.astro` → `@/components/common/Brand.astro`).
      Covers **S2**, **S4**.

- [ ] **T4.** Move `src/components/CookieBanner.astro` →
      `src/components/legal/CookieBanner.astro`. Internal imports
      (cookie policy link, i18n keys) are unchanged. Covers **S2**,
      `templates-consent` I2/I3.

- [ ] **T5.** Update `src/layouts/BaseLayout.astro` (and any other
      layout files in `src/layouts/` that import the chrome) to
      reference the new paths:
      `@/components/common/Header.astro`,
      `@/components/common/Footer.astro`,
      `@/components/common/Analytics.astro`,
      `@/components/legal/CookieBanner.astro`. The local default-
      import names update too: `Nav` becomes `Header` at the import
      site. Covers **S2**, **S6**, `templates-consent` I2,
      `templates-seo-jsonld` I1.

## Phase 2 — Starter: collapse `sections/` into per-feature folders

- [ ] **T6.** Move
      `src/components/sections/landing/FeaturesGrid.astro` →
      `src/components/common/FeaturesGrid.astro`. Update
      `src/pages/index.astro` and `src/pages/[lang]/index.astro` to
      import from `@/components/common/FeaturesGrid.astro` and from
      `@/components/common/Hero.astro` (the Hero move from T3). Both
      pages must end up with byte-equal `<BaseLayout>` bodies.
      Covers **S2**, **S5**, **S6**, `templates-i18n` I1/I2.

- [ ] **T7.** Move
      `src/components/sections/about/AboutBody.astro` →
      `src/components/about/AboutBody.astro`. Update
      `src/pages/about.astro` and `src/pages/[lang]/about.astro` to
      import from `@/components/about/AboutBody.astro`. Covers **S2**,
      **S5**, **S6**.

- [ ] **T8.** Move
      `src/components/sections/contact/ContactSection.astro` →
      `src/components/contact/ContactSection.astro`. Update
      `src/pages/contact.astro` and
      `src/pages/[lang]/contact.astro` to import from
      `@/components/contact/ContactSection.astro`. Covers **S2**,
      **S5**, **S6**.

- [ ] **T9.** Move
      `src/components/sections/blog/BlogIndexList.astro` →
      `src/components/blog/BlogIndexList.astro`. Update
      `src/pages/blog/index.astro` and
      `src/pages/[lang]/blog/index.astro` to import the component
      and the re-exported `type { PostCard }` from the new path.
      Covers **S2**, **S5**, **S6**, `templates-i18n` I5.

- [ ] **T10.** Move
      `src/components/sections/projects/ProjectsIndexList.astro` →
      `src/components/projects/ProjectsIndexList.astro`. Update
      `src/pages/projects/index.astro` and
      `src/pages/[lang]/projects/index.astro` to import the
      component and `type { ProjectCard }` from the new path. Covers
      **S2**, **S5**, **S6**, `templates-i18n` I5.

- [ ] **T11.** Move
      `src/components/sections/not-found/NotFoundHero.astro` →
      `src/components/not-found/NotFoundHero.astro`. Covers **S2**,
      **S4**.

- [ ] **T12.** Inspect `src/components/blocks/not-found-state.astro`
      and the freshly-moved `not-found/NotFoundHero.astro`. If
      `NotFoundHero.astro` already renders the full 404 surface
      (header + lede + CTA + scoped `<style>`), nothing needs to be
      merged. If `not-found-state.astro` carries markup that
      `NotFoundHero.astro` does not yet have, absorb it into
      `not-found/NotFoundHero.astro` (markup + scoped styles + import
      adjustments). The result is **one** file rendering the 404
      surface. Record the chosen path in `runs/<ts>/notes.md`. Covers
      **S3**.

- [ ] **T13.** Update `src/pages/404.astro` to import only
      `@/components/not-found/NotFoundHero.astro` (no
      `@/components/blocks/not-found-state.astro` import remains).
      The page body remains
      `<BaseLayout … noindex={true}><NotFoundHero /></BaseLayout>`.
      Covers **S3**, **S5**, **S6**.

- [ ] **T14.** Delete `src/components/blocks/not-found-state.astro`
      and remove the now-empty `src/components/blocks/` directory.
      Delete every empty subdirectory under
      `src/components/sections/` and the `sections/` directory itself.
      Covers **S1**, **S2**.

## Phase 3 — Registry: remove the blocks tier for now

- [ ] **T15.** Delete `packages/registry/blocks/not-found-state.astro`
      and remove the now-empty `packages/registry/blocks/` directory.
      Covers **S7**.

- [ ] **T16.** Edit `packages/registry/registry.json` to remove the
      `not-found-state` entry (the only `registry:block` item today).
      After this edit, every entry in `items[]` has `type` of
      `registry:lib` or `registry:ui`. Covers **S7**, `registry-blocks`
      I1 (vacuously).

## Phase 4 — Mirrors: docs template

- [ ] **T17.** Apply the chrome moves to
      `packages/templates/docs/src/components/`. Move `Brand.astro`,
      `ThemeToggle.astro`, `LocaleSwitcher.astro`, `Analytics.astro`
      into `common/`; move `CookieBanner.astro` into `legal/`.
      Update every layout (`packages/templates/docs/src/layouts/*`)
      and component under `src/components/docs/*` that imports any
      of those files to use the new paths. Covers **S8**.

## Phase 5 — Mirrors: apps/site

- [ ] **T18.** Apply the chrome moves to
      `apps/site/src/components/`: `Nav.astro` →
      `common/Header.astro`; `Footer/Brand/ThemeToggle/
  LocaleSwitcher/Analytics.astro` → `common/`;
      `CookieBanner.astro` → `legal/`. Update the layouts and any
      `landing/*` component that imports the moved files. The site's
      own `landing/*` and `blocks/terminal/*` directories stay put
      (site-specific compositions). Covers **S8**.

## Phase 6 — Mirrors: apps/docs

- [ ] **T19.** Apply the chrome moves to
      `apps/docs/src/components/`: `Brand`, `ThemeToggle`,
      `LocaleSwitcher`, `Analytics` → `common/`; `CookieBanner` →
      `legal/`. Update layouts and the `docs/*` components. Covers
      **S8**.

## Phase 7 — Mirrors: apps/playground

- [ ] **T20.** Apply the chrome moves to
      `apps/playground/src/components/`: `Nav.astro` →
      `common/Header.astro`; `Footer/Brand/ThemeToggle/
  LocaleSwitcher/Analytics/Hero.astro` → `common/`;
      `CookieBanner.astro` → `legal/`. Delete
      `apps/playground/src/components/blocks/` and every file under
      it (the playground replays the starter, which no longer has a
      `blocks/` directory). Update
      `apps/playground/src/layouts/BaseLayout.astro` import paths.
      Covers **S8**.

## Phase 8 — Documentation and changeset

- [ ] **T21.** Update
      `packages/templates/starter/AGENTS.md` (and via its symlink
      `CLAUDE.md`): in the "Layered CSS" invariant (#4), replace
      "Hero, Nav, BaseLayout" with "Hero, Header, BaseLayout".
      Update any other reference to the old paths in this file.
      Covers **S2**.

- [ ] **T22.** Audit `apps/site/AGENTS.md`,
      `apps/docs/AGENTS.md`, `packages/templates/docs/AGENTS.md`,
      and `packages/registry/AGENTS.md` for references to the old
      paths. Rewrite any references to `Nav.astro` / "blocks tier" /
      the old loose-root chrome to the new homes. The registry
      AGENTS.md documents that the blocks tier is empty and will be
      reintroduced when a real composition lands. Covers **S2**,
      **S7**.

- [ ] **T23.** Add a changeset under
      `.changeset/restructure-starter-components.md`. Body:
      summarize the restructure as a **breaking-for-end-users**
      reorganization of the starter component tree, list the
      old → new path mapping, note that the registry `blocks/` tier
      is temporarily removed (no `registry:block` items in
      `registry.json` until a real composition lands), and bump
      `astro-ignite` and `create-astro-ignite` minor per the
      workspace's changeset convention. Covers **S16**.

## Phase 9 — Verification

- [ ] **T24.** Run a tree audit: for every component file under
      `packages/templates/starter/src/components/`, confirm it lives
      in `ui/`, `common/`, `blog/`, `projects/`, `about/`,
      `contact/`, `legal/`, `not-found/`, `image/`, or `seo/`. There
      are zero `*.astro` files directly under
      `src/components/`. There is no `sections/` or `blocks/`
      directory anywhere under `src/components/`. Covers **S1**.

- [ ] **T25.** Grep the starter tree for the old paths:
      `@/components/Nav.astro`, `@/components/Footer.astro`,
      `@/components/Brand.astro`, `@/components/ThemeToggle.astro`,
      `@/components/LocaleSwitcher.astro`,
      `@/components/Analytics.astro`,
      `@/components/CookieBanner.astro`, `@/components/Hero.astro`,
      `@/components/sections/`, `@/components/blocks/`. Confirm zero
      matches across `packages/templates/starter/src/**`,
      `packages/templates/docs/src/**`, `apps/site/src/**`,
      `apps/docs/src/**`, `apps/playground/src/**`. Covers **S6**,
      **S8**.

- [ ] **T26.** Confirm exactly one 404-surface composition file
      exists at `packages/templates/starter/src/components/not-found/
NotFoundHero.astro`. Confirm `src/pages/404.astro` imports it. Confirm
      `packages/templates/starter/src/components/blocks/` does not
      exist. Covers **S3**.

- [ ] **T27.** Confirm `packages/registry/blocks/` does not exist
      and `packages/registry/registry.json` contains no entry with
      `"type": "registry:block"`. Covers **S7**.

- [ ] **T28.** Diff each touched `package.json`
      (`packages/templates/starter/`, `packages/templates/docs/`,
      `apps/site/`, `apps/docs/`, `apps/playground/`,
      `packages/registry/`) against `main`. Confirm `dependencies`
      arrays have zero added entries. Covers **S13**,
      `templates-perf` I5.

- [ ] **T29.** Run `pnpm format:check`. Confirm exit 0. (If failing
      because Astro file formatting drifted during the moves, run
      `pnpm format` and re-commit; do not bypass the check.) Covers
      **S14** (format half).

- [ ] **T30.** Run `pnpm typecheck`. Confirm exit 0. Covers **S14**
      (typecheck half).

- [ ] **T31.** Run `pnpm test`. Confirm exit 0. Covers **S14**.

- [ ] **T32.** Run `pnpm audit:invariants --change
restructure-starter-template-component-o`. Confirm exit 0. The
      dispatched audits include
      `consent-gated-analytics.mjs` (and `--banner`, `--policy`,
      `--boundary`), `jsonld-graph.mjs --strict --typed`,
      `i18n-parallels.mjs --strict --content --config`,
      `internal-links-localized.mjs`, `tokens-only.mjs` and
      `tokens-only.mjs --layered`, and
      `no-react-in-atoms.mjs --include-blocks` (which finds zero
      blocks and reports pass). Covers **S9**, **S10**, **S11**,
      **S12**, **S14**.

- [ ] **T33.** Run `pnpm scaffold:test`. The CLI scaffolds the
      starter into `apps/playground/`, installs, builds, runs
      Lighthouse. Confirm exit 0. After this step,
      `apps/playground/` is byte-canonical for the new layout, so
      any drift in T20's hand-mirror is corrected. Covers **S14**.

- [ ] **T34.** Run `pnpm perf:budget` against the starter. Capture
      the report under
      `openspec/changes/restructure-starter-template-component-o/runs/<ts>/perf.txt`
      with per-page Lighthouse scores for `/`, `/blog`, `/projects`,
      `/about`, `/contact`, plus the
      `--transfer`/`--critical-css`/`--deps` checks. Performance,
      Accessibility, Best Practices, and SEO ≥ 95 on every page.
      LCP / INP / CLS / TBT / total compressed transfer on `/` stay
      inside the `templates-perf` budget. Covers **S15**,
      `templates-perf` I1–I5.

- [ ] **T35.** Final boundary check. Run `git diff --name-only main`
      and confirm the touched paths are limited to:
      `packages/templates/starter/`,
      `packages/templates/docs/`,
      `apps/site/`,
      `apps/docs/`,
      `apps/playground/` (regenerated by T33 if needed),
      `packages/registry/`,
      `.changeset/`,
      `openspec/changes/restructure-starter-template-component-o/`,
      and the workspace AGENTS.md files touched in T21–T22. No edits
      outside this set. Covers **S14** (boundary check).
