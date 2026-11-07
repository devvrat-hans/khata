/**
 * Where to go after signing in. Only same-site paths are allowed, so a link
 * like /sign-in?next=https://evil.example cannot bounce people off the site.
 */
export function safeNext(value: string | string[] | undefined | null, fallback = "/dashboard"): string {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.startsWith("/sign-in") || next.startsWith("/api/")) return fallback;
  return next;
}
