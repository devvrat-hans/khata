import { describe, expect, it } from "vitest";
import {
  balanceBetween,
  groupDebts,
  type LedgerItem,
  netBalances,
  netForUser,
  pairwiseDebts,
  simplifyNet,
  spendingSummary,
  splitDirections,
} from "./balances";

const expense = (
  currency: string,
  payers: Record<string, number>,
  shares: Record<string, number>,
): LedgerItem => ({
  kind: "expense",
  currency,
  payers: Object.entries(payers).map(([userId, amount]) => ({ userId, amount })),
  shares: Object.entries(shares).map(([userId, amount]) => ({ userId, amount })),
});

const payment = (currency: string, fromUserId: string, toUserId: string, amount: number): LedgerItem => ({
  kind: "payment",
  currency,
  fromUserId,
  toUserId,
  amount,
});

describe("netBalances", () => {
  it("credits payers and debits sharers", () => {
    const net = netBalances([expense("INR", { a: 900 }, { a: 300, b: 300, c: 300 })]);
    expect(net).toEqual({ INR: { a: 600, b: -300, c: -300 } });
  });

  it("keeps currencies apart", () => {
    const net = netBalances([
      expense("INR", { a: 200 }, { a: 100, b: 100 }),
      expense("USD", { b: 50 }, { a: 25, b: 25 }),
    ]);
    expect(net).toEqual({ INR: { a: 100, b: -100 }, USD: { a: -25, b: 25 } });
  });

  it("moves balances back when someone pays up", () => {
    const net = netBalances([expense("INR", { a: 200 }, { a: 100, b: 100 }), payment("INR", "b", "a", 100)]);
    expect(net).toEqual({});
  });
});

describe("simplifyNet", () => {
  it("needs at most n - 1 payments", () => {
    const debts = simplifyNet({ a: 500, b: 300, c: -400, d: -400 });
    expect(debts.length).toBeLessThanOrEqual(3);
    const net: Record<string, number> = {};
    for (const debt of debts) {
      net[debt.fromUserId] = (net[debt.fromUserId] ?? 0) - debt.amount;
      net[debt.toUserId] = (net[debt.toUserId] ?? 0) + debt.amount;
    }
    expect(net).toEqual({ a: 500, b: 300, c: -400, d: -400 });
  });

  it("collapses a chain into one payment", () => {
    // a owes b 100, b owes c 100: a can pay c directly.
    const items = [expense("INR", { b: 100 }, { a: 100 }), expense("INR", { c: 100 }, { b: 100 })];
    expect(groupDebts(items, true)).toEqual({ INR: [{ fromUserId: "a", toUserId: "c", amount: 100 }] });
    expect(groupDebts(items, false).INR).toHaveLength(2);
  });

  it("is stable on ties", () => {
    const first = simplifyNet({ x: 100, y: 100, p: -100, q: -100 });
    const second = simplifyNet({ q: -100, p: -100, y: 100, x: 100 });
    expect(first).toEqual(second);
  });
});

describe("pairwiseDebts", () => {
  it("nets debts between the same two people", () => {
    const debts = pairwiseDebts([
      expense("INR", { a: 1000 }, { a: 500, b: 500 }),
      expense("INR", { b: 400 }, { a: 200, b: 200 }),
    ]);
    expect(debts).toEqual({ INR: [{ fromUserId: "b", toUserId: "a", amount: 300 }] });
  });

  it("handles several payers in one expense", () => {
    // a paid 600, b paid 400; split three ways is 334/333/333.
    const debts = pairwiseDebts([expense("INR", { a: 600, b: 400 }, { a: 334, b: 333, c: 333 })]);
    const net = netForUser(debts, "c");
    expect(net).toEqual({ INR: -333 });
    expect(netForUser(debts, "a")).toEqual({ INR: 266 });
    expect(netForUser(debts, "b")).toEqual({ INR: 67 });
  });

  it("agrees with net balances", () => {
    const items = [
      expense("INR", { a: 1200 }, { a: 400, b: 400, c: 400 }),
      expense("INR", { b: 900, c: 300 }, { a: 300, b: 300, c: 300, d: 300 }),
      payment("INR", "d", "b", 150),
      expense("INR", { d: 50 }, { a: 50 }),
    ];
    const net = netBalances(items).INR ?? {};
    const debts = pairwiseDebts(items);
    for (const user of ["a", "b", "c", "d"]) {
      expect(netForUser(debts, user).INR ?? 0).toBe(net[user] ?? 0);
    }
  });

  it("treats an overpayment as a debt in the other direction", () => {
    const debts = pairwiseDebts([expense("INR", { a: 100 }, { b: 100 }), payment("INR", "b", "a", 150)]);
    expect(debts).toEqual({ INR: [{ fromUserId: "a", toUserId: "b", amount: 50 }] });
  });
});

describe("balanceBetween and splitDirections", () => {
  it("reads one pair out of the debts", () => {
    const debts = groupDebts([expense("INR", { a: 300 }, { a: 100, b: 100, c: 100 })], false);
    expect(balanceBetween(debts, "a", "b")).toEqual({ INR: 100 });
    expect(balanceBetween(debts, "b", "a")).toEqual({ INR: -100 });
    expect(balanceBetween(debts, "b", "c")).toEqual({});
  });

  it("separates what is owed from what is owing", () => {
    expect(splitDirections({ INR: -500, USD: 20 })).toEqual({ owes: { INR: 500 }, owed: { USD: 20 } });
  });
});

describe("spendingSummary", () => {
  it("adds up totals, what was paid and the user's share", () => {
    const summary = spendingSummary(
      [expense("INR", { a: 900 }, { a: 300, b: 600 }), payment("INR", "b", "a", 600)],
      "b",
    );
    expect(summary).toEqual({ total: { INR: 900 }, paid: {}, share: { INR: 600 } });
  });
});
