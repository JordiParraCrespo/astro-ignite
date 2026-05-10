/**
 * Resend transport for the contact form.
 *
 * Behavior:
 *   - In dev (or any env where RESEND_API_KEY is unset), logs the payload to
 *     console with a clear warning. Form succeeds — useful for end-to-end
 *     dev iteration without account signup.
 *   - In production with RESEND_API_KEY missing, throws — fail loud, don't
 *     pretend to deliver.
 *   - With RESEND_API_KEY set, sends via Resend SDK.
 *
 * To swap to SMTP, replace `./resend` with `./smtp` in `./index.ts`.
 *
 * Resend signup: https://resend.com — generous free tier (3k/month, 100/day).
 */

import type { ContactEmailInput } from './index';

const RESEND_API = 'https://api.resend.com/emails';

export async function sendContactEmail(input: ContactEmailInput): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM ?? 'onboarding@resend.dev';
  const to = import.meta.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    if (import.meta.env.PROD) {
      throw new Error(
        '[astro-ignite] Contact form requires RESEND_API_KEY and CONTACT_TO_EMAIL in production.'
      );
    }
    // eslint-disable-next-line no-console
    console.log(
      '\n📧 [astro-ignite] RESEND_API_KEY or CONTACT_TO_EMAIL not set — would have sent:\n',
      JSON.stringify(input, null, 2),
      '\n'
    );
    return;
  }

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: input.email,
      subject: `New contact form submission from ${input.name}`,
      text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}
