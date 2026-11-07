import "server-only";

import { and, eq, gt } from "drizzle-orm";
import type { MoneyByCurrency } from "@/domain/money";
import type { Database } from "../db/client";
import { reminders } from "../db/schema";
import { conflict, invalid } from "../errors";
import { newId } from "../ids";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** When the viewer last reminded this person, if within the last day. */
export async function lastReminder(db: Database, fromUserId: string, toUserId: string): Promise<Date | null> {
  const [row] = await db
    .select({ createdAt: reminders.createdAt })
    .from(reminders)
    .where(
      and(
        eq(reminders.fromUserId, fromUserId),
        eq(reminders.toUserId, toUserId),
        gt(reminders.createdAt, new Date(Date.now() - ONE_DAY_MS)),
      ),
    )
    .limit(1);
  return row?.createdAt ?? null;
}

/**
 * Records a reminder, at most one a day per pair. `balance` is what the other
 * person owes the viewer (positive), as shown on the person's page.
 */
export async function recordReminder(
  db: Database,
  fromUserId: string,
  toUserId: string,
  balance: MoneyByCurrency,
): Promise<MoneyByCurrency> {
  const owed: MoneyByCurrency = {};
  for (const [currency, amount] of Object.entries(balance)) if (amount > 0) owed[currency] = amount;
  if (Object.keys(owed).length === 0) throw invalid("This person does not owe you anything right now.");
  if (await lastReminder(db, fromUserId, toUserId)) {
    throw conflict("You already sent a reminder in the last 24 hours.");
  }
  await db.insert(reminders).values({ id: newId(), fromUserId, toUserId });
  return owed;
}
