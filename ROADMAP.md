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
5. shipped through a stable release pipeline as **`0.2.0`**, then announced.

**The cut rule:** a feature is in scope only if its absence makes a launch claim
false. Everything else goes to the version ladder at the bottom. The launch is
done when the stranger test passes — not when the ideas run out.

---

## Launch checkpoints (0.2.0)

### 0. Housekeeping (do first, small)

- [ ] Merge `feat/starter-blog-features` (reading time, prev/next, related, ToC, tags, pagination); mirror to `apps/site` where blog surfaces exist.
- [ ] Archive the 14 completed-but-unarchived changes so `pnpm queue` reflects reality; do not treat the current queue as truth.
- [ ] Rewrite `openspec/feature_list.json`: move `blog-only-template`, `registry-block-pricing-card`, `doctor-shipped-in-templates` to post-launch; add the checkpoints below as the new pending features so the harness builds the launch, not expansion.

### 1. Design — starter + docs (LAUNCH BLOCKER, in progress)

Designed in Claude Design. Owner: Jordi. Blast radius decision still open
(reskin vs restyle vs redesign) — to be settled when the design lands.

- [ ] Starter pages designed: home, blog index, blog post, projects, about, contact, 404.
- [ ] Docs pages designed: landing, doc page, search, 404.
- [ ] Design applied to `packages/templates/{starter,docs}` (tokens-first; honor the tokens-only + Tailwind-first invariants).
- [ ] Mirrors updated: `apps/site`, `apps/docs`.
- [ ] All gates stay green: `pnpm audit:invariants`, `pnpm perf:budget`, Lighthouse CI.
- **Done when:** every page on the list matches the Claude Design bundle. Pages/sections not on the list are post-launch.

### 2. Templates final ("the examples")

The deployed templates ARE the launch demo; every shipped feature must be visible.

- [ ] Demo content exercises the new blog features: enough posts to trigger pagination, overlapping tags, meaningful related posts (~5–6 posts; hero images via the banner pipeline — **after** design settles).
- [ ] Accuracy sweep: scaffolded README/AGENTS.md claims match reality (known: starter `README.md` still describes the pre-#37 "layered CSS strategy").
- **Done when:** a stranger clicking two pages deep on starter./docs.astroignite.dev sees every advertised feature working.

### 3. Docs site ready

Today the docs site only answers "what is this?" — launch needs "how do I?".

- [ ] Six guides (closed list): theming/tokens (the showpiece), adding content, adding a locale, deploying (incl. contact form on static hosts), contact-form email setup, using components.
- [ ] Component reference: one page per registry item (19 UI items + cn), each with live demo (`ComponentShowcase`), code example, props table, and "ships pre-installed; copy from the registry to use elsewhere". **No `add` command at launch** — wording must never imply one. Distill from the template `docs/` deep-dives where possible.
- [ ] Accuracy pass on the 7 existing pages.
- [ ] English first; Spanish translated once content freezes (ES at launch, written last).
- **Done when:** the list above is checked. New page ideas go post-launch.

### 4. Templates AI-ready (skills)

Scaffolded output ships `.claude/skills/` so agents follow best practices.

- [ ] Starter skills: `add-blog-post`, `add-project`, `add-page` (creates the `[lang]/` parallel + nav + JSON-LD node), `add-locale`.
- [ ] Docs skills: `add-doc-page`, `add-locale`.
- [ ] One reserved slot for a seventh skill (e.g. `customize-theme` if the design phase makes the token story crisp enough to proceduralize). **Hard cap: 7.**
- **Acceptance test (the definition of "AI-ready"):** fresh scaffold → Claude Code cold, no extra context → one-line request per skill ("add a blog post about coffee") → result passes `pnpm typecheck && pnpm build` + relevant invariant audits, and renders in both locales when two are configured.

### 5. Template tooling complete

- [x] ESLint ships in both templates (a11y + better-tailwindcss plugins, `lint`/`lint:fix` scripts).
- [ ] Formatting: ship prettier + `prettier-plugin-astro` config + `format` script in scaffolded output (currently missing).
- [ ] Verify a fresh scaffold passes `lint` clean with zero warnings.
- **Door open** for one more tool if needed; test suite is explicitly 0.3.0, not now.

### 6. Stable release pipeline (LAUNCH REQUISITE)

Removed in May (`68ee3e8`) when publish was failing; restore from history.

- [ ] Restore `.github/workflows/release.yml`: changesets version-PR automation + publish behind manual `workflow_dispatch` (no auto-publish on merge).
- [ ] Fix the May failure (NPM_TOKEN / `Prod` environment / version-exists check — diagnose on restore).
- [ ] **Dry run early, not at launch:** flush the 21 pending changesets as a quiet pre-release to prove the pipeline, so the launch publish is routine.
- [ ] Launch version: **`0.2.0`**.
- **Done when:** a publish has succeeded end-to-end from CI at least once before launch week.

### 7. Launch QA + announce (the gate)

- [ ] **Stranger test:** clean machine, `npm create astro-ignite` from the _published_ package (not the workspace), following only public docs: scaffold → dev → customize → build → deploy. Every friction point is a blocker; nothing else found that week is.
- [ ] AI-ready cold-run (Checkpoint 4 acceptance) passes on the published package.
- [ ] One launch banner via the existing banner pipeline. No other launch assets.
- [ ] Announce, staggered: Astro Discord `#showcase` (soft launch, catch breakage) → X → Show HN.
- [ ] Post-launch backlog published as GitHub issues labeled `post-v1` — the visible roadmap is launch content.

---

## Version ladder (post-launch — the answer to "should I add this?")

| Version   | Theme                            | Contents                                                                                                                                                                                             |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0.2.0** | Launch                           | Everything above. Nothing else.                                                                                                                                                                      |
| **0.3.0** | More templates + customizability | `blog` template (split from starter); `astro-ignite add <component>` command (the headline); scaffolded **test suite for agents to verify their changes**; registry blocks tier (PricingCard first). |
| **0.4.0** | Deploy customization in the CLI  | Adapter/deploy-target selection at scaffold time (CF Pages / Netlify / Vercel / Node); deeper customization prompts.                                                                                 |
| Later     | —                                | doctor/harness-in-templates, more blocks, examples gallery.                                                                                                                                          |

## Explicitly cut from launch

- `blog-only` template → 0.3.0
- `astro-ignite add` → 0.3.0 (docs wording must not imply it exists)
- Scaffolded test suite → 0.3.0
- Registry blocks / PricingCard → 0.3.0
- Deploy customization → 0.4.0
- Doctor / AI harness in templates → later
- Any page, section, skill, or guide not named in a checkpoint list above

## Open decisions (settle when reached, not now)

1. Design blast radius — reskin / restyle / redesign (Checkpoint 1; restyle-with-fixed-page-list recommended).
2. The seventh skill — which one, if any (Checkpoint 4).
3. Extra tooling beyond lint + format — only if a concrete need appears (Checkpoint 5).
