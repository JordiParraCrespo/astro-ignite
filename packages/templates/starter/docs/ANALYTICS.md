# Analytics

The default analytics provider is **Plausible** — privacy-friendly, no cookies, no consent banner needed in the EU/UK. The component is env-gated and consent-gated so nothing fires until both your config and the user's choice align.

## Default behavior

`src/components/Analytics.astro`:

- Reads `PUBLIC_PLAUSIBLE_DOMAIN` from `.env`. If unset → renders nothing (zero perf cost).
- Reads `localStorage['cookie-consent']` (set by `<CookieBanner>`). Only injects the Plausible script when it equals `'accepted'`.
- Listens for the `consent-change` window event so accepting on the banner kicks in immediately without a page reload.

## Enable Plausible

1. Sign up at <https://plausible.io> (free tier: 10k pageviews/month).
2. Add your domain.
3. Set in `.env`:
   ```
   PUBLIC_PLAUSIBLE_DOMAIN=yoursite.com
   ```
4. Self-hosting Plausible CE? Also set:
   ```
   PUBLIC_PLAUSIBLE_HOST=https://your-instance.example.com
   ```

## Recipes

### Switch to Umami

Replace the body of `src/components/Analytics.astro`:

```astro
---
const websiteId = import.meta.env.PUBLIC_UMAMI_WEBSITE_ID;
const src = import.meta.env.PUBLIC_UMAMI_SRC ?? 'https://cloud.umami.is/script.js';
---

{
  websiteId && (
    <script is:inline define:vars={{ websiteId, src }}>
      {`(() => {
      const inject = () => {
        if (document.querySelector('script[data-website-id]')) return;
        const s = document.createElement('script');
        s.defer = true;
        s.dataset.websiteId = websiteId;
        s.src = src;
        document.head.appendChild(s);
      };
      const consent = localStorage.getItem('cookie-consent');
      if (consent === 'accepted') inject();
      window.addEventListener('consent-change', (e) => {
        if (e.detail === 'accepted') inject();
      });
    })();`}
    </script>
  )
}
```

Update `.env.example`:

```
PUBLIC_UMAMI_WEBSITE_ID=
# PUBLIC_UMAMI_SRC=https://your-self-hosted-umami.example.com/script.js
```

### Switch to Fathom

```astro
---
const siteId = import.meta.env.PUBLIC_FATHOM_SITE_ID;
---

{
  siteId && (
    <script is:inline define:vars={{ siteId }}>
      {`(() => {
      const inject = () => {
        if (document.querySelector('script[data-site]')) return;
        const s = document.createElement('script');
        s.defer = true;
        s.dataset.site = siteId;
        s.src = 'https://cdn.usefathom.com/script.js';
        document.head.appendChild(s);
      };
      const consent = localStorage.getItem('cookie-consent');
      if (consent === 'accepted') inject();
      window.addEventListener('consent-change', (e) => {
        if (e.detail === 'accepted') inject();
      });
    })();`}
    </script>
  )
}
```

### Switch to Vercel Analytics

Requires deploying on Vercel and the `@vercel/analytics` package:

```bash
pnpm add @vercel/analytics
```

```astro
---
import { Analytics } from '@vercel/analytics/astro';
---

<Analytics />
```

Vercel Analytics doesn't use cookies by default, so the consent gate isn't strictly required — but you can still wrap it the same way for parity.

### Add Google Analytics 4

⚠️ **Adding GA changes your legal posture.** GA uses cookies and collects personal data. You'll need:

- A consent banner that distinguishes "essential" from "analytics" cookies (the current banner is single-toggle — extend it).
- Updated privacy + cookies pages disclosing the GA cookies.
- Possibly Consent Mode v2 configuration.

Replace component body:

```astro
---
const measurementId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID;
---

{
  measurementId && (
    <script is:inline define:vars={{ measurementId }}>
      {`(() => {
      const inject = () => {
        if (window.gtag) return;
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', measurementId, { anonymize_ip: true });
      };
      const consent = localStorage.getItem('cookie-consent');
      if (consent === 'accepted') inject();
      window.addEventListener('consent-change', (e) => {
        if (e.detail === 'accepted') inject();
      });
    })();`}
    </script>
  )
}
```

Update legal pages and cookie banner copy accordingly.

### Multiple providers simultaneously

Just chain the inject logic in a single component, or import multiple:

```astro
<Analytics />
<!-- Plausible -->
<UmamiAnalytics />
<!-- separate component you create -->
```

Both gated by the same consent flag.

### Custom event tracking (Plausible)

Plausible exposes `window.plausible('eventName', { props: {...} })`. Use anywhere on the client:

```astro
<button onclick="plausible && plausible('Signup clicked')">Sign up</button>
```

For Umami: `window.umami.track('Signup clicked')`. For Fathom: `window.fathom.trackGoal('GOAL_ID', 0)`.

## Removing analytics entirely

1. Delete `<Analytics />` from `src/layouts/BaseLayout.astro`.
2. Delete `src/components/Analytics.astro`.
3. Remove `PUBLIC_PLAUSIBLE_*` from `.env.example`.
4. Update `src/content/legal/{locale}/cookies.mdx` to remove the analytics section.

The cookie banner still functions for any future tracking you add.
