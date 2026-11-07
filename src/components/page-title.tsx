import { cn } from "@aback-ui/ui";
import type { ReactNode } from "react";

/**
 * The page's single H1, its description, and the page actions. Actions sit to
 * the right from sm up and wrap under the title on phones.
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
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</div>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">{title}</h1>
        {description ? <div className="mt-1.5 text-base leading-relaxed text-muted-foreground">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** A section heading with an optional action on the right. */
export function SectionTitle({
  title,
  action,
  id,
}: {
  title: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}
