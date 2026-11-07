import "server-only";

import type { BatchItem } from "drizzle-orm/batch";
import { and, eq, isNull } from "drizzle-orm";
import { formatMoney, parseAmount, parseDecimal } from "@/domain/money";
import {
  checkPayers,
  computeSplit,
  describeSplitError,
  type Portion,
  type SplitEntry,
  type SplitMethod,
} from "@/domain/split";
import { type ExpenseInput, expenseInputSchema, firstIssue } from "@/lib/validation";
import { runBatch } from "../db/batch";
import type { Database } from "../db/client";
import { type Expense, expensePayers, expenses, expenseShares, friendships, type Visibility } from "../db/schema";
import { invalid, notFound } from "../errors";
import { newId } from "../ids";
import { activeMemberIds, orderedPair, requireConnection, requireMembership } from "./access";
import { activityInsert } from "./activity";
import { type ExpenseRecord, loadLedger, NONE } from "./ledger";

/** Where an expense lives and who may see it. Fixed once the expense exists. */
export interface ExpenseContext {
  groupId: string | null;
  visibility: Visibility;
  /** The two people of a pair expense, ordered. */
  pair: [string, string] | null;
  /** People who may appear on the expense. */
  allowed: Set<string>;
}

export interface SavedExpense {
  id: string;
  context: ExpenseContext;
  description: string;
  amount: number;
  currency: string;
  payers: Portion[];
  shares: Portion[];
}

/**
 * Works out the context of a new expense from the form and checks the viewer
 * may use it:
 * - a group expense: the viewer and everyone on it are members of the group
 * - a private hisab in a group: only the viewer and one other member
 * - a one to one hisab: only the viewer and a person they are connected to
 */
async function resolveNewContext(
  db: Database,
  viewerId: string,
  input: { groupId: string | null; personId: string | null; isPrivate: boolean },
): Promise<ExpenseContext> {
  if (input.groupId) {
    await requireMembership(db, input.groupId, viewerId);
    const members = await activeMemberIds(db, input.groupId);
    if (!input.isPrivate) return { groupId: input.groupId, visibility: "group", pair: null, allowed: members };
    if (!input.personId || input.personId === viewerId || !members.has(input.personId)) {
      throw invalid("Choose the group member this private hisab is with.");
    }
    return {
      groupId: input.groupId,
      visibility: "pair",
      pair: orderedPair(viewerId, input.personId),
      allowed: new Set([viewerId, input.personId]),
    };
  }
  if (!input.personId || input.personId === viewerId) throw invalid("Choose who this expense is with.");
  await requireConnection(db, viewerId, input.personId);
  return {
    groupId: null,
    visibility: "pair",
    pair: orderedPair(viewerId, input.personId),
    allowed: new Set([viewerId, input.personId]),
  };
}

/** The context of an existing expense, if the viewer may change it. */
async function resolveExistingContext(db: Database, viewerId: string, expense: Expense): Promise<ExpenseContext> {
  if (expense.visibility === "group") {
    if (!expense.groupId) throw notFound("That expense");
    await requireMembership(db, expense.groupId, viewerId);
    return {
      groupId: expense.groupId,
      visibility: "group",
      pair: null,
      allowed: await activeMemberIds(db, expense.groupId),
    };
  }
  if (!expense.pairA || !expense.pairB || (expense.pairA !== viewerId && expense.pairB !== viewerId)) {
    throw notFound("That expense");
  }
  return {
    groupId: expense.groupId,
    visibility: "pair",
    pair: [expense.pairA, expense.pairB],
    allowed: new Set([expense.pairA, expense.pairB]),
  };
}

function splitValue(method: SplitMethod, raw: string | undefined, currency: string): number | undefined | null {
  if (method === "equal") return undefined;
  const value = (raw ?? "").trim();
  if (value === "") return 0;
  if (method === "exact") return parseAmount(value, currency);
  // Percent as basis points (12.5 -> 1250), shares as hundredths (1.5 -> 150).
  return parseDecimal(value, 2, method === "percent" ? 10_000 : 100_000_000);
}

/** Turns the form into exact payer and share amounts, or explains what is wrong. */
export function computeExpenseAmounts(input: ReturnType<typeof expenseInputSchema.parse>) {
  const total = parseAmount(input.amount, input.currency);
  if (total === null || total <= 0) throw invalid("Enter an amount greater than zero, like 250 or 99.50.");
  const format = (minor: number) => formatMoney(minor, input.currency);

  let payers: Portion[];
  if (input.payers.length === 1) {
    const [payer] = input.payers;
    payers = [{ userId: payer?.userId ?? "", amount: total }];
  } else {
    payers = [];
    for (const payer of input.payers) {
      const amount = (payer.amount ?? "").trim() === "" ? 0 : parseAmount(payer.amount ?? "", input.currency);
      if (amount === null) throw invalid("One of the paid amounts is not a valid number.");
      payers.push({ userId: payer.userId, amount });
    }
  }
  const payerResult = checkPayers(total, payers);
  if (!payerResult.ok) throw invalid(describeSplitError(payerResult.error, format));

  const entries: SplitEntry[] = [];
  for (const participant of input.participants) {
    const value = splitValue(input.splitMethod, participant.value, input.currency);
    if (value === null) throw invalid("One of the split values is not a valid number.");
    entries.push({ userId: participant.userId, value });
  }
  const splitResult = computeSplit(total, input.splitMethod, entries);
  if (!splitResult.ok) throw invalid(describeSplitError(splitResult.error, format));

  const inputValues = new Map(entries.map((entry) => [entry.userId, entry.value ?? null]));
  return {
    total,
    payers: payerResult.portions,
    shares: splitResult.portions.map((portion) => ({
      ...portion,
      inputValue: input.splitMethod === "equal" ? null : (inputValues.get(portion.userId) ?? null),
    })),
  };
}

function checkPeople(context: ExpenseContext, payers: Portion[], shares: Portion[]): void {
  for (const portion of [...payers, ...shares]) {
    if (!context.allowed.has(portion.userId)) {
      throw invalid(
        context.visibility === "pair"
          ? "A private hisab can only include the two people it is between."
          : "Everyone on the expense has to be a member of the group.",
      );
    }
  }
}

function parseInput(raw: ExpenseInput) {
  const parsed = expenseInputSchema.safeParse(raw);
  if (!parsed.success) throw invalid(firstIssue(parsed.error));
  return parsed.data;
}

export async function createExpense(db: Database, viewerId: string, raw: ExpenseInput): Promise<SavedExpense> {
  const input = parseInput(raw);
  const context = await resolveNewContext(db, viewerId, input);
  const { total, payers, shares } = computeExpenseAmounts(input);
  checkPeople(context, payers, shares);

  const id = newId();
  const statements: BatchItem<"sqlite">[] = [
    db.insert(expenses).values({
      id,
      groupId: context.groupId,
      visibility: context.visibility,
      pairA: context.pair?.[0] ?? null,
      pairB: context.pair?.[1] ?? null,
      description: input.description,
      amount: total,
      currency: input.currency,
      category: input.category,
      spentOn: input.date,
      splitMethod: input.splitMethod,
      notes: input.notes || null,
      createdBy: viewerId,
    }),
    db.insert(expensePayers).values(payers.map((payer) => ({ expenseId: id, ...payer }))),
    db.insert(expenseShares).values(shares.map((share) => ({ expenseId: id, ...share }))),
    activityInsert(db, {
      type: "expense.created",
      actorId: viewerId,
      groupId: context.groupId,
      visibility: context.visibility,
      pair: context.pair,
      expenseId: id,
      data: { description: input.description, amount: total, currency: input.currency },
    }),
  ];
  // Recording an expense with someone makes them part of your people list.
  if (context.groupId === null && context.pair) {
    statements.push(
      db
        .insert(friendships)
        .values({ userA: context.pair[0], userB: context.pair[1], createdBy: viewerId })
        .onConflictDoNothing(),
    );
  }
  await runBatch(db, statements);

  return {
    id,
    context,
    description: input.description,
    amount: total,
    currency: input.currency,
    payers,
    shares: shares.map(({ userId, amount }) => ({ userId, amount })),
  };
}

async function findExpense(db: Database, id: string): Promise<Expense> {
  const expense = await db.query.expenses.findFirst({ where: and(eq(expenses.id, id), isNull(expenses.deletedAt)) });
  if (!expense) throw notFound("That expense");
  return expense;
}

export async function updateExpense(
  db: Database,
  viewerId: string,
  expenseId: string,
  raw: ExpenseInput,
): Promise<SavedExpense> {
  const input = parseInput(raw);
  const expense = await findExpense(db, expenseId);
  const context = await resolveExistingContext(db, viewerId, expense);
  if (context.visibility === "group") {
    // People who have since left the group can stay on an old expense.
    const current = await loadLedger(db, { expenses: eq(expenses.id, expenseId), settlements: NONE });
    for (const portion of [...(current.expenses[0]?.payers ?? []), ...(current.expenses[0]?.shares ?? [])]) {
      context.allowed.add(portion.userId);
    }
  }
  const { total, payers, shares } = computeExpenseAmounts(input);
  checkPeople(context, payers, shares);

  await runBatch(db, [
    db
      .update(expenses)
      .set({
        description: input.description,
        amount: total,
        currency: input.currency,
        category: input.category,
        spentOn: input.date,
        splitMethod: input.splitMethod,
        notes: input.notes || null,
        updatedBy: viewerId,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, expenseId)),
    db.delete(expensePayers).where(eq(expensePayers.expenseId, expenseId)),
    db.delete(expenseShares).where(eq(expenseShares.expenseId, expenseId)),
    db.insert(expensePayers).values(payers.map((payer) => ({ expenseId, ...payer }))),
    db.insert(expenseShares).values(shares.map((share) => ({ expenseId, ...share }))),
    activityInsert(db, {
      type: "expense.updated",
      actorId: viewerId,
      groupId: context.groupId,
      visibility: context.visibility,
      pair: context.pair,
      expenseId,
      data: {
        description: input.description,
        amount: total,
        currency: input.currency,
        previousAmount: expense.amount,
        previousCurrency: expense.currency,
      },
    }),
  ]);

  return {
    id: expenseId,
    context,
    description: input.description,
    amount: total,
    currency: input.currency,
    payers,
    shares: shares.map(({ userId, amount }) => ({ userId, amount })),
  };
}

export async function deleteExpense(db: Database, viewerId: string, expenseId: string): Promise<ExpenseContext> {
  const expense = await findExpense(db, expenseId);
  const context = await resolveExistingContext(db, viewerId, expense);
  await runBatch(db, [
    db.update(expenses).set({ deletedAt: new Date(), deletedBy: viewerId }).where(eq(expenses.id, expenseId)),
    activityInsert(db, {
      type: "expense.deleted",
      actorId: viewerId,
      groupId: context.groupId,
      visibility: context.visibility,
      pair: context.pair,
      expenseId,
      data: { description: expense.description, amount: expense.amount, currency: expense.currency },
    }),
  ]);
  return context;
}

/** One expense, if the viewer may see it. */
export async function getExpenseForViewer(db: Database, viewerId: string, expenseId: string): Promise<ExpenseRecord> {
  const expense = await findExpense(db, expenseId);
  await resolveExistingContext(db, viewerId, expense).catch(() => {
    throw notFound("That expense");
  });
  const ledger = await loadLedger(db, { expenses: eq(expenses.id, expenseId), settlements: NONE });
  const record = ledger.expenses[0];
  if (!record) throw notFound("That expense");
  return record;
}

/** Whether the viewer may edit or delete an expense they can see. */
export function canChangeExpense(record: ExpenseRecord, viewerId: string, viewerIsMember: boolean): boolean {
  if (record.visibility === "pair") return record.pairA === viewerId || record.pairB === viewerId;
  return viewerIsMember;
}
