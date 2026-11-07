import "server-only";

import { addTo, type MoneyByCurrency } from "@/domain/money";
import type { GroupRow, PersonRow } from "@/components/lists";
import type { Overview } from "./queries";

function sumMoney(...parts: MoneyByCurrency[]): MoneyByCurrency {
  const total: MoneyByCurrency = {};
  for (const part of parts) for (const [currency, amount] of Object.entries(part)) addTo(total, currency, amount);
  return total;
}

function magnitude(money: MoneyByCurrency): number {
  return Object.values(money).reduce((acc, value) => acc + Math.abs(value), 0);
}

/** The viewer's groups with their balance in each, open balances first. */
export function groupRows(overview: Overview): GroupRow[] {
  return overview.groups
    .map(({ group, memberCount }) => {
      const balance = overview.balances.groups.get(group.id);
      return {
        id: group.id,
        name: group.name,
        kind: group.kind,
        memberCount,
        balance: sumMoney(balance?.shared ?? {}, balance?.private ?? {}),
        hasPrivate: Object.keys(balance?.private ?? {}).length > 0,
      };
    })
    .sort((a, b) => Number(magnitude(b.balance) > 0) - Number(magnitude(a.balance) > 0));
}

/** Everyone the viewer knows, people with open balances first, then by name. */
export function peopleRows(overview: Overview, viewerId: string): PersonRow[] {
  const rows: PersonRow[] = [];
  for (const [id, person] of Object.entries(overview.people)) {
    if (id === viewerId) continue;
    const balance = overview.balances.people.get(id);
    rows.push({
      person,
      balance: balance?.total ?? {},
      hasPrivate: balance?.parts.some((part) => part.source.kind === "private") ?? false,
    });
  }
  return rows.sort((a, b) => {
    const open = Number(magnitude(b.balance) > 0) - Number(magnitude(a.balance) > 0);
    return open !== 0 ? open : a.person.name.localeCompare(b.person.name);
  });
}
