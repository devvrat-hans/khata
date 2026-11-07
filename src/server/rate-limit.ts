import "server-only";

/**
 * Workers Rate Limiting. Counters are kept per Cloudflare location, which is
 * enough to stop scripted abuse without a database write on every request.
 * A missing binding (unit tests) allows the request.
 */
export async function allow(limiter: RateLimit | undefined, key: string): Promise<boolean> {
  if (!limiter) return true;
  try {
    const { success } = await limiter.limit({ key });
    return success;
  } catch (error) {
    // A limiter outage must not lock everyone out.
    console.error("[rate-limit] limiter failed", error instanceof Error ? error.message : error);
    return true;
  }
}

export function clientIp(headers: Headers): string {
  return headers.get("cf-connecting-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
