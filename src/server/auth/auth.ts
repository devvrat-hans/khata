import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins/email-otp";
import { cache } from "react";
import { type Database, getDb } from "../db/client";
import { account, session, user, verification } from "../db/schema";
import { sendEmail } from "../email/mailer";
import { signInCodeEmail } from "../email/templates";
import { getEnv, runInBackground } from "../env";
import { newId } from "../ids";

export const SESSION_DAYS = 60;

/**
 * Sign in is passwordless: a six digit code by email, or Google. There are no
 * passwords to leak or reset.
 *
 * People can be added to a group by email before they ever sign in. That
 * creates a user row with no credentials and `emailVerified = false`. The first
 * sign in with that address, by code or by Google, proves ownership and takes
 * the row over, with every expense that was already recorded for them. This is
 * why Google may link to a row whose email is not yet verified: such a row has
 * no other way in, so there is nothing to take over.
 */
export function createAuth(db: Database, env: CloudflareEnv) {
  const baseURL = env.APP_URL.replace(/\/+$/, "");
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return betterAuth({
    appName: "Khata",
    baseURL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [baseURL],
    telemetry: { enabled: false },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: { enabled: false },
    socialProviders: googleEnabled
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
            prompt: "select_account",
          },
        }
      : {},
    user: {
      additionalFields: {
        defaultCurrency: { type: "string", required: false, input: false, defaultValue: "INR" },
        upiId: { type: "string", required: false, input: false },
        emailNotifications: { type: "boolean", required: false, input: false, defaultValue: true },
        onboardedAt: { type: "date", required: false, input: false },
        deletedAt: { type: "date", required: false, input: false },
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
        // See the note above: an unverified row has no credentials of its own.
        requireLocalEmailVerified: false,
        // A person added by email gets their real Google name and photo on first sign in.
        updateUserInfoOnLink: true,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * SESSION_DAYS,
      updateAge: 60 * 60 * 24,
    },
    // Abuse limits are enforced by Workers Rate Limiting in the route handler.
    rateLimit: { enabled: false },
    advanced: {
      database: { generateId: () => newId() },
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
      backgroundTasks: { handler: runInBackground },
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 10 * 60,
        allowedAttempts: 5,
        storeOTP: "hashed",
        sendVerificationOTP: async ({ email, otp, type }) => {
          if (type !== "sign-in") return;
          const message = signInCodeEmail({ code: otp, appUrl: baseURL });
          // Sent after the response so timing never reveals whether the address has an account.
          runInBackground(sendEmail({ to: email, ...message }));
        },
      }),
      // Must be last: lets server actions set the session cookie.
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

/** The auth instance for the current request. */
export const getAuth = cache((): Auth => createAuth(getDb(), getEnv()));
