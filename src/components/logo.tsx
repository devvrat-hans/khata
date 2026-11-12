import { cn } from "@aback-ui/ui";
import Link from "next/link";

/**
 * The Khata lockup: the Aback mark with the product name set in Geist, the
 * same recipe as the aback.group lockup. The mark carries the brand blue.
 */
export function Logo({
  href = "/",
  tone = "default",
  className,
}: {
  href?: string;
  /** `inverse` for the lockup on the inverted footer band. */
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Khata, home"
      className={cn(
        "flex shrink-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <img src="/aback-logo-128.png" alt="" aria-hidden="true" width={28} height={28} className="size-7 shrink-0 object-contain" />
      <span
        className={cn(
          "text-[1.0625rem] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap",
          tone === "inverse" ? "text-inverse-foreground" : "text-foreground",
        )}
      >
        Khata
      </span>
    </Link>
  );
}
