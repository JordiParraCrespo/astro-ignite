# Deploying

The docs template outputs **fully static HTML** — no server adapter required. `astro build` emits a `dist/` folder you can drop on any static host.

```bash
pnpm build    # → dist/ (Pagefind indexes content as postbuild)
pnpm preview  # preview with search working
```

## Static hosts

Point Cloudflare Pages, Netlify, Vercel, or GitHub Pages at `dist/`. Typical settings:

- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **Node version:** ≥ 22.12 (required by Astro 7)

That's it. No environment variables are required for a static docs site.

### Cloudflare Pages

Connect the repo in the Cloudflare dashboard. Set the build command and output directory above. Pages picks up `dist/` and deploys to its CDN automatically.

### Netlify

Use the Netlify UI or drop a `netlify.toml`:

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

### GitHub Pages

Add a workflow at `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
        id: deploy
```

Set your repo's Pages source to **GitHub Actions** in Settings → Pages.

## Adding server-rendered routes later

If you later add an Astro Action or a server-only route (e.g., a contact form), you'll need an adapter:

```bash
pnpm astro add netlify   # or vercel, cloudflare, node
```

Then update `adapter:` in `astro.config.mjs`. The static docs pages still pre-render; only the new server route adds a function.

## Before you ship

- Set `siteConfig.url` in `src/config/site.ts` to your production origin — it drives canonical URLs, the sitemap, and `robots.txt`.
- Re-run `pnpm build` locally first; it surfaces schema and type errors the host would otherwise fail on.
- Verify search works with `pnpm preview` — Pagefind runs as a postbuild step, so it only indexes after a full build.
