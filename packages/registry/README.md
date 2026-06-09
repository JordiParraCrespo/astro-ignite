# @astro-ignite/registry

The parts bin for astro-ignite. `base/*` are the atoms (Astro + vanilla JS,
tokens-only, zero framework runtime); `lib/*` are the helpers every atom leans
on (`cn`, `toast`). `registry.json` is the shadcn-style manifest.

These atoms ship **pre-installed** in the `starter` and `docs` templates
(copied into `src/components/ui/`), so a scaffolded project already owns them —
there's nothing to install to use them there.

## Consuming the atoms in any project (shadcn)

`registry.json` conforms to the [shadcn registry schema][schema], and the site
hosts one resolved item per atom at `https://astroignite.dev/r/<name>.json`
(emitted at build — see below). That makes every atom installable into _any_
project with the shadcn CLI under the `@astro-ignite` namespace.

Add the namespace to the consuming project's `components.json`:

```json
{
  "registries": {
    "@astro-ignite": "https://astroignite.dev/r/{name}.json"
  }
}
```

Then copy an atom in:

```bash
npx shadcn@latest add @astro-ignite/button
```

The CLI resolves `cn` transitively (it ships as `@astro-ignite/cn`), so
`button.astro` lands in `src/components/ui/` and `cn.ts` in `src/lib/` together.
Compound families (`card`, `tabs`, `accordion`, `dialog`, `dropdown-menu`,
`radio-group`) bring all of their parts. You own every copied line afterward —
there is no runtime dependency back on astro-ignite.

> shadcn copies arbitrary files, so it doesn't matter that the atoms are
> `.astro`. The target project just needs somewhere to put them.

## Building the hosted payloads

```bash
node scripts/build-registry.mjs --out <dir>   # default: dist/r
```

This reads `registry.json`, inlines each file's source as `content`, rewrites
internal dependencies to the namespaced form (`cn` → `@astro-ignite/cn`), and
writes one shadcn-conformant `registry-item` JSON per item plus a top-level
`registry.json` index. `apps/site` runs this at `pre(dev|build)` with
`--out public/r`, so the payloads are served from the deployed site.

`pnpm --filter @astro-ignite/registry test` asserts every `registry.json` item
has a corresponding emitted payload and that each is schema-shaped.

[schema]: https://ui.shadcn.com/docs/registry
