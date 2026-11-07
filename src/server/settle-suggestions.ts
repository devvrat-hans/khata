import "server-only";

import { toDecimalString } from "@/domain/money";
import type { Overview } from "./queries";

export interface SettleSuggestion {
  key: string;
  personId: string;
  /** Positive: the person owes the viewer. */
  amount: number;
  currency: string;
  source: "group" | "private" | "direct";
  groupId: string | null;
  groupName: string | null;
  href: string;
}

/**
 * Every open balance as a payment someone could record, split by where it
 * lives: a group, a private hisab in a group, or a one to one hisab. Paying
 * in the right place keeps each balance accurate.
 */
export function settleSuggestions(overview: Overview, viewerId: string): SettleSuggestion[] {
  const groupNames = new Map(overview.groups.map((item) => [item.group.id, item.group.name]));
  const result: SettleSuggestion[] = [];
  for (const person of overview.balances.people.values()) {
    for (const part of person.parts) {
      for (const [currency, amount] of Object.entries(part.amount)) {
        if (amount === 0) continue;
        const from = amount > 0 ? person.userId : viewerId;
        const to = amount > 0 ? viewerId : person.userId;
        const params = new URLSearchParams({ from, to, amount: toDecimalString(Math.abs(amount), currency), currency });
        let groupId: string | null = null;
        if (part.source.kind === "direct") {
          params.set("person", person.userId);
        } else {
          groupId = part.source.groupId;
          params.set("group", groupId);
          if (part.source.kind === "private") params.set("private", "1");
        }
        result.push({
          key: `${person.userId}-${part.source.kind}-${groupId ?? ""}-${currency}`,
          personId: person.userId,
          amount,
          currency,
          source: part.source.kind,
          groupId,
          groupName: groupId ? (groupNames.get(groupId) ?? null) : null,
          href: `/settle?${params.toString()}`,
        });
      }
    }
  }
  return result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}
