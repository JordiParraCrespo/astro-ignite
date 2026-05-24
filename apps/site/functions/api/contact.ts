/**
 * Contact form handler — Cloudflare Pages Function.
 *
 * The site is fully static; this is the one server-side piece. It receives the
 * form POST at /api/contact, validates + checks the honeypot, sends via Resend,
 * then redirects back to the contact page with ?status=sent|error (the page
 * surfaces a banner from that param).
 *
 * Secrets come from the runtime env binding (set as encrypted vars on the Pages
 * project / .dev.vars locally) — never import.meta.env, never shipped to the
 * client:
 *   RESEND_API_KEY   (required to actually send)
 *   CONTACT_TO_EMAIL (required — where submissions go)
 *   RESEND_FROM      (optional — defaults to Resend's sandbox sender)
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  RESEND_FROM?: string;
}

const RESEND_API = 'https://api.resend.com/emails';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Only redirect back to a known contact path — never an attacker-supplied URL. */
function safeRedirect(value: FormDataEntryValue | null): string {
  const v = typeof value === 'string' ? value : '';
  return /^\/([a-z]{2}\/)?contact\/?$/.test(v) ? v : '/contact';
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const form = await request.formData();

  const redirectTo = safeRedirect(form.get('_redirect'));
  const back = (status: 'sent' | 'error') =>
    Response.redirect(new URL(`${redirectTo}?status=${status}`, request.url).toString(), 303);

  // Honeypot — bots fill it, humans don't. Pretend success, send nothing.
  const honeypot = form.get('_website');
  if (typeof honeypot === 'string' && honeypot.length > 0) return back('sent');

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();

  const valid =
    name.length >= 1 &&
    name.length <= 100 &&
    email.length <= 254 &&
    EMAIL_RE.test(email) &&
    message.length >= 10 &&
    message.length <= 5000;
  if (!valid) return back('error');

  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.RESEND_FROM ?? 'onboarding@resend.dev';
  // Misconfigured in production — fail visibly rather than silently dropping mail.
  if (!apiKey || !to) return back('error');

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `New contact form submission from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  return back(res.ok ? 'sent' : 'error');
}
