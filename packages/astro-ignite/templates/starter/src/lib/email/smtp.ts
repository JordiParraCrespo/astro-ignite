/**
 * SMTP transport for the contact form (Nodemailer).
 *
 * NOTE: This file ships only when the user picks SMTP at scaffold time.
 * The CLI adds `nodemailer` + `@types/nodemailer` to package.json as part
 * of that conditional. To swap from Resend to SMTP after scaffold, install
 * those deps manually and replace the import in `./index.ts`.
 *
 * Required env vars (see `.env.example`):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO_EMAIL
 */

// @ts-expect-error - optional dep, only present when user picked SMTP at scaffold
import nodemailer from 'nodemailer';

import type { ContactEmailInput } from './index';

export async function sendContactEmail(input: ContactEmailInput): Promise<void> {
  const host = import.meta.env.SMTP_HOST;
  const port = Number(import.meta.env.SMTP_PORT ?? 587);
  const user = import.meta.env.SMTP_USER;
  const pass = import.meta.env.SMTP_PASS;
  const from = import.meta.env.SMTP_FROM;
  const to = import.meta.env.CONTACT_TO_EMAIL;

  if (!host || !user || !pass || !from || !to) {
    if (import.meta.env.PROD) {
      throw new Error('[astro-ignite] Contact form requires SMTP_* env vars in production.');
    }
    // eslint-disable-next-line no-console
    console.log(
      '\n📧 [astro-ignite] SMTP env vars not set — would have sent:\n',
      JSON.stringify(input, null, 2),
      '\n'
    );
    return;
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    from,
    to,
    replyTo: input.email,
    subject: `New contact form submission from ${input.name}`,
    text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
  });
}
