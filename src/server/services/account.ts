import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { isZero } from "@/domain/money";
import { firstIssue, type ProfileInput, profileInputSchema } from "@/lib/validation";
import { runBatch } from "../db/batch";
import type { Database } from "../db/client";
import { account, groupMembers, session, user } from "../db/schema";
import { conflict, invalid } from "../errors";
import { computeViewerBalances } from "./balances";
import { listGroups } from "./groups";
import { loadViewerLedger } from "./ledger";

function parseProfile(raw: ProfileInput) {
  const parsed = profileInputSchema.safeParse(raw);
  if (!parsed.success) throw invalid(firstIssue(parsed.error));
  return parsed.data;
}

export async function updateProfile(db: Database, viewerId: string, raw: ProfileInput): Promise<void> {
  const input = parseProfile(raw);
  await db
    .update(user)
    .set({
      name: input.name,
      defaultCurrency: input.defaultCurrency,
      upiId: input.upiId || null,
      emailNotifications: input.emailNotifications,
      updatedAt: new Date(),
    })
    .where(eq(user.id, viewerId));
}

/** Saves the details asked for on the welcome page and marks onboarding done. */
export async function completeOnboarding(db: Database, viewerId: string, raw: ProfileInput): Promise<void> {
  const input = parseProfile(raw);
  await db
    .update(user)
    .set({
      name: input.name,
      defaultCurrency: input.defaultCurrency,
      upiId: input.upiId || null,
      emailNotifications: input.emailNotifications,
      onboardedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(user.id, viewerId));
}

/**
 * Deletes an account. Only possible when every balance is settled, so nobody
 * is left with money they cannot collect.
 *
 * The row is kept, without name or email, because other people's expenses
 * still point to it. Sign-in methods and sessions are removed, and the person
 * leaves every group.
 */
export async function deleteAccount(db: Database, viewerId: string): Promise<void> {
  const groups = await listGroups(db, viewerId);
  const settings = new Map(groups.map((item) => [item.group.id, { simplifyDebts: item.group.simplifyDebts }]));
  const balances = computeViewerBalances(viewerId, await loadViewerLedger(db, viewerId), settings);
  if (!isZero(balances.owes) || !isZero(balances.owed)) {
    throw conflict("Settle up with everyone before deleting your account.");
  }

  const now = new Date();
  await runBatch(db, [
    db
      .update(groupMembers)
      .set({ leftAt: now })
      .where(and(eq(groupMembers.userId, viewerId), isNull(groupMembers.leftAt))),
    db.delete(session).where(eq(session.userId, viewerId)),
    db.delete(account).where(eq(account.userId, viewerId)),
    db
      .update(user)
      .set({
        name: "Deleted account",
        email: `deleted-${viewerId}@deleted.khata.invalid`,
        emailVerified: false,
        image: null,
        upiId: null,
        emailNotifications: false,
        deletedAt: now,
        updatedAt: now,
      })
      .where(eq(user.id, viewerId)),
  ]);
}
