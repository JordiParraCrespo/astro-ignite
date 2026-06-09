---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Docs template: AI-native content surface.** A scaffolded docs site now exposes its content in agent-readable form, with zero backend and no new runtime deps:

- **Per-page raw Markdown.** Every doc page is also served at `<path>.md` (the default-locale home at `/index.md`, others mirroring their HTML path — `/quick-start.md`, `/es/quick-start.md`). MDX `import`/`export` noise is stripped so the output reads as clean Markdown.
- **`/llms-full.txt`.** The full text of every page concatenated into one file an agent can ingest in a single fetch — the companion to the existing `/llms.txt` link index.
- **"Use this page with AI" menu** in the doc header: _Copy as Markdown_ (same-origin fetch + clipboard), _View as Markdown_, and _Open in ChatGPT_ / _Open in Claude_ deep links that hand the page's `.md` URL over as context. Built from the popover API + vanilla JS, token-resolved, English + Spanish chrome strings.

Helpers live in `src/lib/docs-md.ts`; the routes are `src/pages/[...slug].md.ts` and `src/pages/llms-full.txt.ts`. All locale-aware — only `siteConfig.locales` are emitted, so the surface stays in lock-step with the rendered pages.
