import { cn } from "@aback-ui/ui";
import type { ReactNode } from "react";
import { SectionLabel } from "./editorial";

/**
 * The page's single H1: a rail label with the brand square, a large title set
 * tight, an optional lede, and the page actions. Actions sit to the right on
 * wide screens and wrap under the title on phones.
 */
export function PageTitle({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** A short label above the title, such as "Trip · 3 people". */
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10", className)}
    >
      <div className="min-w-0">
        {eyebrow ? <SectionLabel as="div">{eyebrow}</SectionLabel> : null}
        <h1 className={cn("type-page text-balance break-words text-foreground", eyebrow ? "mt-5" : null)}>
          {title}
        </h1>
        {description ? (
          <div className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-3 lg:w-auto lg:shrink-0 lg:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

/**
 * A section head: the heading, an optional count in mono, and one action on
 * the right. Lists under it are ruled rows.
 */
export function SectionTitle({
  title,
  action,
  id,
  count,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  id?: string;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4 pb-4", className)}>
      <h2 id={id} className="flex items-baseline gap-2.5 text-lg font-medium tracking-[-0.02em] text-foreground">
        {title}
        {count !== undefined ? (
          <span className="type-meta tabular-nums text-muted-foreground">{String(count).padStart(2, "0")}</span>
        ) : null}
      </h2>
      {action}
    </div>
  );
}

/** A quiet message in place of an empty list, set between hairlines. */
export function EmptyNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("border-y border-border py-5 text-[0.9375rem] leading-relaxed text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/**
 * The empty version of a section: a statement set between hairlines, what to
 * do about it, and one action. Replaces a centred box with an icon.
 */
export function EmptyPanel({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-y border-border py-12 md:py-16", className)}>
      <p className="type-subhead max-w-xl text-balance text-foreground">{title}</p>
      {description ? (
        <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">{action}</div> : null}
    </div>
  );
}

/**
 * The label rail from aback.group: a heading and a short description on the
 * left, the content on the right. Settings use it.
 */
export function RailSection({
  id,
  title,
  description,
  tone = "default",
  children,
}: {
  id?: string;
  title: string;
  description?: ReactNode;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  const headingId = `${id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12",
      )}
    >
      <div className="lg:col-span-4">
        <h2
          id={headingId}
          className={cn("text-lg font-medium tracking-[-0.02em]", tone === "danger" ? "text-danger" : "text-foreground")}
        >
          {title}
        </h2>
        {description ? (
          <div className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</div>
        ) : null}
      </div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </section>
  );
}
