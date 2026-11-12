import { cn } from "@aback-ui/ui";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * The editorial primitives shared with aback.group (DESIGN.md, Appendix C):
 * a section label with a small square of brand blue, a text link with a
 * directional arrow, and a status mark that is always a square plus a word.
 */

/** Rail label: a small square of brand blue and one or two words. */
export function SectionLabel({
  as: Tag = "p",
  children,
  className,
  tone = "default",
}: {
  as?: "p" | "h2" | "span" | "div";
  children: ReactNode;
  className?: string;
  tone?: "default" | "inverse";
}) {
  return (
    <Tag
      className={cn(
        "flex items-center gap-2.5 text-sm leading-5 font-medium",
        tone === "inverse" ? "text-inverse-foreground" : "text-foreground",
        className,
      )}
    >
      <span aria-hidden="true" className="size-2 shrink-0 bg-primary-500" />
      {children}
    </Tag>
  );
}

/**
 * A text link with a hairline underline and an arrow. Internal links point
 * right; external links point up and out and open in a new tab.
 */
export function ArrowLink({
  href,
  external = false,
  tone = "default",
  children,
  className,
  ...props
}: {
  href: string;
  external?: boolean;
  tone?: "default" | "inverse";
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"a">, "href" | "children" | "className">) {
  const Arrow = external ? IconArrowUpRight : IconArrowRight;
  const linkClass = cn(
    "group/link inline-flex w-fit items-center gap-1.5 border-b pb-0.5 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    tone === "default"
      ? "border-separator text-foreground hover:border-foreground"
      : "border-inverse-border text-inverse-foreground hover:border-inverse-foreground",
    className,
  );
  const inner = (
    <>
      {children}
      <Arrow
        aria-hidden="true"
        className={cn(
          "size-3.5 shrink-0 transition-transform duration-200",
          external
            ? "group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            : "group-hover/link:translate-x-0.5",
        )}
      />
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass} {...props}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass} {...props}>
      {inner}
    </Link>
  );
}

export type MarkTone = "success" | "danger" | "warning" | "brand" | "muted";

const MARK: Record<MarkTone, string> = {
  success: "bg-success",
  danger: "bg-danger",
  warning: "border border-warning",
  brand: "bg-primary-700 dark:bg-primary-400",
  muted: "border border-muted-foreground",
};

/** A bare square mark. Always sits next to a word. */
export function Mark({ tone, className }: { tone: MarkTone; className?: string }) {
  return <span aria-hidden="true" className={cn("size-2 shrink-0", MARK[tone], className)} />;
}

/** A square mark plus a word, with no box: "Invited", "Private", "Settled". */
export function StatusMark({
  tone,
  children,
  className,
}: {
  tone: MarkTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 text-[0.8125rem] leading-5 font-medium whitespace-nowrap",
        tone === "brand" ? "text-primary-700 dark:text-primary-400" : "text-muted-foreground",
        className,
      )}
    >
      <Mark tone={tone} />
      {children}
    </span>
  );
}

/** Two-digit mono numbering for ruled lists: 01, 02, 03. */
export function Index({ value, className }: { value: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("type-meta tabular-nums text-muted-foreground", className)}>
      {String(value).padStart(2, "0")}
    </span>
  );
}

/**
 * The aback.group page rhythm for public pages: a full-width hairline, then a
 * 12-column row with a short label in the left rail and the content beside
 * it. Bands alternate default and surface; at most one is inverse.
 */
export function Band({
  label,
  id,
  tone = "default",
  children,
  contentClassName,
}: {
  label: string;
  id?: string;
  tone?: "default" | "surface" | "inverse";
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-16 border-t",
        tone === "default" && "border-border",
        tone === "surface" && "border-border bg-surface",
        tone === "inverse" && "border-inverse bg-inverse text-inverse-foreground",
      )}
    >
      <div className="container-site grid gap-y-8 py-16 md:py-24 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-3">
          <SectionLabel tone={tone === "inverse" ? "inverse" : "default"} className="lg:sticky lg:top-24">
            {label}
          </SectionLabel>
        </div>
        <div className={cn("min-w-0 lg:col-span-9", contentClassName)}>{children}</div>
      </div>
    </section>
  );
}
