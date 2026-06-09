# Roadmap

> Source of truth for the path to the **0.2.0 public launch** and the version
> ladder beyond it. The feature backlog in `openspec/feature_list.json` is
> stale — **this file wins** until the queue is rewritten to match it (see
> Checkpoint 0).

## Vision

Launch an MVP worth publishing: **two templates (starter + docs)** that are

1. well designed (Claude Design, both templates),
2. easy and clean for agents to modify (**AI-ready**: shipped skills + invariant guides),
3. documented (customization guides + full base-component reference),
4. tooling-complete out of the box (lint, format),
5. shadcn-consumable (every atom installable into any project via `npx shadcn add @astro-ignite/*`),
6. shipped through a stable release pipeline as **`0.2.0`**, then announced.

The docs template carries a sharper ambition: be the best **free** way to build
documentation that AI agents both author and read. The cheap, static slice of
that — agent-first content routes plus the Mintlify-parity components a stranger
expects — is in launch scope below (Checkpoints 2–3). The agentic layer
(MCP-generated-from-docs, in-page Ask-AI) is on the ladder, not in 0.2.0.

**The cut rule:** a feature is in scope only if its absence makes a launch claim
false. Everything else goes to the version ladder at the bottom. The launch is
done when the stranger test passes — not when the ideas run out.

---

## Launch checkpoints (0.2.0)

### 0. Housekeeping — DONE 2026-06-05

Executed as a full stale-state sweep + verification pass. Record:

**Cleaned:**

- [x] Merge `feat/starter-blog-features` — landed as #69. (apps/site mirror deliberately deferred to Checkpoint 2 — one mirror pass after design, not two.)
- [x] Archive the 14 shipped-but-unarchived changes to `openspec/archive/2026-06-05-*` — each verified shipped on main (artifact-checked per acceptance) before archiving. `pnpm doctor` went 1 error → 0.
- [x] Rewrite `openspec/feature_list.json` — now contains only the five harness-shaped launch features (#18–#22: prettier-in-templates, six guides, component reference, AI-ready skills, demo blog content). Post-launch features deleted from the queue; the version ladder below is their record. Human-owned checkpoints (design, release, launch QA) intentionally stay out of the queue.
- [x] Branches: 24 stale local + 32 stale remote deleted (all verified squash-merged, fully merged, or deliberately abandoned). Stale `/tmp/aig-fix-39` worktree pruned. Remaining: `main`, `changeset-release/main`, `ci/manual-release-workflow`.
- [x] PRs: #11 (Hermes review action) closed as pre-launch housekeeping. #66 (manual release workflow) kept — it seeds Checkpoint 6. #22 (changesets version PR) kept — it's automation.
- [x] Unformatted `ROADMAP.md` on main fixed (was breaking `format:check`).
- [x] `.changeset/` reorganized for the release: 21 accumulated changesets consolidated into five thematic `0-2-0-*` changesets (blog features, Tailwind-first + restructure, docs parity, Astro 6 + deps, tooling + AI-readiness) — the 0.2.0 changelog now tells the launch story. Fixed in passing: changesets targeting ignored private packages (would have failed `changeset version`), one empty-frontmatter changeset whose note would have vanished, and a doc claim that a nonexistent `astro-ignite add` command exists. Convention going forward: pending changesets are the next version's; prefix filenames `0-2-1-*` etc. (changesets can't read subdirectories), and `CHANGELOG.md` is the permanent per-version record after each release.

**Verified (what works):** `format:check` ✅ · `typecheck` ✅ (3 cosmetic hints) · `test` ✅ 9/9 · `audit:invariants` ✅ 9/9 · `lint` ✅ all packages · `scaffold:test` ✅ (assert mode) · `test:e2e` ✅ 45 passed / 7 skipped / 0 failed · `pnpm doctor` ✅ 0 errors.

**Known-not-working (accepted, tracked):**

- `pnpm perf:budget` skips locally — no Chrome on this machine; CI Lighthouse gate covers it. Install before Checkpoint 1 (see prereq there).
- openspec CLI not installed — archiving stays manual (worked fine).
- Leftover cosmetic typecheck hints: unused `interface Props` in `blog/page/[page].astro` ×2, deprecated `tseslint.config` signature — fold into any upcoming starter touch.

### 1. Design — starter + docs (LAUNCH BLOCKER, in progress)

Designed in Claude Design. Owner: Jordi. Blast radius decision still open
(reskin vs restyle vs redesign) — to be settled when the design lands.

- [ ] Prereq: install Chrome locally (`sudo node scripts/doctor/install-chrome.mjs`) so `pnpm perf:budget` gives fast local Lighthouse loops during design iteration.
- [ ] Starter pages designed: home, blog index, blog post, projects, about, contact, 404.
- [ ] Docs pages designed: landing, doc page, search, 404.
- [ ] Design applied to `packages/templates/{starter,docs}` (tokens-first; honor the tokens-only + Tailwind-first invariants).
- [ ] Mirrors updated: `apps/site`, `apps/docs`.
- [ ] All gates stay green: `pnpm audit:invariants`, `pnpm perf:budget`, Lighthouse CI.
- **Done when:** every page on the list matches the Claude Design bundle. Pages/sections not on the list are post-launch.

### 2. Templates final ("the examples")

The deployed templates ARE the launch demo; every shipped feature must be visible.

- [ ] Demo content exercises the new blog features: enough posts to trigger pagination, overlapping tags, meaningful related posts (~5–6 posts; hero images via the banner pipeline — **after** design settles).
- [ ] Mirror the #69 blog features (Pagination, PostCard, PostNav, RelatedPosts, TableOfContents, tags/page routes) to `apps/site` as part of the post-design mirror sweep — deferred from Checkpoint 0; apps/site is a customized mirror, so this is judgment work, not copying.
- [ ] Accuracy sweep: scaffolded README/AGENTS.md claims match reality (known: starter `README.md` still describes the pre-#37 "layered CSS strategy").
- [ ] **MDX prose components** (top-tier blog polish): ship `src/components/mdx/` with `Callout`/admonition, `CodeBlock` (copy button + filename), and `Figure` (captioned image), wired into the blog/projects MDX render. First thing a stranger sees on a post — and it exercises the "components are the product" pitch. Tokens-only, no framework.
- [ ] **Blog search**: bring the docs template's proven Pagefind setup to the starter blog (index at build, search UI in the blog chrome). Search is table-stakes for top Astro templates; the docs side already does it, so this is reuse, not new ground.
- [ ] **Per-post OG images**: generate a per-post OG card via the existing claude-design banner pipeline (HTML → headless Chrome → PNG), replacing the single static `og-default.png` for posts. Stays inside the no-satori/@vercel/og rule because it uses the sanctioned pipeline. Lands with/after design (Checkpoint 1) since it reuses the banner CSS/tokens.
- [ ] **Docs MDX components** (Mintlify-parity — the docs template's product surface): ship `Steps`/`Step`, `CardGroup`, `CodeGroup` (tabbed code via the existing `<ai-tabs>` element), and `Frame` (captioned media) into `packages/templates/docs/src/components/docs/`, wired into the docs MDX render alongside the existing `Callout`/`CodeBlock`. These four are the components a stranger expects from a top-tier docs tool; all static, tokens-only, no framework. Add Shiki line-highlight/line-number transformers to `CodeBlock` while here. (`ParamField`/`ResponseField`/`Expandable` + Mermaid → post-launch; see ladder.)
- **Done when:** a stranger clicking two pages deep on starter./docs.astroignite.dev sees every advertised feature working.

### 2b. Registry — form atoms + shadcn-consumable (NEW for v1)

Two gaps that make the "shadcn-style CLI" claim aspirational rather than true.

- [ ] **Form atoms** (the credibility gap — "shadcn-style" with no form controls is a tell): add `select`, `checkbox`, `radio-group`, `switch` to `packages/registry` and both templates' `src/components/ui/`. Native HTML, no framework, tokens-only, a11y-clean. Refactor the starter contact form to consume them.
- [ ] **shadcn-schema-conformant, publicly consumable registry** (the headline shadcn-2025 move — see [CLI 3.0 / namespaces](https://ui.shadcn.com/docs/registry/namespace)): make `registry.json` conform to the shadcn 3.0 registry schema and emit per-item JSON (`/r/<name>.json`) at build, hosted on the site, so `npx shadcn@latest add @astro-ignite/<name>` copies an atom into _any_ project (shadcn's registry copies arbitrary files — it doesn't care the atoms are `.astro`). Namespace: `@astro-ignite`. This is the cheap on-ramp to the AI-native story too: shadcn's MCP server can already read a schema-conformant registry (the registry MCP server itself is 0.3.0).
- **Done when:** a stranger can `npx shadcn add @astro-ignite/button` into a blank project and get a working file; the starter contact form is built from the shipped form atoms.

### 3. Docs site ready

Today the docs site only answers "what is this?" — launch needs "how do I?".

- [ ] Six guides (closed list): theming/tokens (the showpiece), adding content, adding a locale, deploying (incl. contact form on static hosts), contact-form email setup, using components.
- [ ] Component reference: one page per registry item (23 UI items + cn — incl. the four new form atoms from Checkpoint 2b), each with live demo (`ComponentShowcase`), code example, props table, and "ships pre-installed; copy from the registry to use elsewhere". **No `add` command at launch** — wording must never imply one. Distill from the template `docs/` deep-dives where possible.
- [ ] Accuracy pass on the 7 existing pages.
- [ ] **AI-native docs surface** (the visible proof the docs are agent-first — all static, no backend): a per-page raw-Markdown route (`[...slug].md`), a `/llms-full.txt` full-content file alongside the existing `/llms.txt` index, and a contextual "**Copy as Markdown / View raw / Open in ChatGPT / Open in Claude**" menu in the doc header (deep-links carry the page URL as context). This is the launch-claim slice of the "build docs with AI agents" pitch; agentic Ask-AI search + MCP-from-docs stay on the ladder.
- [ ] English first; Spanish translated once content freezes (ES at launch, written last).
- **Done when:** the list above is checked. New page ideas go post-launch.

### 4. Templates AI-ready (skills)

Scaffolded output ships `.claude/skills/` so agents follow best practices.

- [ ] Starter skills: `add-blog-post`, `add-project`, `add-page` (creates the `[lang]/` parallel + nav + JSON-LD node), `add-locale`.
- [ ] Docs skills: `add-doc-page`, `add-locale`.
- [ ] Seventh skill: **`customize-theme`** — proceduralize the token-edit → full-reskin story (the theming guide in Checkpoint 3 is its companion showpiece). Resolves Open Decision #2. **Hard cap: 7.**
- **Acceptance test (the definition of "AI-ready"):** fresh scaffold → Claude Code cold, no extra context → one-line request per skill ("add a blog post about coffee") → result passes `pnpm typecheck && pnpm build` + relevant invariant audits, and renders in both locales when two are configured.

### 5. Template tooling complete

- [x] ESLint ships in both templates (a11y + better-tailwindcss plugins, `lint`/`lint:fix` scripts).
- [x] Formatting: ship prettier + `prettier-plugin-astro` config + `format`/`format:check` scripts in scaffolded output. Both templates ship `.prettierrc.json` + `.prettierignore` (the ignore mirrors the monorepo's parser-tripping inline-`<script>` components); `apps/site` / `apps/docs` mirror the config.
- [x] Verify a fresh scaffold passes `format:check` + `lint` clean with zero warnings (wired into `pnpm scaffold:test --full`; the CLI now emits single-quoted `site.ts` values so the rewrite stays Prettier-clean).
- [x] Closed the registry verification blind spot: `packages/registry` is now a workspace package with `lint`/`typecheck` scripts, and the `better-tailwindcss` canonical-class-order rules run on the atom source for real.
- **Door open** for one more tool if needed; test suite is explicitly 0.3.0, not now.

### 6. Stable release pipeline (LAUNCH REQUISITE)

Removed in May (`68ee3e8`) when publish was failing; restore from history.

- [ ] Restore `.github/workflows/release.yml`: changesets version-PR automation + publish behind manual `workflow_dispatch` (no auto-publish on merge). **PR #66 already implements this — rebase on main, review against these requirements, land it.**
- [ ] Fix the May failure (NPM_TOKEN / `Prod` environment / version-exists check — diagnose on restore).
- [ ] **Dry run early, not at launch:** flush the 21 pending changesets as a quiet pre-release to prove the pipeline, so the launch publish is routine.
- [ ] Launch version: **`0.2.0`**.
- **Done when:** a publish has succeeded end-to-end from CI at least once before launch week.

### 7. Launch QA + announce (the gate)

- [ ] **Stranger test:** clean machine, `npm create astro-ignite` from the _published_ package (not the workspace), following only public docs: scaffold → dev → customize → build → deploy. Every friction point is a blocker; nothing else found that week is.
- [ ] **Manual verify (automation deliberately looks away here):** the starter contact form end-to-end (Astro Actions flow — its e2e spec is permanently skipped, `tests/e2e/starter/contact.spec.ts`) and the docs built-site search (Pagefind WASM — `tests/e2e/docs-template-built/search-built.spec.ts` is permanently skipped). Both are headline features; both must be exercised by hand at launch QA.
- [ ] AI-ready cold-run (Checkpoint 4 acceptance) passes on the published package.
- [ ] One launch banner via the existing banner pipeline. No other launch assets.
- [ ] Announce, staggered: Astro Discord `#showcase` (soft launch, catch breakage) → X → Show HN.
- [ ] Post-launch backlog published as GitHub issues labeled `post-v1` — the visible roadmap is launch content.

---

## Version ladder (post-launch — the answer to "should I add this?")

| Version   | Theme                                             | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **0.2.0** | Launch                                            | Everything above. Nothing else.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **0.3.0** | More templates + customizability + AI-native docs | `blog` template (split from starter); `astro-ignite add <component>` command (the headline) + **registry MCP server** (agents browse/install atoms); scaffolded **test suite for agents to verify their changes**; registry blocks tier (PricingCard first); more atoms (`command`/⌘K palette, `breadcrumb`, pagination-as-atom). **AI-native docs:** an **MCP server generated from the docs** (an agent queries the site's content as a tool: search + fetch-page over the Pagefind index); a client-side **Ask-AI** mode in the ⌘K palette (RAG over the Pagefind index using the user's own model key — no backend, off by default); API-reference atoms (`ParamField`/`ResponseField`/`Expandable`); **Mermaid** diagrams (lazy-loaded only on pages that use them, perf-gated); and a **`docs.config.ts`** consolidation — one typed file for branding/colors/nav, the way Mintlify's `docs.json` is one file (and the obvious single surface for a `customize-theme`/`docs-nav` skill to edit). |
| **0.4.0** | Deploy customization in the CLI                   | Adapter/deploy-target selection at scaffold time (CF Pages / Netlify / Vercel / Node); deeper customization prompts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Later     | —                                                 | **View Transitions (Astro `<ClientRouter />`)** — deferred pending the zero-JS/Lighthouse trade-off (SEO-safe; cost is the perf pitch, plus Plausible pageview re-fire + theme re-apply on `astro:after-swap`); doctor/harness-in-templates; more blocks; examples gallery.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Explicitly cut from launch

- `blog-only` template → 0.3.0
- `astro-ignite add` (the native CLI command) → 0.3.0 (docs wording must not imply it exists). NOTE: the registry IS shadcn-consumable at launch via `npx shadcn add @astro-ignite/*` (Checkpoint 2b) — that's schema conformance + hosting, not a new command.
- Registry MCP server, `command`/⌘K palette, `breadcrumb` atom → 0.3.0
- Scaffolded test suite → 0.3.0
- Registry blocks / PricingCard → 0.3.0
- AI-native docs — agentic layer (**MCP-generated-from-docs**, in-page **Ask-AI** search), API-reference atoms (`ParamField`/`ResponseField`/`Expandable`), **Mermaid**, `docs.config.ts` consolidation → 0.3.0. NOTE: the cheap static slice — the four docs MDX components, per-page `.md`, `/llms-full.txt`, and the copy/open-in-AI menu — IS in launch (Checkpoints 2–3).
- Deploy customization → 0.4.0
- Doctor / AI harness in templates → later
- Any page, section, skill, or guide not named in a checkpoint list above

## Open decisions (settle when reached, not now)

1. Design blast radius — reskin / restyle / redesign (Checkpoint 1; restyle-with-fixed-page-list recommended).
2. ~~The seventh skill — which one, if any~~ — **RESOLVED: `customize-theme`** (Checkpoint 4).
3. Extra tooling beyond lint + format — only if a concrete need appears (Checkpoint 5).
4. ~~View Transitions (Astro `<ClientRouter />`) — include in v1?~~ — **RESOLVED: deferred post-launch** (version ladder, "Later"). SEO-safe, but trades against the zero-JS/Lighthouse pitch; revisit when the perf budget has headroom.
5. AI-native docs scope — how much of the Mintlify-style AI layer lands at launch. Recommended (and reflected above): the static/cheap slice in 0.2.0 (four docs MDX components, per-page `.md`, `/llms-full.txt`, copy/open-in-AI menu — each makes the "build docs with AI agents" claim demonstrably true and adds ~zero runtime cost); the agentic slice (MCP-from-docs, Ask-AI search) deferred to 0.3.0 since it needs a model key / generated artifact and shouldn't gate launch.

## Architecture & tech-debt (post-launch)

From an architecture review (the `improve-codebase-architecture` skill, 2026-06-06) —
"deepening" refactors that turn shallow, duplicated modules into deep, testable ones.
**None gate launch** — the cut rule holds, no launch claim depends on them. Recorded so
future architecture passes don't re-derive them; sequence after 0.2.0, opportunistically
when already touching the area.

- [x] **Consolidate Chrome detection** — `findChrome` was byte-duplicated in `scripts/perf/run.mjs` and `scripts/doctor/chrome-installed.mjs`; now one `scripts/lib/chrome.mjs` both import, so the graceful-skip contract has a single home. Shipped 2026-06-06 (#73).
- [ ] **Registry as the deep source for atoms** (highest leverage) — ~156 byte-identical atom files live across `packages/registry` + both templates + `apps/*` with no module owning them, and `registry.json`'s `registryDependencies` are read by nobody (`scaffold.ts` copies the template tree verbatim). Give the registry a `materialize()` step + a CI drift check so the copies are generated, not hand-maintained. **Build-time only** — the scaffolded output stays fully copied and owned (the shadcn-style, zero-runtime-dep invariant is non-negotiable). Natural companion to the 0.3.0 shadcn-consumable registry work (Checkpoint 2b).
- [ ] **Feature-rule table in `scaffold.ts`** — dep-stripping is hardcoded to email (`fileExists('src/lib/email/index.ts')`); replace with a declarative `{ detect, deps }` table so a new feature/template is one row. **Defer until the second rule exists** (e.g. "Actions ⇒ pin `@astrojs/node`") — one rule is a premature seam.
- [ ] **Test seam for the perf gate** — the build → boot → Lighthouse → compare → report pipeline (and the chrome-missing skip) is buried in a 166-line `main()` in `scripts/perf/run.mjs`; inject the spawn/Lighthouse I/O as ports so the skip and boot-failure paths are testable without spawning a real process.
- [ ] **Invariant registry behind the audit suite** — `scripts/audit/run-all.mjs` discovers per-change audits by regex-scraping design.md prose, and the invariant → audit mapping has no machine-readable home; add a `defineAudit()` harness + a registry (compiled from the `openspec/specs/<cap>/spec.md` tables) consumed by both run-all and doctor. Touches the harness itself — bigger blast radius; treat the registry half as speculative.
- **Not doing:** collapsing the i18n `[lang]/` parallel routes (~95% duplicate, ~660 LOC). Contradicts the locked `i18n-parallels` invariant — the parallel files are deliberate (per-page static routes + localized hreflang). Reopen that invariant first if the manual mirroring ever becomes a real maintenance drag.
