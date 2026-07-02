# design-fetch Boundary

A small CLI that pulls a claude-design bundle from a URL into a local
directory. Used by the banner pipeline to keep `apps/site/scripts/banners/`
in sync with the design system.

## Public Contracts

- **Spec:** `openspec/specs/banner-pipeline/spec.md` (the banner pipeline
  is the only consumer of design-fetch today)
- **CLI entry:** `node packages/design-fetch/dist/index.js <design-url>
--out <dir>` (default `--out` is `./design` if omitted). Alternate form:
  `--file <path>` extracts an already-downloaded `.tar.gz` instead of
  fetching. `--force` overwrites a non-empty output directory.
- **Auth:** the Claude Design API is gated — set `ANTHROPIC_API_KEY` in
  the environment or pass `--api-key <key>`. Without one of these, the
  fetch fails with a 401/403/404 hint pointing at `--file` as the
  fallback.
- **Output shape:** the extracted bundle contains `tokens.css`,
  `astro-ignite/project/Banners.html` (the authoritative banner
  prototype), and Geist woff2 files.

## Boundary Rules

- design-fetch is a build-time / dev-time tool. No template ships a
  runtime dependency on it.
- The bundle URL is not committed; it's passed at invocation time.
- The output dir is **transient** (typically `/tmp/claude-design`). The
  files that matter for the repo are copied into
  `apps/site/scripts/banners/` deliberately; design-fetch never writes
  there.

## Expanding The Boundary

- Adding a new artifact type to the bundle → document the new path
  shape in this file and in `openspec/specs/banner-pipeline/spec.md`.
- Adding a non-banner consumer → confirm the tool fits a one-shot
  fetch model; if not, introduce a new package rather than overload
  this one.
- Drift: when Astro re-hashes Geist after a build, the banner pipeline
  needs the new woff2. `pnpm doctor` (geist-fonts check) detects
  this and surfaces a copy-pasteable fix.
