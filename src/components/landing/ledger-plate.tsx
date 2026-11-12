import { cn } from "@aback-ui/ui";
import { IconLock } from "@tabler/icons-react";

/**
 * A picture of Khata built from the same type and rules as the app, so it
 * stays sharp at any size and follows the theme. It is decoration: the
 * landing page says everything it shows in words too.
 */

const ROWS = [
  { day: "14", month: "Dec", name: "Dinner at Thalassa", meta: "Bilal paid ₹4,800", impact: "you borrowed", amount: "₹1,200", tone: "owes" },
  { day: "13", month: "Dec", name: "Scooter rental", meta: "You paid ₹2,400", impact: "you lent", amount: "₹1,800", tone: "owed" },
  { day: "12", month: "Dec", name: "Cab to the airport", meta: "You paid ₹900", impact: "you lent", amount: "₹450", tone: "owed", private: "Private with Bilal" },
  { day: "11", month: "Dec", name: "Villa, three nights", meta: "Chen paid ₹18,000", impact: "you borrowed", amount: "₹4,500", tone: "owes" },
  { day: "10", month: "Dec", name: "Groceries", meta: "You paid ₹1,600", impact: "you lent", amount: "₹1,200", tone: "owed" },
] as const;

function Impact({ label, amount, tone }: { label: string; amount: string; tone: "owed" | "owes" }) {
  return (
    <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
      <span className={cn("type-meta", tone === "owed" ? "text-success" : "text-danger")}>{label}</span>
      <span className={cn("text-sm font-medium tabular-nums", tone === "owed" ? "text-success" : "text-danger")}>
        {amount}
      </span>
    </span>
  );
}

export function LedgerPlate() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none border border-border bg-background text-foreground shadow-[0_30px_80px_-24px_rgb(0_0_0/0.45)]"
    >
      {/* App bar */}
      <div className="flex h-11 items-center gap-6 border-b border-border px-4 sm:px-6">
        <span className="flex items-center gap-2">
          <img src="/aback-logo-128.png" alt="" width={18} height={18} className="size-[1.125rem]" />
          <span className="text-[0.8125rem] font-semibold tracking-[-0.02em]">Khata</span>
        </span>
        <span className="hidden h-full items-stretch gap-5 text-xs sm:flex">
          <span className="flex items-center text-muted-foreground">Home</span>
          <span className="-mb-px flex items-center border-b-2 border-primary-700 font-medium dark:border-primary-400">
            Groups
          </span>
          <span className="flex items-center text-muted-foreground">People</span>
          <span className="flex items-center text-muted-foreground">Activity</span>
        </span>
        <span className="ml-auto hidden h-7 items-center bg-primary-700 px-3 text-[0.6875rem] font-medium text-white sm:flex dark:bg-primary-400 dark:text-primary-950">
          Add expense
        </span>
      </div>

      <div className="px-4 pt-6 pb-8 sm:px-6 sm:pt-8 lg:px-10">
        {/* Title and balance */}
        <p className="flex items-center gap-2 text-xs font-medium">
          <span className="size-1.5 bg-primary-500" />
          Trip · 4 people
        </p>
        <p className="mt-3 text-2xl font-medium tracking-[-0.04em] sm:text-3xl">Goa, December</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 bg-success" />
              You are owed
            </p>
            <p className="mt-1.5 text-4xl font-medium tracking-[-0.05em] tabular-nums text-success sm:text-5xl">
              ₹1,050
            </p>
          </div>
          <dl className="hidden grid-cols-3 border-y border-border sm:grid">
            {[
              ["Spending", "₹27,700"],
              ["Your share", "₹6,925"],
              ["Expenses", "5"],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-border px-4 py-2.5 last:border-r-0">
                <dt className="type-meta text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-base font-medium tracking-[-0.03em] tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Ledger and balances */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-10">
          <div>
            <p className="flex items-baseline gap-2 border-t border-foreground pt-2 pb-3 text-sm font-medium">
              Expenses <span className="type-meta text-muted-foreground">05</span>
            </p>
            <ul className="border-t border-border">
              {ROWS.map((row) => (
                <li key={row.name} className="flex items-center gap-3 border-b border-border py-2.5">
                  <span className="flex w-7 shrink-0 flex-col leading-none">
                    <span className="text-base font-medium tracking-[-0.03em] tabular-nums">{row.day}</span>
                    <span className="type-meta mt-0.5 text-muted-foreground">{row.month}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] font-medium">{row.name}</span>
                    <span className="mt-0.5 flex items-center gap-2 truncate text-xs text-muted-foreground">
                      {row.meta}
                      {"private" in row ? (
                        <span className="inline-flex items-center gap-1 font-medium text-primary-700 dark:text-primary-400">
                          <IconLock className="size-3" />
                          {row.private}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <Impact label={row.impact} amount={row.amount} tone={row.tone} />
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden flex-col gap-6 lg:flex">
            <div>
              <p className="flex items-baseline gap-2 border-t border-foreground pt-2 pb-3 text-sm font-medium">
                Who owes whom <span className="type-meta text-muted-foreground">02</span>
              </p>
              <ul className="border-t border-border text-[0.8125rem]">
                <li className="flex items-center justify-between gap-3 border-b border-border py-2.5">
                  <span>
                    <span className="font-medium">Dia</span> <span className="text-muted-foreground">owes</span>{" "}
                    <span className="font-medium">you</span>
                    <span className="mt-0.5 block text-base font-medium tracking-[-0.02em] tabular-nums text-success">
                      ₹1,050
                    </span>
                  </span>
                  <span className="border border-separator px-2.5 py-1 text-xs font-medium">Settle</span>
                </li>
                <li className="flex items-center justify-between gap-3 border-b border-border py-2.5">
                  <span>
                    <span className="font-medium">Bilal</span> <span className="text-muted-foreground">owes</span>{" "}
                    <span className="font-medium">Chen</span>
                    <span className="mt-0.5 block text-base font-medium tracking-[-0.02em] tabular-nums">₹3,300</span>
                  </span>
                  <span className="border border-separator px-2.5 py-1 text-xs font-medium">Settle</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-2 border-t border-foreground pt-2 pb-3 text-sm font-medium">
                <IconLock className="size-3.5 text-primary-700 dark:text-primary-400" />
                Private hisabs
              </p>
              <p className="border-y border-border py-2.5 text-[0.8125rem] text-success">
                Bilal owes you <span className="font-medium tabular-nums">₹450</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
