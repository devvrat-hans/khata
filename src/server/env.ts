import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * The Worker environment: bindings (D1, Email, rate limits), vars and
 * secrets. `next dev` gets the same object through Wrangler's platform proxy,
 * so there is one code path for local and deployed runs.
 */
export function getEnv(): CloudflareEnv {
  return getCloudflareContext().env;
}

/**
 * Runs work after the response has been sent (emails, mostly), so a request
 * never waits on a third party. Outside a request it simply lets the promise run.
 */
export function runInBackground(task: Promise<unknown>): void {
  const guarded = task.catch((error: unknown) => {
    console.error("[background] task failed", error instanceof Error ? error.message : error);
  });
  try {
    getCloudflareContext().ctx.waitUntil(guarded);
  } catch {
    void guarded;
  }
}

export function appUrl(): string {
  return getEnv().APP_URL.replace(/\/+$/, "");
}

export function isGoogleEnabled(): boolean {
  const env = getEnv();
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}
