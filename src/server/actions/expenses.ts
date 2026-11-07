"use server";

import { revalidatePath } from "next/cache";
import type { ExpenseInput, SettlementInput } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { type Database, getDb } from "../db/client";
import { groups } from "../db/schema";
import { createExpense, deleteExpense, type SavedExpense, updateExpense } from "../services/expenses";
import { notifyExpense, notifySettlement } from "../services/notifications";
import { createSettlement, deleteSettlement } from "../services/settlements";
import { type ActionResult, runAction } from "./result";

/** How an email names where something happened: the group, or the one to one hisab. */
async function contextName(db: Database, groupId: string | null): Promise<string> {
  if (!groupId) return "your one to one hisab";
  const group = await db.query.groups.findFirst({ where: eq(groups.id, groupId), columns: { name: true } });
  return group ? `"${group.name}"` : "a group";
}

function returnPath(expense: Pick<SavedExpense, "context">, viewerId: string): string {
  if (expense.context.groupId) return `/groups/${expense.context.groupId}`;
  const other = expense.context.pair?.find((id) => id !== viewerId);
  return other ? `/people/${other}` : "/dashboard";
}

export async function saveExpenseAction(
  input: ExpenseInput,
  expenseId?: string,
): Promise<ActionResult<{ expenseId: string; returnTo: string }>> {
  return runAction(async (viewer) => {
    const db = getDb();
    const saved = expenseId
      ? await updateExpense(db, viewer.id, expenseId, input)
      : await createExpense(db, viewer.id, input);
    if (!expenseId) notifyExpense(db, viewer, saved, await contextName(db, saved.context.groupId));
    revalidatePath("/", "layout");
    return { expenseId: saved.id, returnTo: returnPath(saved, viewer.id) };
  });
}

export async function deleteExpenseAction(expenseId: string): Promise<ActionResult<{ returnTo: string }>> {
  return runAction(async (viewer) => {
    const context = await deleteExpense(getDb(), viewer.id, expenseId);
    revalidatePath("/", "layout");
    return { returnTo: returnPath({ context }, viewer.id) };
  });
}

export async function recordPaymentAction(input: SettlementInput): Promise<ActionResult<{ returnTo: string }>> {
  return runAction(async (viewer) => {
    const db = getDb();
    const saved = await createSettlement(db, viewer.id, input);
    const other = saved.fromUserId === viewer.id ? saved.toUserId : saved.fromUserId;
    notifySettlement(db, viewer, saved, await contextName(db, saved.groupId));
    revalidatePath("/", "layout");
    return { returnTo: saved.groupId ? `/groups/${saved.groupId}` : `/people/${other}` };
  });
}

export async function deletePaymentAction(settlementId: string): Promise<ActionResult> {
  return runAction(async (viewer) => {
    await deleteSettlement(getDb(), viewer.id, settlementId);
    revalidatePath("/", "layout");
    return null;
  });
}
