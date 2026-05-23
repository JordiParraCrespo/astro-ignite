/**
 * Astro Actions — type-safe server-side form handlers.
 *
 * The contact action validates input via Zod, checks the honeypot field
 * (`_website` — bots fill it, humans don't), and dispatches to whichever
 * email transport is configured in `src/lib/email/`.
 *
 * Forms post to `actions.contact` directly via `<form action={actions.contact}>`
 * — Astro 6 handles progressive enhancement. The page calls
 * `Astro.getActionResult()` to read the result on the rendered response.
 */

import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';

import { sendContactEmail } from '@/lib/email';

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1).max(100),
      email: z.email().max(254),
      message: z.string().min(10).max(5000),
      _website: z.string().max(0).optional(),
    }),
    handler: async (input) => {
      // Honeypot — silently succeed, don't notify the user, don't send email.
      if (input._website && input._website.length > 0) {
        return { ok: true } as const;
      }

      await sendContactEmail({
        name: input.name,
        email: input.email,
        message: input.message,
      });

      return { ok: true } as const;
    },
  }),
};
