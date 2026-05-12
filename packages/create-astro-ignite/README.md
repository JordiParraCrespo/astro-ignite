# create-astro-ignite

![astro-ignite banner](https://raw.githubusercontent.com/JordiParraCrespo/astro-ignite/main/assets/banners/banner.png)

> Astro sites, built for AI agents.

```bash
npm create astro-ignite@latest my-site
```

This package is a thin shim around the primary CLI [`astro-ignite`](https://www.npmjs.com/package/astro-ignite). Its only job is to support the `npm create X@latest` UX. Under the hood it runs `npx astro-ignite@latest bootstrap` with the same arguments.

For the full CLI docs, options, and templates, see the [`astro-ignite`](https://www.npmjs.com/package/astro-ignite) package.

## Equivalent commands

```bash
npm create astro-ignite@latest my-site
# is the same as
npx astro-ignite@latest bootstrap my-site
```

If you've already run the bootstrap once, prefer `npx astro-ignite ...` directly — it's the same CLI, but with subcommands like `bootstrap`, and future commands (`add`, `upgrade`, …).

## License

MIT.
