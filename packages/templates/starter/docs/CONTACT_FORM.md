# Contact form & email

The starter ships a working contact form — validated, spam-screened, and wired to an email provider. In dev it logs to the console; in production it sends real mail once you set a few env vars. Nothing is mocked.

## The flow

The form is an **Astro Action**, defined in `src/actions/index.ts`:

```ts
export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1).max(100),
      email: z.email().max(254),
      message: z.string().min(10).max(5000),
      _website: z.string().max(0).optional(), // honeypot
    }),
    handler: async (input) => {
      if (input._website) return { ok: true }; // bot — silently drop
      await sendContactEmail(input);
      return { ok: true };
    },
  }),
};
```

What happens on submit:

1. The page posts straight to the action: `<form method="post" action={actions.contact}>`. Astro handles progressive enhancement.
2. **Zod validates** name / email / message; invalid input returns a typed error the page renders inline.
3. The **honeypot** `_website` field (hidden from humans, irresistible to bots) short-circuits with a silent success.
4. Valid input is handed to `sendContactEmail` — the provider seam in `src/lib/email/`.
5. The page reads the outcome with `Astro.getActionResult(actions.contact)` and shows success or error.

> **Actions need a server.** The action runs server-side, so the starter pins the `@astrojs/node` adapter. On Cloudflare / Netlify / Vercel, swap the adapter so it deploys as a function — see [`DEPLOYING.md`](./DEPLOYING.md).

## The email seam

`src/lib/email/index.ts` re-exports one provider's `sendContactEmail`. The CLI writes the right import based on the provider you pick at scaffold time:

- **Resend** (default) → `./resend.ts`
- **SMTP** → `./smtp.ts`
- **None** → a console logger that prints submissions with a "configure your provider" warning

Switch providers any time by editing that one import. Because the action only knows the seam, nothing downstream changes.

## Environment variables

Copy `.env.example` to `.env` and fill in what your provider needs. **Local dev works with none of these set** — submissions log to the console.

### Resend

```bash
RESEND_API_KEY=re_xxxxxxxx     # from resend.com
CONTACT_TO_EMAIL=you@example.com
```

### SMTP

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=postmaster@example.com
SMTP_PASS=••••••••
SMTP_FROM="Acme <hello@example.com>"
CONTACT_TO_EMAIL=you@example.com
```

`CONTACT_TO_EMAIL` is where submissions are delivered, regardless of provider. Set env vars in your host's dashboard or runtime environment — never commit them to the repo.

## Customizing

- **Add a field** → extend the Zod `input` schema in `src/actions/index.ts` and add the matching `<input>` to `src/pages/contact.astro`. The type flows through automatically.
- **Change the email body** → edit `src/lib/email/resend.ts` (or `smtp.ts`).
- **Stronger spam protection** is intentionally left out — the honeypot covers the basics. Add Cloudflare Turnstile or hCaptcha if you need more.
- **Remove the form entirely** → delete `src/pages/contact.astro`, `src/pages/[lang]/contact.astro`, `src/actions/index.ts`, and `src/lib/email/`. Remove the `@astrojs/node` adapter if you don't need server rendering for anything else.
