# Actions

Server actions (Astro Actions). `index.ts` defines the `server` action
map — the contact form is the shipped example.

## How it works

- Each action validates input with a **Zod** schema, then calls the
  email provider seam at `src/lib/email/`. The client calls it via
  `astro:actions` (`actions.<name>`).
- **Actions require a server adapter.** This template pins
  `@astrojs/node@^11` in `astro.config.mjs` (the adapter major for
  Astro 7). Swap the adapter for another deploy target, but keep one.
- The email deps (`resend` / `nodemailer`) are template-specific: the
  CLI strips them when `src/lib/email/index.ts` is absent, so a template
  without Actions ships none of this.

## Rules

- Validate every action input with Zod; never trust raw form data.
- Keep provider details behind `src/lib/email/` — actions call the seam,
  not Resend/SMTP directly.
- If you add an action that sends mail, route it through the same seam so
  the CLI's dep-stripping stays correct.
