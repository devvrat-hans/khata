import { Button, cn } from "@aback-ui/ui";
import Link from "next/link";
import type { Debt, DebtsByCurrency } from "@/domain/balances";
import { formatMoney, toDecimalString } from "@/domain/money";
import type { PeopleIndex } from "@/server/queries";

function settleHref(groupId: string, debt: Debt, currency: string): string {
  const params = new URLSearchParams({
    group: groupId,
    from: debt.fromUserId,
    to: debt.toUserId,
    amount: toDecimalString(debt.amount, currency),
    currency,
  });
  return `/settle?${params.toString()}`;
}

/** Who owes whom in the group, with a one-tap way to record each payment. */
export function DebtsPanel({
  groupId,
  debts,
  people,
  viewerId,
  simplified,
}: {
  groupId: string;
  debts: DebtsByCurrency;
  people: PeopleIndex;
  viewerId: string;
  simplified: boolean;
}) {
  const rows = Object.entries(debts).flatMap(([currency, list]) => list.map((debt) => ({ currency, debt })));
  // The viewer's own debts first.
  rows.sort((a, b) => {
    const mine = (row: typeof a) =>
      Number(row.debt.fromUserId === viewerId || row.debt.toUserId === viewerId);
    return mine(b) - mine(a);
  });

  const nameOf = (id: string) => (id === viewerId ? "You" : (people[id]?.name ?? "Someone"));

  return (
    <section aria-labelledby="balances-heading" className="border border-border bg-card">
      <h2 id="balances-heading" className="px-4 pt-3 pb-1 text-base font-semibold">
        Who owes whom
      </h2>
      <ul>
        {rows.map(({ currency, debt }) => {
          const owedToViewer = debt.toUserId === viewerId;
          const viewerOwes = debt.fromUserId === viewerId;
          return (
            <li key={`${currency}-${debt.fromUserId}-${debt.toUserId}`} className="flex items-center gap-3 px-4 py-2.5">
              <span className="min-w-0 flex-1 text-sm">
                <span className="block truncate">
                  <span className="font-medium">{nameOf(debt.fromUserId)}</span>
                  <span className="text-muted-foreground">{viewerOwes ? " owe " : " owes "}</span>
                  <span className="font-medium">{owedToViewer ? "you" : nameOf(debt.toUserId)}</span>
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-base font-semibold tabular-nums",
                    owedToViewer ? "text-success" : viewerOwes ? "text-danger" : "text-foreground",
                  )}
                >
                  {formatMoney(debt.amount, currency)}
                </span>
              </span>
              <Button asChild size="sm" variant="outline">
                <Link href={settleHref(groupId, debt, currency)}>Settle</Link>
              </Button>
            </li>
          );
        })}
      </ul>
      {simplified ? (
        <p className="border-t border-border px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
          Combined into the fewest payments.{" "}
          <Link href={`/groups/${groupId}/settings`} className="text-link hover:underline">
            Change this
          </Link>
        </p>
      ) : null}
    </section>
  );
}
