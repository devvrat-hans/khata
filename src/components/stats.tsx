import { cn } from "@aback-ui/ui";
import type { ReactNode } from "react";

/**
 * A ruled strip of figures: two columns on phones, four from md up, cells
 * divided by hairlines. Each figure has a mono label above it.
 */
export function StatStrip({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("grid grid-cols-2 border-y border-border md:grid-cols-4", className)}>{children}</dl>;
}

export type StatTone = "default" | "muted" | "success" | "danger";

const TONE: Record<StatTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  success: "text-success",
  danger: "text-danger",
};

export function Stat({ label, tone = "default", children }: { label: string; tone?: StatTone; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-border py-5 odd:border-r odd:pr-4 even:pl-4 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0 [&:nth-child(n+3)]:border-t md:[&:nth-child(n+3)]:border-t-0">
      <dt className="type-meta text-muted-foreground">{label}</dt>
      <dd className={cn("type-stat break-words", TONE[tone])}>{children}</dd>
    </div>
  );
}
