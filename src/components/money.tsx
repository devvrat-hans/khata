import { cn } from "@aback-ui/ui";
import { formatMoney, type MoneyByCurrency } from "@/domain/money";

/** One amount in one currency, always with tabular figures. */
export function Amount({
  minor,
  currency,
  className,
}: {
  minor: number;
  currency: string;
  className?: string;
}) {
  return (
    <span data-amount className={cn("tabular-nums", className)}>
      {formatMoney(minor, currency)}
    </span>
  );
}

/** Several currencies as "₹500 + $12.00". Shows a dash-free zero when empty. */
export function MoneyList({ money, className }: { money: MoneyByCurrency; className?: string }) {
  const entries = Object.entries(money)
    .filter(([, value]) => value !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  if (entries.length === 0) return <span className={cn("tabular-nums", className)}>0</span>;
  return (
    <span className={cn("tabular-nums", className)}>
      {entries.map(([currency, value], index) => (
        <span key={currency}>
          {index > 0 ? <span className="text-muted-foreground"> + </span> : null}
          {formatMoney(value, currency)}
        </span>
      ))}
    </span>
  );
}

export type BalanceTone = "owed" | "owes" | "even" | "mixed";

/** Whether a signed balance means "you get money", "you owe", both, or neither. */
export function balanceTone(balance: MoneyByCurrency): BalanceTone {
  const values = Object.values(balance).filter((value) => value !== 0);
  if (values.length === 0) return "even";
  const positive = values.some((value) => value > 0);
  const negative = values.some((value) => value < 0);
  if (positive && negative) return "mixed";
  return positive ? "owed" : "owes";
}

const toneClass: Record<BalanceTone, string> = {
  owed: "text-success",
  owes: "text-danger",
  even: "text-muted-foreground",
  mixed: "text-foreground",
};

/**
 * A balance in words and colour: "owes you ₹500" or "you owe ₹500".
 * `subject` is who the balance is with ("Bilal"), or omitted for totals.
 */
export function BalanceText({
  balance,
  subject,
  className,
  settledLabel = "settled up",
}: {
  balance: MoneyByCurrency;
  subject?: string;
  className?: string;
  settledLabel?: string;
}) {
  const positive: MoneyByCurrency = {};
  const negative: MoneyByCurrency = {};
  for (const [currency, value] of Object.entries(balance)) {
    if (value > 0) positive[currency] = value;
    if (value < 0) negative[currency] = -value;
  }
  const hasPositive = Object.keys(positive).length > 0;
  const hasNegative = Object.keys(negative).length > 0;

  if (!hasPositive && !hasNegative) {
    return <span className={cn("text-muted-foreground", className)}>{settledLabel}</span>;
  }
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      {hasPositive ? (
        <span className={toneClass.owed}>
          {subject ? `${subject} owes you ` : "you are owed "}
          <MoneyList money={positive} className="font-semibold" />
        </span>
      ) : null}
      {hasPositive && hasNegative ? <span className="text-muted-foreground">and</span> : null}
      {hasNegative ? (
        <span className={toneClass.owes}>
          {subject ? `you owe ${subject} ` : "you owe "}
          <MoneyList money={negative} className="font-semibold" />
        </span>
      ) : null}
    </span>
  );
}

/** A compact right-aligned balance for list rows: label above, amount below. */
export function BalanceBadge({
  balance,
  className,
  owedLabel = "owes you",
  owesLabel = "you owe",
}: {
  balance: MoneyByCurrency;
  className?: string;
  owedLabel?: string;
  owesLabel?: string;
}) {
  const tone = balanceTone(balance);
  const positive: MoneyByCurrency = {};
  const negative: MoneyByCurrency = {};
  for (const [currency, value] of Object.entries(balance)) {
    if (value > 0) positive[currency] = value;
    if (value < 0) negative[currency] = -value;
  }
  if (tone === "even") {
    return <span className={cn("text-xs text-muted-foreground", className)}>settled up</span>;
  }
  return (
    <span className={cn("flex flex-col items-end gap-0.5 text-right", className)}>
      {Object.keys(positive).length > 0 ? (
        <span className="flex flex-col items-end">
          <span className="text-xs text-success">{owedLabel}</span>
          <MoneyList money={positive} className="text-sm font-semibold text-success" />
        </span>
      ) : null}
      {Object.keys(negative).length > 0 ? (
        <span className="flex flex-col items-end">
          <span className="text-xs text-danger">{owesLabel}</span>
          <MoneyList money={negative} className="text-sm font-semibold text-danger" />
        </span>
      ) : null}
    </span>
  );
}
