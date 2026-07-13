# Legal

> ⚠️ **Important:** the legal page templates that ship with this site are a starting point, **not legal advice.** They're modeled on common GDPR/CCPA structure but every business has different obligations. **Review with a lawyer in your jurisdiction before publishing.**

## What ships

Three legal pages, available in every locale:

```
src/content/legal/
  en/
    privacy.mdx       # Privacy Policy
    terms.mdx         # Terms of Service
    cookies.mdx       # Cookie Policy
  es/
    privacy.mdx
    terms.mdx
    cookies.mdx
```

Routes: `/legal/privacy`, `/legal/terms`, `/legal/cookies` (default locale) and `/<locale>/legal/...` for others.

Footer links to all three automatically.

The cookie banner links to `/legal/cookies` for "Read our cookie policy."

## Placeholders to fill

Each MDX file contains placeholder text in square brackets:

- `[YOUR COMPANY NAME]`
- `[YOUR JURISDICTION]` — e.g. "Spain", "California, United States"
- `[YOUR EMAIL]` — your contact email
- `[YOUR ADDRESS]` — physical/postal address (required in some jurisdictions)
- `[YOUR ANALYTICS PROVIDER]` — Plausible / Umami / Fathom / etc.

Search-and-replace these once.

## What the templates assume

- You operate a documentation website, not a SaaS app with user accounts.
- You do not collect contact form submissions (this template has no contact form).
- You use one analytics tool (or none).
- You're either GDPR-applicable, CCPA-applicable, or both.

If your situation is different — selling products, processing payments, providing user accounts, integrating with N other tools — **you need to expand the templates substantially or have a lawyer draft from scratch.**

## What's deliberately not in the templates

- **Specific consent mechanisms** for advertising, retargeting, or third-party social embeds.
- **DPA (Data Processing Agreement) text** — that's between you and your processors, not a public page.
- **Specific minor protections** beyond a baseline "not directed at children under 16."
- **Industry-specific disclosures** (HIPAA, FERPA, COPPA, financial services, etc.).
- **Local-law specifics** — Brazilian LGPD, Australian Privacy Act, Canadian PIPEDA, etc., have nuances the template doesn't cover.

## When to update

You **MUST** update the legal pages whenever you:

- Add a new tool that uses cookies, tracking, or processes personal data (e.g., Stripe, Mailchimp, Hotjar, Intercom).
- Change analytics providers.
- Start collecting new data types (e.g., if you add user accounts, payment info, location).
- Operate in a new jurisdiction.
- Receive a complaint or request from a regulatory authority.

Update the `lastUpdated` date in each page's frontmatter when you do.

## Removing legal pages

If you really don't want them (internal tools, prototypes):

1. Delete `src/content/legal/` entirely (or just specific MDX files).
2. Remove the legal section from `src/components/common/Footer.astro`.
3. Remove the policy link from `src/components/legal/CookieBanner.astro`.
4. Remove `<CookieBanner />` from `src/layouts/BaseLayout.astro` if you don't want any tracking gate at all.

⚠️ For any **public-facing site** that uses analytics or processes personal data (even just IP addresses via server logs), you almost certainly need at least a privacy policy. Don't remove without thinking about it.

## Adding a new legal page

For any extra (e.g., "Acceptable Use", "DMCA"):

1. Add `src/content/legal/<locale>/<slug>.mdx` with the same frontmatter shape (title, description, lastUpdated, version).
2. Add the link to `legalLinks` array in `src/components/common/Footer.astro`.

The route renderer (`src/pages/legal/[...slug].astro`) handles the rest automatically.

## Adding a new locale

For each new locale:

1. Translate `src/content/legal/en/*.mdx` → `src/content/legal/<locale>/*.mdx`.
2. The `[...slug]` page renderer auto-handles the routes.
3. **Translate the placeholders too** (`[YOUR COMPANY NAME]` etc. — different idiom per language).

The `[lang]` renderer at `src/pages/[lang]/legal/[...slug].astro` is already generic — its `getStaticPaths` scans the `legal` collection and emits routes for every locale in `siteConfig.locales`. You don't need to create or edit that file; adding a locale here only means adding the translated MDX content.

## Liability disclaimer

The astro-ignite template language is provided **as is, without warranty of any kind**. Using these templates does not establish an attorney-client relationship with the project maintainers. The maintainers are not lawyers. **Consult qualified legal counsel for your specific situation before publishing any legal page.**
