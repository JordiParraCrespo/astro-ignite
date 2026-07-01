# Astro Actions

The starter ships a working contact form built on Astro Actions — type-safe server-side form handlers with progressive enhancement. This guide covers the shipped implementation and how to extend it.

## How it works

Actions are defined in `src/actions/index.ts` and exported as `server`. Each action validates its input via Zod, then calls a side-effecting function (email, database, etc.):

```
Contact page form → POST → actions.contact → Zod validate → honeypot check → sendContactEmail()
```

The page reads the result with `Astro.getActionResult(actions.contact)` after render — no client JS required. The form element uses `action={actions.contact}` for native form posting with progressive enhancement.

## Adding a field to the contact form

**1. Extend the Zod schema in `src/actions/index.ts`:**

```ts
input: z.object({
  name: z.string().min(1).max(100),
  email: z.email().max(254),
  subject: z.enum(['general', 'support', 'feedback', 'partnership']).default('general'), // added 'partnership'
  message: z.string().min(10).max(5000),
  phone: z.string().max(20).optional(), // new field
  _website: z.string().max(0).optional(),
}),
```

**2. Pass the new field to `sendContactEmail` in the handler:**

```ts
handler: async (input) => {
  if (input._website && input._website.length > 0) {
    return { ok: true } as const;
  }
  await sendContactEmail({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    phone: input.phone, // pass through
  });
  return { ok: true } as const;
},
```

**3. Add the field to the email template in `src/lib/email/`** (update `ContactEmailInput` in `index.ts`, add to the email body).

**4. Add the input to `src/pages/contact.astro` and `src/pages/[lang]/contact.astro`** — both must stay in sync.

## Adding a new action

Actions require a server adapter (`@astrojs/node@^10` is pinned). Each action is an entry in the `server` map:

```ts
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';

export const server = {
  contact: defineAction({ /* ... existing ... */ }),

  subscribe: defineAction({
    accept: 'form',
    input: z.object({
      email: z.email().max(254),
      _website: z.string().max(0).optional(), // honeypot
    }),
    handler: async (input) => {
      if (input._website?.length) return { ok: true } as const;
      // call your newsletter API here
      await addToMailingList(input.email);
      return { ok: true } as const;
    },
  }),
};
```

Call it from a page:

```astro
---
import { actions } from 'astro:actions';
const result = Astro.getActionResult(actions.subscribe);
---

<form method="POST" action={actions.subscribe}>
  <input type="hidden" name="_website" value="" />
  <input type="email" name="email" required />
  <button type="submit">Subscribe</button>
</form>

{result?.data?.ok && <p>Subscribed!</p>}
{result?.error && <p>Something went wrong.</p>}
```

## Validation rules

- Always validate with Zod — never trust raw form data
- Keep the honeypot field (`_website: z.string().max(0).optional()`) in any public form
- Use `.min()` / `.max()` on every string field to guard against oversized payloads
- Use `z.enum()` for controlled choices rather than free strings

## Email provider seam

Actions that send email call the `sendContactEmail()` function from `src/lib/email/` — not Resend or SMTP directly. The seam pattern keeps adapters swappable:

```
src/lib/email/
├── index.ts       # ContactEmailInput type + sendContactEmail() — detection point for CLI
├── resend.ts      # Resend transport
└── smtp.ts        # Nodemailer SMTP transport
```

`index.ts` inspects `import.meta.env.RESEND_API_KEY` at runtime and routes to the appropriate transport. To switch providers, add a new transport file and update the routing condition in `index.ts`. The action handler doesn't change.

The CLI detects the presence of `src/lib/email/index.ts` to decide whether to keep the Resend and Nodemailer deps when scaffolding. Don't rename or remove that file.

## Switching email providers

**To Resend (already the default):** set `RESEND_API_KEY` in `.env`.

**To SMTP:** set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — the SMTP transport is already wired. Leave `RESEND_API_KEY` unset.

**To a third provider:** add `src/lib/email/mailgun.ts` (or similar), update `index.ts` to route to it based on an env var, and update the dep in `package.json`.

## Static deployments

Actions require a running server. If you want a fully static output (`output: 'static'` in `astro.config.mjs`), remove the adapter and remove the contact form action — replace with a third-party form provider (Formspree, Basin, etc.) or a mailto link.

## Error handling on the page

```astro
---
const result = Astro.getActionResult(actions.contact);
const hasError = result?.error != null;
const isSuccess = result?.data?.ok;
---

{isSuccess && <p role="alert">Message sent — I'll be in touch shortly.</p>}

{hasError && (
  <p role="alert">
    {result.error.code === 'INPUT_VALIDATION_ERROR'
      ? 'Please check your input.'
      : 'Something went wrong. Try again later.'}
  </p>
)}
```

Field-level errors are available via `result.error.fields`:

```astro
{result?.error?.fields?.email && (
  <span id="email-error">{result.error.fields.email.join(', ')}</span>
)}
```
