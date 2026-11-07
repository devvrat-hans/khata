import { getAuth } from "@/server/auth/auth";
import { getEnv } from "@/server/env";
import { normalizeEmail } from "@/server/services/users";
import { allow, clientIp } from "@/server/rate-limit";

/**
 * Better Auth's endpoints, behind Workers Rate Limiting:
 * - sign-in codes: 3 a minute per email address
 * - every sign-in attempt: 30 a minute per IP address
 */

function tooMany(message: string): Response {
  return Response.json({ message, code: "RATE_LIMITED" }, { status: 429, headers: { "Retry-After": "60" } });
}

export async function GET(request: Request): Promise<Response> {
  return getAuth().handler(request);
}

export async function POST(request: Request): Promise<Response> {
  const env = getEnv();
  const path = new URL(request.url).pathname;

  if (path.includes("/sign-in/") || path.includes("/email-otp/")) {
    if (!(await allow(env.AUTH_IP_LIMITER, `ip:${clientIp(request.headers)}`))) {
      return tooMany("Too many sign-in attempts. Wait a minute and try again.");
    }
  }

  if (path.endsWith("/email-otp/send-verification-otp")) {
    const body = (await request
      .clone()
      .json()
      .catch(() => null)) as { email?: unknown } | null;
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    if (email && !(await allow(env.OTP_EMAIL_LIMITER, `otp:${email}`))) {
      return tooMany("A code was sent to this address moments ago. Wait a minute before asking for another.");
    }
  }

  return getAuth().handler(request);
}
