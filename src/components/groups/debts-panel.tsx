import { Badge, Button } from "@aback-ui/ui";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import type { Debt, DebtsByCurrency } from "@/domain/balances";
import { formatMoney, toDecimalString } from "@/domain/money";
import type { PeopleIndex } from "@/server/queries";
import { PersonAvatar } from "../person-avatar";

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
    <section aria-labelledby="balances-heading" className="border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 id="balances-heading" className="text-base font-semibold">
          Balances
        </h2>
        {simplified ? (
          <Badge variant="brand" title="Debts are combined so the group settles with the fewest payments.">
            Simplified
          </Badge>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Everyone is settled up.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map(({ currency, debt }) => {
            const from = people[debt.fromUserId];
            const to = people[debt.toUserId];
            const involvesViewer = debt.fromUserId === viewerId || debt.toUserId === viewerId;
            return (
              <li key={`${currency}-${debt.fromUserId}-${debt.toUserId}`} className="flex items-center gap-3 px-4 py-3">
                <span className="flex shrink-0 items-center gap-1">
                  {from ? <PersonAvatar person={from} size="xs" /> : null}
                  <IconArrowRight aria-hidden="true" className="size-3.5 text-muted-foreground" />
                  {to ? <PersonAvatar person={to} size="xs" /> : null}
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">{nameOf(debt.fromUserId)}</span>
                  <span className="text-muted-foreground">{debt.fromUserId === viewerId ? " owe " : " owes "}</span>
                  <span className="font-medium">{debt.toUserId === viewerId ? "you" : nameOf(debt.toUserId)}</span>
                  <span className="mt-0.5 block font-semibold tabular-nums">{formatMoney(debt.amount, currency)}</span>
                </span>
                <Button asChild size="sm" variant={involvesViewer ? "default" : "outline"}>
                  <Link href={settleHref(groupId, debt, currency)}>Settle</Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {simplified && rows.length > 0 ? (
        <p className="flex items-start gap-2 border-t border-border bg-muted/20 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
          <IconInfoCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          Debts are combined, so the group settles with the fewest payments. Turn this off in group settings.
        </p>
      ) : null}
    </section>
  );
}
