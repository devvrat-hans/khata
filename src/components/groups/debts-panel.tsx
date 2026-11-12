import { Button, cn } from "@aback-ui/ui";
import Link from "next/link";
import type { Debt, DebtsByCurrency } from "@/domain/balances";
import { formatMoney, toDecimalString } from "@/domain/money";
import type { PeopleIndex } from "@/server/queries";
import { SectionTitle } from "../page-title";

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
    <section aria-labelledby="balances-heading">
      <SectionTitle id="balances-heading" title="Who owes whom" count={rows.length} />
      <ul className="border-t border-border">
        {rows.map(({ currency, debt }) => {
          const owedToViewer = debt.toUserId === viewerId;
          const viewerOwes = debt.fromUserId === viewerId;
          return (
            <li
              key={`${currency}-${debt.fromUserId}-${debt.toUserId}`}
              className="flex items-center gap-3 border-b border-border py-3.5"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">
                  <span className="font-medium">{nameOf(debt.fromUserId)}</span>
                  <span className="text-muted-foreground">{viewerOwes ? " owe " : " owes "}</span>
                  <span className="font-medium">{owedToViewer ? "you" : nameOf(debt.toUserId)}</span>
                </span>
                <span
                  className={cn(
                    "mt-1 block text-lg font-medium tracking-[-0.02em] tabular-nums",
                    owedToViewer ? "text-success" : viewerOwes ? "text-danger" : "text-foreground",
                  )}
                >
                  {formatMoney(debt.amount, currency)}
                </span>
              </span>
              <Button asChild size="sm" variant={viewerOwes ? "brand" : "outline"}>
                <Link href={settleHref(groupId, debt, currency)}>Settle</Link>
              </Button>
            </li>
          );
        })}
      </ul>
      {simplified ? (
        <p className="pt-3 text-xs leading-relaxed text-muted-foreground">
          Combined into the fewest payments.{" "}
          <Link href={`/groups/${groupId}/settings`} className="link-inline text-foreground">
            Change this
          </Link>
        </p>
      ) : null}
    </section>
  );
}
