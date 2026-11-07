import "server-only";

import {
  balanceBetween,
  type DebtsByCurrency,
  groupDebts,
  type LedgerItem,
  netBalances,
  netForUser,
  splitDirections,
} from "@/domain/balances";
import { addTo, type MoneyByCurrency } from "@/domain/money";
import { type Ledger, toLedgerItems } from "./ledger";

/** Where a balance with a person comes from. */
export type BalanceSource =
  | { kind: "group"; groupId: string }
  | { kind: "private"; groupId: string }
  | { kind: "direct" };

export interface BalancePart {
  source: BalanceSource;
  /** Positive: the other person owes the viewer. */
  amount: MoneyByCurrency;
}

export interface PersonBalance {
  userId: string;
  total: MoneyByCurrency;
  parts: BalancePart[];
}

export interface GroupBalance {
  /** The viewer's position in what the whole group sees. */
  shared: MoneyByCurrency;
  /** The viewer's position across their private hisabs in this group. */
  private: MoneyByCurrency;
}

export interface ViewerBalances {
  people: Map<string, PersonBalance>;
  groups: Map<string, GroupBalance>;
  owes: MoneyByCurrency;
  owed: MoneyByCurrency;
}

export interface GroupSettings {
  simplifyDebts: boolean;
}

function addMoney(target: MoneyByCurrency, source: MoneyByCurrency): void {
  for (const [currency, amount] of Object.entries(source)) addTo(target, currency, amount);
}

function emptyGroupBalance(): GroupBalance {
  return { shared: {}, private: {} };
}

/**
 * Turns everything a viewer can see into balances per person and per group.
 *
 * Shared group rows are settled the way the group is set up (simplified or
 * not), and the viewer's balance with each member is read from those debts.
 * Pair rows (private hisabs in groups and one to one hisabs) only ever
 * involve two people, so they are netted directly.
 */
export function computeViewerBalances(
  viewerId: string,
  ledger: Ledger,
  groupSettings: ReadonlyMap<string, GroupSettings>,
): ViewerBalances {
  const publicByGroup = new Map<string, LedgerItem[]>();
  const pairBuckets = new Map<string, { otherId: string; groupId: string | null; items: LedgerItem[] }>();

  const place = (record: Ledger["expenses"][number] | Ledger["settlements"][number], item: LedgerItem) => {
    if (record.visibility === "group" && record.groupId) {
      const list = publicByGroup.get(record.groupId) ?? [];
      list.push(item);
      publicByGroup.set(record.groupId, list);
      return;
    }
    const otherId = record.pairA === viewerId ? record.pairB : record.pairA;
    if (!otherId) return;
    const key = `${otherId}\u0000${record.groupId ?? ""}`;
    const bucket = pairBuckets.get(key) ?? { otherId, groupId: record.groupId, items: [] };
    bucket.items.push(item);
    pairBuckets.set(key, bucket);
  };

  const items = toLedgerItems(ledger);
  const records = [...ledger.expenses, ...ledger.settlements];
  records.forEach((record, index) => {
    const item = items[index];
    if (item) place(record, item);
  });

  const people = new Map<string, PersonBalance>();
  const groups = new Map<string, GroupBalance>();

  const addPart = (otherId: string, source: BalanceSource, amount: MoneyByCurrency) => {
    if (Object.keys(amount).length === 0) return;
    const person = people.get(otherId) ?? { userId: otherId, total: {}, parts: [] };
    person.parts.push({ source, amount });
    addMoney(person.total, amount);
    people.set(otherId, person);
  };

  for (const [groupId, groupItems] of publicByGroup) {
    const simplify = groupSettings.get(groupId)?.simplifyDebts ?? true;
    const debts = groupDebts(groupItems, simplify);
    const balance = groups.get(groupId) ?? emptyGroupBalance();
    balance.shared = netForUser(debts, viewerId);
    groups.set(groupId, balance);

    const others = new Set<string>();
    for (const list of Object.values(debts)) {
      for (const debt of list) {
        if (debt.fromUserId === viewerId) others.add(debt.toUserId);
        if (debt.toUserId === viewerId) others.add(debt.fromUserId);
      }
    }
    for (const otherId of others) addPart(otherId, { kind: "group", groupId }, balanceBetween(debts, viewerId, otherId));
  }

  for (const bucket of pairBuckets.values()) {
    const amount: MoneyByCurrency = {};
    for (const [currency, net] of Object.entries(netBalances(bucket.items))) {
      const value = net[viewerId] ?? 0;
      if (value !== 0) amount[currency] = value;
    }
    if (bucket.groupId) {
      const balance = groups.get(bucket.groupId) ?? emptyGroupBalance();
      addMoney(balance.private, amount);
      groups.set(bucket.groupId, balance);
      addPart(bucket.otherId, { kind: "private", groupId: bucket.groupId }, amount);
    } else {
      addPart(bucket.otherId, { kind: "direct" }, amount);
    }
  }

  // Totals net each person first, so owing and being owed by the same person cancel out.
  const owes: MoneyByCurrency = {};
  const owed: MoneyByCurrency = {};
  for (const person of people.values()) {
    const directions = splitDirections(person.total);
    addMoney(owes, directions.owes);
    addMoney(owed, directions.owed);
  }

  return { people, groups, owes, owed };
}

/** The debts the whole group sees, and every member's net position in them. */
export function computeGroupDebts(
  ledger: Ledger,
  simplify: boolean,
): { debts: DebtsByCurrency; netByUser: Map<string, MoneyByCurrency> } {
  const items = toLedgerItems(ledger);
  const debts = groupDebts(items, simplify);
  const netByUser = new Map<string, MoneyByCurrency>();
  for (const [currency, net] of Object.entries(netBalances(items))) {
    for (const [userId, amount] of Object.entries(net)) {
      const money = netByUser.get(userId) ?? {};
      addTo(money, currency, amount);
      netByUser.set(userId, money);
    }
  }
  return { debts, netByUser };
}

/** Net position of the viewer with each person across pair rows. */
export function computePairBalances(viewerId: string, ledger: Ledger): Map<string, MoneyByCurrency> {
  const result = new Map<string, MoneyByCurrency>();
  const items = toLedgerItems(ledger);
  const records = [...ledger.expenses, ...ledger.settlements];
  const byOther = new Map<string, LedgerItem[]>();
  records.forEach((record, index) => {
    const item = items[index];
    const otherId = record.pairA === viewerId ? record.pairB : record.pairA;
    if (!item || !otherId) return;
    const list = byOther.get(otherId) ?? [];
    list.push(item);
    byOther.set(otherId, list);
  });
  for (const [otherId, list] of byOther) {
    const money: MoneyByCurrency = {};
    for (const [currency, net] of Object.entries(netBalances(list))) {
      const value = net[viewerId] ?? 0;
      if (value !== 0) money[currency] = value;
    }
    result.set(otherId, money);
  }
  return result;
}
