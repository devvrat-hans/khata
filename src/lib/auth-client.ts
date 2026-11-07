"use client";

import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Browser side of Better Auth. Talks to /api/auth on the same origin. */
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});
