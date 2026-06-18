# Contact form

The contact form is wired end-to-end: Astro Actions handle validation, an email transport delivers to your inbox, and a honeypot field filters bots. No third-party form service required.

## How it works

`src/actions/index.ts` defines the `contact` action. It:

1. Validates input with Zod (`name`, `email`, `subject`, `message`).
2. Checks the honeypot field `_website` — bots fill it, humans leave it blank. If filled, the action returns success silently without sending.
3. Calls `sendContactEmail()` from `src/lib/email/`, which dispatches to whichever provider is configured.

The form at `src/pages/contact.astro` posts directly to the action via `<form action={actions.contact}>`. Astro handles progressive enhancement — the form works with JavaScript disabled.

## Environment variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

### Resend (default)

```
RESEND_API_KEY=re_...         # required in production
CONTACT_TO_EMAIL=you@example.com  # where submissions land

# Optional — defaults to onboarding@resend.dev (good for testing)
RESEND_FROM=hello@yourdomain.com
```

Sign up at [resend.com](https://resend.com) — free tier covers 3,000 emails/month, 100/day.

> **From address:** Resend requires your `from` domain to be verified before you can send from it. During development `onboarding@resend.dev` works immediately without verification.

### SMTP

If you chose SMTP at scaffold time:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587           # 587 (STARTTLS) or 465 (SSL)
SMTP_USER=user@example.com
SMTP_PASS=your-password
SMTP_FROM=hello@example.com
CONTACT_TO_EMAIL=you@example.com
```

Port 587 with STARTTLS is the default; port 465 enables implicit SSL automatically.

## Dev mode behavior

In development, missing env vars don't cause errors — the transport logs the would-be email payload to the terminal:

```
📧 [astro-ignite] RESEND_API_KEY or CONTACT_TO_EMAIL not set — would have sent:
{ name: 'Test', email: 'test@example.com', ... }
```

The form succeeds from the user's perspective, so you can iterate on the UI without any email account. In production, missing vars throw so misconfiguration fails loudly.

## Swapping email providers

### Resend → SMTP

1. Install the SMTP deps:
   ```bash
   pnpm add nodemailer
   pnpm add -D @types/nodemailer
   ```
2. In `src/lib/email/index.ts`, change the import:
   ```ts
   import { sendContactEmail as send } from './smtp';  // was ./resend
   ```
3. Update `.env` with `SMTP_*` vars.

### SMTP → Resend

The reverse: revert the import to `./resend`, remove the nodemailer deps, set `RESEND_API_KEY`.

### Custom provider

Create `src/lib/email/custom.ts` implementing:

```ts
export async function sendContactEmail(input: ContactEmailInput): Promise<void> {
  // your transport
}
```

Then point `src/lib/email/index.ts` at it.

## Customizing validation

Edit the Zod schema in `src/actions/index.ts`:

```ts
input: z.object({
  name: z.string().min(1).max(100),
  email: z.email().max(254),
  subject: z.enum(['general', 'support', 'feedback']).default('general'),
  message: z.string().min(10).max(5000),
  _website: z.string().max(0).optional(),  // honeypot — keep this
}),
```

If you add new fields, also add matching `<input>` elements to the form in `src/pages/contact.astro` and `src/pages/[lang]/contact.astro`.

## Removing the contact form

1. Delete `src/actions/index.ts` and `src/actions/` if empty.
2. Delete `src/lib/email/`.
3. Delete `src/pages/contact.astro` and `src/pages/[lang]/contact.astro`.
4. Remove the nav link to `/contact` from `src/components/common/Header.astro` and any locale-aware mirrors.
5. In `package.json`, remove `resend` (or `nodemailer`/`@types/nodemailer`) from dependencies.
6. In `astro.config.mjs`, the `@astrojs/node` adapter is still needed if you have other server-rendered routes. If contact was the only Action, you can switch to `output: 'static'` and drop the adapter.
7. Remove `RESEND_API_KEY`, `RESEND_FROM`, `SMTP_*`, and `CONTACT_TO_EMAIL` from `.env` and `.env.example`.
