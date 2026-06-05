---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Tooling, testing, and AI-readiness.**

- **`llms.txt` AI-discoverability index** (both templates): a `pages/llms.txt.ts` endpoint serves `/llms.txt` per the [llmstxt.org](https://llmstxt.org) convention — site name, summary, and sectioned links to primary content, pulled from the same SEO copy the pages render so it can't drift. Single root file covering all locales; hreflang suffixes appear only when more than one locale is active.
- **`AGENTS.md` in scaffolded output** (with a `CLAUDE.md` symlink): scaffolded projects come pre-wired for AI-agent collaboration — stack snapshot, invariants, and route map. The scaffold copier now preserves symlinks verbatim.
- **Tailwind canonical-class lint gate**: `eslint-plugin-better-tailwindcss` wired into the workspace and both templates with three auto-fixable rules at `error` (`bg-[var(--color-bg)]` → `bg-(--color-bg)`, canonical class order, whitespace collapse). Semantic no-op (identical compiled CSS); `pnpm lint` gates the canonical form, `pnpm lint:fix` resolves drift. devDependency only.
- **Playwright e2e suite** (`tests/e2e/`, workspace-only — nothing is emitted into scaffolded projects): homepage console health, nav, theme-toggle persistence, LocaleSwitcher, consent-gated analytics, starter contact form with Resend network-blocked, docs sidebar + MDX + search, app mirrors, and a post-scaffold playground smoke. `pnpm test:e2e`.
