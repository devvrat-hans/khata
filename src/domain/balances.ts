/**
 * Balances: who is up, who is down, and who should pay whom.
 *
 * Inputs are ledger items (expenses and payments). Outputs are always split
 * by currency, because Khata never converts between currencies on its own.
 *
 * Sign convention: a positive net balance means the person is owed money,
 * a negative one means they owe.
 */

import { addTo, type MoneyByCurrency } from "./money";
import type { Portion } from "./split";

export interface LedgerExpense {
  kind: "expense";
  currency: string;
  /** Who paid, adding up to the expense total. */
  payers: readonly Portion[];
  /** Who it was for, adding up to the expense total. */
  shares: readonly Portion[];
}

export interface LedgerPayment {
  kind: "payment";
  currency: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export type LedgerItem = LedgerExpense | LedgerPayment;

/** "from owes to this much", always a positive amount. */
export interface Debt {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export type NetByCurrency = Record<string, Record<string, number>>;
export type DebtsByCurrency = Record<string, Debt[]>;

function bump(map: Record<string, number>, userId: string, amount: number): void {
  const next = (map[userId] ?? 0) + amount;
  if (next === 0) delete map[userId];
  else map[userId] = next;
}

/** Net balance of every person, per currency. */
export function netBalances(items: readonly LedgerItem[]): NetByCurrency {
  const result: NetByCurrency = {};
  for (const item of items) {
    const net = (result[item.currency] ??= {});
    if (item.kind === "expense") {
      for (const payer of item.payers) bump(net, payer.userId, payer.amount);
      for (const share of item.shares) bump(net, share.userId, -share.amount);
    } else {
      // Paying someone back moves the payer up and the receiver down.
      bump(net, item.fromUserId, item.amount);
      bump(net, item.toUserId, -item.amount);
    }
  }
  for (const currency of Object.keys(result)) {
    if (Object.keys(result[currency] ?? {}).length === 0) delete result[currency];
  }
  return result;
}

const compareIds = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Settles a set of net balances with as few payments as a greedy match allows:
 * the person who owes most pays the person owed most, until everyone is even.
 * This produces at most n - 1 payments. Ties are broken by user id so the
 * suggestion is stable between page loads.
 */
export function simplifyNet(net: Readonly<Record<string, number>>): Debt[] {
  const creditors = Object.entries(net)
    .filter(([, amount]) => amount > 0)
    .map(([userId, amount]) => ({ userId, amount }));
  const debtors = Object.entries(net)
    .filter(([, amount]) => amount < 0)
    .map(([userId, amount]) => ({ userId, amount: -amount }));

  const byAmount = (a: { userId: string; amount: number }, b: { userId: string; amount: number }) =>
    b.amount - a.amount || compareIds(a.userId, b.userId);

  const debts: Debt[] = [];
  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort(byAmount);
    debtors.sort(byAmount);
    const creditor = creditors[0];
    const debtor = debtors[0];
    if (!creditor || !debtor) break;
    const amount = Math.min(creditor.amount, debtor.amount);
    debts.push({ fromUserId: debtor.userId, toUserId: creditor.userId, amount });
    creditor.amount -= amount;
    debtor.amount -= amount;
    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();
  }
  return debts;
}

function pairKey(a: string, b: string): [string, string, number] {
  // The sign says which direction the stored amount points: +1 means a owes b.
  return a < b ? [a, b, 1] : [b, a, -1];
}

/**
 * Who owes whom without simplification: every expense creates debts from the
 * people who were short to the people who paid, and every payment cancels
 * debt between its two people. Debts between the same two people are netted.
 */
export function pairwiseDebts(items: readonly LedgerItem[]): DebtsByCurrency {
  const ledgers: Record<string, Map<string, { a: string; b: string; amount: number }>> = {};

  const add = (currency: string, from: string, to: string, amount: number) => {
    if (amount === 0 || from === to) return;
    const map = (ledgers[currency] ??= new Map());
    const [a, b, sign] = pairKey(from, to);
    const key = `${a}\u0000${b}`;
    const entry = map.get(key) ?? { a, b, amount: 0 };
    entry.amount += sign * amount;
    map.set(key, entry);
  };

  for (const item of items) {
    if (item.kind === "payment") {
      // A payment from X to Y reduces what X owes Y.
      add(item.currency, item.toUserId, item.fromUserId, item.amount);
      continue;
    }
    // Net position of each person within this one expense.
    const net: Record<string, number> = {};
    for (const payer of item.payers) bump(net, payer.userId, payer.amount);
    for (const share of item.shares) bump(net, share.userId, -share.amount);
    // Within a single expense the greedy match is exact: each person who was
    // short pays the people who overpaid, in a fixed order.
    for (const debt of simplifyNet(net)) add(item.currency, debt.fromUserId, debt.toUserId, debt.amount);
  }

  const result: DebtsByCurrency = {};
  for (const [currency, map] of Object.entries(ledgers)) {
    const debts: Debt[] = [];
    for (const { a, b, amount } of map.values()) {
      if (amount > 0) debts.push({ fromUserId: a, toUserId: b, amount });
      else if (amount < 0) debts.push({ fromUserId: b, toUserId: a, amount: -amount });
    }
    if (debts.length > 0) {
      debts.sort((x, y) => y.amount - x.amount || compareIds(x.fromUserId, y.fromUserId));
      result[currency] = debts;
    }
  }
  return result;
}

/** The debts to show for a group, simplified or not. */
export function groupDebts(items: readonly LedgerItem[], simplify: boolean): DebtsByCurrency {
  if (!simplify) return pairwiseDebts(items);
  const result: DebtsByCurrency = {};
  for (const [currency, net] of Object.entries(netBalances(items))) {
    const debts = simplifyNet(net);
    if (debts.length > 0) result[currency] = debts;
  }
  return result;
}

/**
 * What `userId` stands to get from `otherId` within a set of debts, per
 * currency. Positive means the other person owes this user.
 */
export function balanceBetween(debts: DebtsByCurrency, userId: string, otherId: string): MoneyByCurrency {
  const result: MoneyByCurrency = {};
  for (const [currency, list] of Object.entries(debts)) {
    for (const debt of list) {
      if (debt.fromUserId === otherId && debt.toUserId === userId) addTo(result, currency, debt.amount);
      else if (debt.fromUserId === userId && debt.toUserId === otherId) addTo(result, currency, -debt.amount);
    }
  }
  return result;
}

/** A user's net position from a set of debts, per currency. */
export function netForUser(debts: DebtsByCurrency, userId: string): MoneyByCurrency {
  const result: MoneyByCurrency = {};
  for (const [currency, list] of Object.entries(debts)) {
    for (const debt of list) {
      if (debt.toUserId === userId) addTo(result, currency, debt.amount);
      else if (debt.fromUserId === userId) addTo(result, currency, -debt.amount);
    }
  }
  return result;
}

/** Splits a signed balance into what the user owes and what they are owed. */
export function splitDirections(balance: MoneyByCurrency): { owes: MoneyByCurrency; owed: MoneyByCurrency } {
  const owes: MoneyByCurrency = {};
  const owed: MoneyByCurrency = {};
  for (const [currency, amount] of Object.entries(balance)) {
    if (amount > 0) owed[currency] = amount;
    else if (amount < 0) owes[currency] = -amount;
  }
  return { owes, owed };
}

export interface SpendingSummary {
  /** Total of all expenses, per currency. */
  total: MoneyByCurrency;
  /** What the user paid. */
  paid: MoneyByCurrency;
  /** The user's own share of the expenses. */
  share: MoneyByCurrency;
}

export function spendingSummary(items: readonly LedgerItem[], userId: string): SpendingSummary {
  const summary: SpendingSummary = { total: {}, paid: {}, share: {} };
  for (const item of items) {
    if (item.kind !== "expense") continue;
    for (const payer of item.payers) {
      addTo(summary.total, item.currency, payer.amount);
      if (payer.userId === userId) addTo(summary.paid, item.currency, payer.amount);
    }
    for (const share of item.shares) {
      if (share.userId === userId) addTo(summary.share, item.currency, share.amount);
    }
  }
  return summary;
}
