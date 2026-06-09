---
'astro-ignite': patch
'create-astro-ignite': patch
---

**Starter: author MDX prose styling as a Tailwind `@utility` instead of a scoped `is:global` block.** The `.prose` rules that styled blog/project/legal slot content moved out of `ArticleLayout`'s `<style is:global>` into an `@utility prose` in `global.css`, so the shared base is declared once instead of leaking out of one layout, and `class="prose"` composes with variants. Element rules use `:where()` to keep specificity at the class level, so `LegalLayout`'s inline `[&_blockquote]:…` overrides still win. Removes the last MDX-prose `tailwind-exception`. No change to rendered output.
