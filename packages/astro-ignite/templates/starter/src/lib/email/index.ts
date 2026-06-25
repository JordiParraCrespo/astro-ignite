/**
 * Email transport — re-exports the chosen provider's `sendContactEmail`.
 *
 * The CLI scaffolds the right file based on the email-provider prompt:
 *   - Resend (default): `./resend.ts`
 *   - SMTP: `./smtp.ts`
 *   - None: this file logs to console with a "configure your email provider"
 *     warning, useful for development.
 *
 * Swap providers by editing this file's import.
 */

import { sendContactEmail as send } from './resend';

export interface ContactEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactEmail = send;
