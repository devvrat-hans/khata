import Link from "next/link";

/** The Aback mark with the Khata wordmark. */
export function Logo({ href = "/", wordmark = true, size = 28 }: { href?: string; wordmark?: boolean; size?: number }) {
  return (
    <Link
      href={href}
      aria-label="Khata, home"
      className="group flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <img
        src="/aback-logo-128.png"
        alt=""
        width={size}
        height={size}
        className="shrink-0 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"
      />
      {wordmark ? <span className="text-lg font-bold tracking-tight text-foreground">Khata</span> : null}
    </Link>
  );
}
