---
'astro-ignite': patch
'create-astro-ignite': patch
---

Templates now ship with an `AGENTS.md` (with a `CLAUDE.md` symlink) so scaffolded projects come pre-wired for AI agent collaboration. The scaffold copier was extended to preserve symlinks verbatim instead of dereferencing them into duplicate files.
