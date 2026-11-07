/**
 * Secrets are not in wrangler.jsonc, so `wrangler types` cannot see them.
 * They are declared here and merged into the generated CloudflareEnv.
 */
interface CloudflareEnv {
  /** Signs session cookies and verification codes. 32 or more random characters. */
  BETTER_AUTH_SECRET: string;
  /** Google OAuth client. Both must be set for "Continue with Google" to show. */
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}
