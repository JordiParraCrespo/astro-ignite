---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Astro 7.** Bump the template runtime to the latest Astro major.

Template runtime: `astro` ^6.3 → ^7.0, `@astrojs/node` ^10 → ^11 (the
adapter major that pairs with Astro 7), `@astrojs/mdx` ^5 → ^7,
`@astrojs/sitemap` ^3.7.2 → ^3.7.3. `@astrojs/rss` and `@astrojs/check`
were already current. The Node floor stays at `>=22.12.0`.

The explicit `vite` devDependency pin moves ^7.3.3 → ^8.0.13 to match
the Vite major Astro 7 depends on — keeping a single Vite instance and
avoiding the duplicate-Vite resolution the pin originally guarded against.

Applied across both templates (`starter`, `docs`), their generated CLI
copies, and the mirrored apps (`site`, `docs`, `playground`). The
`@astrojs/node@^11` adapter pin is now enforced by the
`cli-dep-stripping` invariant audit and the `cli-scaffold` spec.
