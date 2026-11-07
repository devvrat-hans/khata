import "server-only";

import { getEnv } from "../env";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

/**
 * Sends one transactional email through Cloudflare Email Sending.
 *
 * The `send_email` binding only accepts the sender addresses listed in
 * wrangler.jsonc. In local development Wrangler simulates the binding and
 * writes the message to disk instead of delivering it; the text body is also
 * printed so sign-in codes are easy to find.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const env = getEnv();

  if (process.env.NODE_ENV !== "production") {
    console.info(`\n[email] to=${message.to}\n[email] subject=${message.subject}\n${message.text}\n`);
  }

  if (!env.EMAIL) {
    if (process.env.NODE_ENV === "production") throw new Error("Email binding is not configured");
    return;
  }

  try {
    await env.EMAIL.send({
      from: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    });
  } catch (error) {
    // Only the stable error code is logged. Messages can echo addresses.
    const code = (error as { code?: unknown } | null)?.code;
    console.error("[email] send failed", typeof code === "string" ? code : "unknown");
    if (process.env.NODE_ENV === "production") throw error;
  }
}
