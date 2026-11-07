import "server-only";

import { and, eq, inArray, isNull, notInArray, or, type SQL, sql } from "drizzle-orm";
import type { LedgerItem } from "@/domain/balances";
import type { Portion, SplitMethod } from "@/domain/split";
import type { Database } from "../db/client";
import {
  type ExpenseCategory,
  expensePayers,
  expenses,
  expenseShares,
  type PaymentMethod,
  settlements,
  type Visibility,
} from "../db/schema";
import { activeGroupIds, deletedGroupIds, orderedPair } from "./access";

export interface ExpenseRecord {
  kind: "expense";
  id: string;
  groupId: string | null;
  visibility: Visibility;
  pairA: string | null;
  pairB: string | null;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  splitMethod: SplitMethod;
  notes: string | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  payers: Portion[];
  shares: (Portion & { inputValue: number | null })[];
}

export interface SettlementRecord {
  kind: "settlement";
  id: string;
  groupId: string | null;
  visibility: Visibility;
  pairA: string | null;
  pairB: string | null;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  date: string;
  note: string | null;
  createdBy: string;
  createdAt: Date;
}

export type LedgerRecord = ExpenseRecord | SettlementRecord;

export interface Ledger {
  expenses: ExpenseRecord[];
  settlements: SettlementRecord[];
}

/** Newest first: by the date it happened, then by when it was recorded. */
export function sortRecords<T extends LedgerRecord>(records: T[]): T[] {
  return records.sort((a, b) =>
    a.date === b.date ? b.createdAt.getTime() - a.createdAt.getTime() : a.date < b.date ? 1 : -1,
  );
}

export function toLedgerItems(ledger: Ledger): LedgerItem[] {
  const items: LedgerItem[] = [];
  for (const expense of ledger.expenses) {
    items.push({ kind: "expense", currency: expense.currency, payers: expense.payers, shares: expense.shares });
  }
  for (const settlement of ledger.settlements) {
    items.push({
      kind: "payment",
      currency: settlement.currency,
      fromUserId: settlement.fromUserId,
      toUserId: settlement.toUserId,
      amount: settlement.amount,
    });
  }
  return items;
}

/** A condition that matches no rows, for loading only expenses or only payments. */
export const NONE: SQL = sql`0`;

/**
 * Loads expenses (with who paid and who shared) and payments matching the
 * given conditions, in one round trip to D1. A condition must always be
 * given: pass NONE to load nothing of that kind.
 */
export async function loadLedger(
  db: Database,
  where: { expenses: SQL | undefined; settlements: SQL | undefined },
): Promise<Ledger> {
  if (!where.expenses || !where.settlements) throw new Error("loadLedger needs a condition for both kinds");
  const expenseIds = db.select({ id: expenses.id }).from(expenses).where(where.expenses);
  const [expenseRows, payerRows, shareRows, settlementRows] = await db.batch([
    db.select().from(expenses).where(where.expenses),
    db.select().from(expensePayers).where(inArray(expensePayers.expenseId, expenseIds)),
    db.select().from(expenseShares).where(inArray(expenseShares.expenseId, expenseIds)),
    db.select().from(settlements).where(where.settlements),
  ]);

  const payersByExpense = new Map<string, Portion[]>();
  for (const row of payerRows) {
    const list = payersByExpense.get(row.expenseId) ?? [];
    list.push({ userId: row.userId, amount: row.amount });
    payersByExpense.set(row.expenseId, list);
  }
  const sharesByExpense = new Map<string, ExpenseRecord["shares"]>();
  for (const row of shareRows) {
    const list = sharesByExpense.get(row.expenseId) ?? [];
    list.push({ userId: row.userId, amount: row.amount, inputValue: row.inputValue });
    sharesByExpense.set(row.expenseId, list);
  }

  return {
    expenses: expenseRows.map((row) => ({
      kind: "expense",
      id: row.id,
      groupId: row.groupId,
      visibility: row.visibility,
      pairA: row.pairA,
      pairB: row.pairB,
      description: row.description,
      amount: row.amount,
      currency: row.currency,
      category: row.category,
      date: row.spentOn,
      splitMethod: row.splitMethod,
      notes: row.notes,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      payers: payersByExpense.get(row.id) ?? [],
      shares: sharesByExpense.get(row.id) ?? [],
    })),
    settlements: settlementRows.map((row) => ({
      kind: "settlement",
      id: row.id,
      groupId: row.groupId,
      visibility: row.visibility,
      pairA: row.pairA,
      pairB: row.pairB,
      fromUserId: row.fromUserId,
      toUserId: row.toUserId,
      amount: row.amount,
      currency: row.currency,
      method: row.method,
      date: row.paidOn,
      note: row.note,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Visibility conditions                                                       */
/* -------------------------------------------------------------------------- */

type LedgerTable = typeof expenses | typeof settlements;

/** Rows shared with the whole group. */
function groupPublic(table: LedgerTable, groupId: string): SQL | undefined {
  return and(eq(table.groupId, groupId), eq(table.visibility, "group"), isNull(table.deletedAt));
}

/** Pair rows between two people, optionally limited to one group. */
function pairRows(
  db: Database,
  table: LedgerTable,
  a: string,
  b: string,
  groupId?: string | null,
): SQL | undefined {
  const [pairA, pairB] = orderedPair(a, b);
  const scope =
    groupId === undefined
      ? or(isNull(table.groupId), notInArray(table.groupId, deletedGroupIds(db)))
      : groupId === null
        ? isNull(table.groupId)
        : eq(table.groupId, groupId);
  return and(
    eq(table.visibility, "pair"),
    eq(table.pairA, pairA),
    eq(table.pairB, pairB),
    isNull(table.deletedAt),
    scope,
  );
}

/** Everything a user may see: public rows of their groups and their own pair rows. */
function visibleTo(db: Database, table: LedgerTable, userId: string): SQL | undefined {
  return and(
    isNull(table.deletedAt),
    or(
      and(eq(table.visibility, "group"), inArray(table.groupId, activeGroupIds(db, userId))),
      and(
        eq(table.visibility, "pair"),
        or(eq(table.pairA, userId), eq(table.pairB, userId)),
        or(isNull(table.groupId), notInArray(table.groupId, deletedGroupIds(db))),
      ),
    ),
  );
}

/** The private rows of one user inside a group, with anyone. */
function viewerPairRowsInGroup(table: LedgerTable, groupId: string, userId: string): SQL | undefined {
  return and(
    eq(table.groupId, groupId),
    eq(table.visibility, "pair"),
    or(eq(table.pairA, userId), eq(table.pairB, userId)),
    isNull(table.deletedAt),
  );
}

/* -------------------------------------------------------------------------- */
/* Loaders                                                                     */
/* -------------------------------------------------------------------------- */

/** What the whole group sees. */
export function loadGroupPublicLedger(db: Database, groupId: string): Promise<Ledger> {
  return loadLedger(db, { expenses: groupPublic(expenses, groupId), settlements: groupPublic(settlements, groupId) });
}

/** The viewer's private hisabs inside one group. */
export function loadViewerPrivateLedgerInGroup(db: Database, groupId: string, viewerId: string): Promise<Ledger> {
  return loadLedger(db, {
    expenses: viewerPairRowsInGroup(expenses, groupId, viewerId),
    settlements: viewerPairRowsInGroup(settlements, groupId, viewerId),
  });
}

/** Every pair row between two people: one to one and private ones in groups. */
export function loadPairLedger(db: Database, a: string, b: string, groupId?: string | null): Promise<Ledger> {
  return loadLedger(db, {
    expenses: pairRows(db, expenses, a, b, groupId),
    settlements: pairRows(db, settlements, a, b, groupId),
  });
}

/** Everything the viewer can see, across all groups and people. */
export function loadViewerLedger(db: Database, viewerId: string): Promise<Ledger> {
  return loadLedger(db, {
    expenses: visibleTo(db, expenses, viewerId),
    settlements: visibleTo(db, settlements, viewerId),
  });
}
