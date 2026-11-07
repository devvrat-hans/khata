"use client";

import { cn } from "@aback-ui/ui";
import { GROUP_KIND_LABELS, type GroupKindValue } from "@/lib/labels";
import { GROUP_KIND_VALUES } from "@/lib/validation";
import { GROUP_KIND_ICONS } from "../icons";

/** A row of square choice chips for the kind of group. */
export function KindPicker({
  value,
  onChange,
  labelledBy,
}: {
  value: GroupKindValue;
  onChange: (value: GroupKindValue) => void;
  labelledBy: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {GROUP_KIND_VALUES.map((kind) => {
        const Icon = GROUP_KIND_ICONS[kind];
        const selected = value === kind;
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(kind)}
            className={cn(
              "flex flex-col items-center gap-1.5 border px-2 py-3 text-xs font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
            {GROUP_KIND_LABELS[kind]}
          </button>
        );
      })}
    </div>
  );
}
