---
name: new-template
description: Add a new astro-ignite template variant under packages/templates/<kind>/. Use when the user wants to add a template (landing, blog-only, portfolio, marketing, e-commerce, etc.), create a sibling to starter or docs, or asks to "build a template for X" within this monorepo. Walks the locked-practices audit checklist so the new template doesn't ship with i18n / legal / locale-switcher gaps the way the docs template originally did.
---

# Adding a new template to astro-ignite

This skill is the canonical procedure for adding a new template (e.g. `landing`, `blog-only`, `marketing`, `portfolio`) to `packages/templates/<kind>/` and wiring it through the CLI + CI.

**Trigger this skill when** the user says any of: "build a template for X", "add a `<kind>` template", "create a sibling to starter/docs", "scaffold a new template variant".

**Read this whole file before starting** — the audit checklist at the bottom is non-negotiable. Skipping it produces templates with i18n holes (which is exactly what happened to the docs template the first time).

---

## 0. Confirm the kind + shape

Before writing any files, confirm with the user:

- **Name** — the directory (`packages/templates/<name>/`) and CLI option (`--template=<name>`). Lowercase, single word, no hyphens unless necessary.
- **Audience** — who runs this? Marketing/SaaS/e-commerce/personal/etc.
- **What's unique** — what shape distinguishes it from `starter` and `docs`? Single-page? Heavy blog? Sidebar-driven? Catalog-driven?
- **What's NOT in it** — be explicit about what the template DROPS from starter (e.g. landing has no blog, no projects, no contact form).
- **Existing templates to fork from** — `starter` is the most-complete reference; `docs` is the lightest. New templates usually start from `starter` and trim.

**Don't proceed without these answers.** Ambiguity here causes the cuts to be wrong, and trimming retroactively is more painful than trimming up-front.

---

## 1. Create the directory

```bash
mkdir -p packages/templates/<kind>
cd packages/templates/<kind>
```

The structure must mirror the other templates exactly:

```
packages/templates/<kind>/
├── package.json
├── astro.config.mjs
├── tsconfig.json
├── _gitignore                  # renamed to .gitignore at scaffold time
├── _template.config.ts          # CLI metadata (conditionals + placeholders)
├── .env.example
├── public/                      # favicon, manifest, robots, og default, icons
└── src/
    ├── config/site.ts
    ├── content.config.ts        # Zod-typed collections
    ├── content/<collection>/<locale>/...   # bilingual seed content
    ├── i18n/{en.json, es.json, index.ts}
    ├── styles/global.css
    ├── components/{seo, image}/...
    ├── lib/{jsonld, image}/...
    ├── layouts/...
    └── pages/...
```

---

## 2. Copy shared infrastructure from `starter`

Every template uses the same SEO, JSON-LD, image, theme, font, brand, and analytics infrastructure. Copy it verbatim — don't fork.

```bash
SRC=packages/templates/starter
DST=packages/templates/<kind>

mkdir -p $DST/src/components/seo $DST/src/components/image \
         $DST/src/lib/jsonld $DST/src/lib/image \
         $DST/src/i18n $DST/src/styles \
         $DST/public/og

cp $SRC/src/styles/global.css       $DST/src/styles/global.css
cp $SRC/src/i18n/en.json            $DST/src/i18n/en.json
cp $SRC/src/i18n/es.json            $DST/src/i18n/es.json
cp $SRC/src/i18n/index.ts           $DST/src/i18n/index.ts
cp $SRC/src/components/Brand.astro          $DST/src/components/Brand.astro
cp $SRC/src/components/Analytics.astro      $DST/src/components/Analytics.astro
cp $SRC/src/components/CookieBanner.astro   $DST/src/components/CookieBanner.astro
cp $SRC/src/components/ThemeToggle.astro    $DST/src/components/ThemeToggle.astro
cp $SRC/src/components/LocaleSwitcher.astro $DST/src/components/LocaleSwitcher.astro
cp $SRC/src/components/seo/SEO.astro        $DST/src/components/seo/SEO.astro
cp $SRC/src/components/seo/JsonLd.astro     $DST/src/components/seo/JsonLd.astro
cp $SRC/src/components/image/Image.astro    $DST/src/components/image/Image.astro
cp $SRC/src/components/image/HeroImage.astro $DST/src/components/image/HeroImage.astro
cp -r $SRC/src/lib/jsonld/.                 $DST/src/lib/jsonld/
cp $SRC/src/lib/image/blur.ts                $DST/src/lib/image/blur.ts
cp $SRC/public/favicon.svg                   $DST/public/favicon.svg
cp $SRC/public/manifest.webmanifest          $DST/public/manifest.webmanifest
cp $SRC/public/robots.txt                    $DST/public/robots.txt
cp $SRC/public/apple-touch-icon.png          $DST/public/apple-touch-icon.png
cp $SRC/public/icon-192.png                  $DST/public/icon-192.png
cp $SRC/public/icon-512.png                  $DST/public/icon-512.png
cp $SRC/public/icon-maskable.png             $DST/public/icon-maskable.png
cp $SRC/public/og/og-default.png             $DST/public/og/og-default.png
cp $SRC/_gitignore                           $DST/_gitignore
```

If the new template needs the legal pages (most do — the cookie banner links to `/legal/cookies`), also:

```bash
mkdir -p $DST/src/content/legal/en $DST/src/content/legal/es
cp $SRC/src/content/legal/en/*.mdx $DST/src/content/legal/en/
cp $SRC/src/content/legal/es/*.mdx $DST/src/content/legal/es/
cp $SRC/src/layouts/LegalLayout.astro $DST/src/layouts/LegalLayout.astro
```

If the template ships a contact form, also copy `src/lib/email/*` and `src/actions/index.ts`.

---

## 3. Author the template-specific code

This is what makes the new template _the new template_:

- **`package.json`** — name `@astro-ignite/template-<kind>`, version `0.0.0`, private. Drop unused deps (e.g. landing might drop `@astrojs/rss`, `markdown-it`, `sanitize-html` if no blog).
- **`astro.config.mjs`** — adapter (`@astrojs/node` only if there are server endpoints; landing/blog-only might be `output: 'static'` without an adapter), sitemap config, fonts.
- **`tsconfig.json`** — copy from any existing template; identical.
- **`src/config/site.ts`** — extends the standard `SiteConfig` interface. Add template-specific fields here (e.g. docs has `defaultTheme` and `homePath`).
- **`src/content.config.ts`** — declare only the collections this template needs.
- **`src/layouts/`** — `BaseLayout.astro` (chrome) + at least one specialized layout if the template has a distinct page shape.
- **`src/pages/`** — routes per the template's information architecture.
- **`_template.config.ts`** — conditionals + placeholders + dependencies. Copy the docs template's version as a starting point; trim if the new template has no email/contact form.

---

## 4. Bilingual seed content (NON-NEGOTIABLE)

Every collection ships with at least `en/` AND `es/` seed entries. This is a locked principle — one i18n code path, demonstrable on day one.

```
src/content/<collection>/en/<slug>.mdx
src/content/<collection>/es/<slug>.mdx
```

Same `<slug>` across locales. Spanish translations don't have to be exhaustive but must be real (not Lorem Ipsum).

---

## 5. Locale-aware routing

For every dynamic-route page in `src/pages/`:

- **Default-locale route** at `src/pages/[...slug].astro` (or whatever the path shape is) — filters `e.id.startsWith(\`${siteConfig.defaultLocale}/\`)`.
- **Parallel route** at `src/pages/[lang]/[...slug].astro` — generates paths for every locale in `siteConfig.locales` EXCEPT the default.

Example pattern (use as a starting point):

```ts
// src/pages/[...slug].astro — default locale
export async function getStaticPaths() {
  const entries = await getCollection(
    'docs',
    (e) => !e.data.draft && e.id.startsWith(`${siteConfig.defaultLocale}/`)
  );
  return entries.map((entry) => ({
    params: { slug: entry.id.split('/').slice(1).join('/') },
    props: { entry },
  }));
}
```

```ts
// src/pages/[lang]/[...slug].astro — non-default locales
export async function getStaticPaths() {
  const entries = await getCollection('docs', (e) => !e.data.draft);
  return entries.flatMap((entry) => {
    const segments = entry.id.split('/');
    const lang = segments[0]!;
    if (lang === siteConfig.defaultLocale) return [];
    if (!siteConfig.locales.includes(lang)) return [];
    return [{ params: { lang, slug: segments.slice(1).join('/') }, props: { entry } }];
  });
}
```

Include parallels for static pages too (about, contact, etc.) in templates that ship them.

---

## 6. Register the template in the CLI

Three small edits in `packages/create-astro-ignite/src/types.ts`:

```ts
export type TemplateKind = 'starter' | 'docs' | '<kind>'; // add to union
export const TEMPLATE_KINDS: TemplateKind[] = ['starter', 'docs', '<kind>'];
export const TEMPLATE_LABELS: Record<TemplateKind, string> = {
  starter: 'Starter — marketing site with blog, projects, contact, legal',
  docs: 'Docs — Starlight-style 3-column documentation site',
  '<kind>': '<Label> — <one-line description>',
};
```

Then in `packages/create-astro-ignite/src/prompts.ts`, find the `select` call for the template prompt and add a new option:

```ts
{ value: '<kind>', label: '<Label>', hint: TEMPLATE_LABELS['<kind>'] },
```

Rebuild the CLI: `pnpm --filter create-astro-ignite build`.

---

## 7. Wire CI

Edit `.github/workflows/ci.yml`:

- Add a `pnpm --filter @astro-ignite/template-<kind> typecheck` step in the `lint-typecheck` job.
- Add `<kind>` to the `template-build` matrix.

Edit `.changeset/config.json` `ignore` list to include `@astro-ignite/template-<kind>` (templates aren't separately published — they ship inside the CLI).

Edit root `package.json` to add a `dev:<kind>` script:

```json
"dev:<kind>": "pnpm --filter @astro-ignite/template-<kind> dev"
```

---

## 8. Walk the audit checklist (THE IMPORTANT PART)

Before declaring the template ready, verify each item. **Do not skip.** This is the checklist the docs template failed on first pass.

### Locked-practices audit

1. ☐ **Per-locale folders for every content collection.** `src/content/<collection>/{locale}/...` with seed in BOTH `en/` and `es/`.
2. ☐ **Default-locale route filters by locale.** `e.id.startsWith(\`${defaultLocale}/\`)` on every dynamic page.
3. ☐ **`[lang]/[...slug]` parallel route exists** for every dynamic page (not just blog/docs collections — also static pages).
4. ☐ **`<LocaleSwitcher />` is visible in the chrome.** Whatever the chrome is (Nav, sidebar, toolbar), find a spot.
5. ☐ **Cookie banner has a working policy link.** If `<CookieBanner />` is in the layout, `/legal/cookies` must exist (legal collection + page renderer + `LegalLayout`).
6. ☐ **`getRelativeLocaleUrl` for all internal links.** Sidebar / breadcrumbs / prev-next / footer links / page-to-page navigation. No hardcoded `/${slug}`.
7. ☐ **Hide nav/sidebar items when the localized entry doesn't exist.** Don't ship links that 404.
8. ☐ **`siteConfig.defaultOgImage` accepts `string | Record<string, string>`.** Even if shipping a single PNG, the type must allow per-locale.
9. ☐ **JSON-LD via `<JsonLd schemas={[...siteSchemas(locale), ...]} />`.** `BaseLayout` merges site-wide schemas; pages add their own.
10. ☐ **Above-the-fold uses scoped `<style>`; below-the-fold uses Tailwind.** Layered CSS strategy.
11. ☐ **Anti-flash inline theme script in `<head>`.** Default-dark or default-light per `siteConfig.defaultTheme`.
12. ☐ **No React/Vue/Svelte runtime.** Vanilla `<script>` blocks for interactivity. `npx astro add react` is one user command if they want islands.
13. ☐ **Geist Sans + Geist Mono via `astro:fonts`.** Display preloaded, mono not. Bunny provider, latin + latin-ext subsets.
14. ☐ **Cursor `>_` brand mark via `<Brand />`.** No ad-hoc `<span>siteName</span>` in the chrome.
15. ☐ **Sitemap config has `i18n` block.** Hreflang per URL.

If any item fails, fix before continuing.

---

## 9. Verify

```bash
pnpm install                                              # picks up the new workspace package
pnpm --filter @astro-ignite/template-<kind> exec astro check
pnpm --filter @astro-ignite/template-<kind> build
pnpm --filter create-astro-ignite build
pnpm --filter create-astro-ignite test                    # CLI tests still green

# E2E smoke: scaffold a fresh project from the new template
mkdir -p /tmp/test-<kind>
node packages/create-astro-ignite/dist/index.js /tmp/test-<kind> --yes --no-install --no-git --template=<kind>
ls /tmp/test-<kind>/                                      # eyeball the output
```

If everything's clean, the template is ready.

---

## 10. Summarize for the user

When done, report:

- New template at `packages/templates/<kind>/` (file count)
- Registered in CLI as `--template=<kind>`
- CI configured for typecheck + build + e2e
- Audit checklist passed (call out any items that needed special handling)
- Dev command: `pnpm dev:<kind>`

If any audit item was deliberately skipped (e.g. a single-page landing template legitimately doesn't need `[lang]/<slug>` parallels because it's one page), call that out explicitly and explain why.

---

## Reference: how the existing templates compare

| Practice                | starter                                                                        | docs                                        |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| Pages                   | home, about, contact, blog (index + slug), projects (index + slug), legal, 404 | redirect, [...slug] (docs renderer), legal  |
| Collections             | blog, projects, authors, legal                                                 | docs, legal                                 |
| Layouts                 | BaseLayout, ArticleLayout, ProjectLayout, LegalLayout                          | BaseLayout, DocsLayout, LegalLayout         |
| Server-side             | Astro Action for contact form (`@astrojs/node` adapter)                        | none (pure static)                          |
| Default theme           | dark (`:root` defaults)                                                        | light (`siteConfig.defaultTheme = 'light'`) |
| Chrome shape            | top Nav + Footer                                                               | left Sidebar + per-page toolbar             |
| LocaleSwitcher location | inside `Nav.astro`                                                             | DocsLayout toolbar (next to ThemeToggle)    |
| RSS                     | per-locale, blog only                                                          | none                                        |
| OG image                | brand-aligned PNG                                                              | brand-aligned PNG (same)                    |

Use this table to decide what your new template inherits, drops, or replaces.
