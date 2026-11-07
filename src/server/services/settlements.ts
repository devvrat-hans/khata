import "server-only";

import type { BatchItem } from "drizzle-orm/batch";
import { and, eq, isNull } from "drizzle-orm";
import { parseAmount } from "@/domain/money";
import { firstIssue, type SettlementInput, settlementInputSchema } from "@/lib/validation";
import { runBatch } from "../db/batch";
import type { Database } from "../db/client";
import { friendships, type Settlement, settlements, type Visibility } from "../db/schema";
import { invalid, notFound } from "../errors";
import { newId } from "../ids";
import { activeMemberIds, orderedPair, requireConnection, requireMembership } from "./access";
import { activityInsert } from "./activity";

export interface SavedSettlement {
  id: string;
  groupId: string | null;
  visibility: Visibility;
  pair: [string, string] | null;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
}

/**
 * Records a payment between two people.
 *
 * In a group, any member may record a payment between two members, as with
 * expenses. A private payment, and a one to one payment, can only be recorded
 * by one of the two people.
 */
export async function createSettlement(db: Database, viewerId: string, raw: SettlementInput): Promise<SavedSettlement> {
  const parsed = settlementInputSchema.safeParse(raw);
  if (!parsed.success) throw invalid(firstIssue(parsed.error));
  const input = parsed.data;

  if (input.fromUserId === input.toUserId) throw invalid("A payment needs two different people.");
  const amount = parseAmount(input.amount, input.currency);
  if (amount === null || amount <= 0) throw invalid("Enter an amount greater than zero, like 250 or 99.50.");

  const involvesViewer = input.fromUserId === viewerId || input.toUserId === viewerId;
  let visibility: Visibility;
  let pair: [string, string] | null = null;

  if (input.groupId) {
    await requireMembership(db, input.groupId, viewerId);
    const members = await activeMemberIds(db, input.groupId);
    if (!members.has(input.fromUserId) || !members.has(input.toUserId)) {
      throw invalid("Both people have to be members of the group.");
    }
    if (input.isPrivate) {
      if (!involvesViewer) throw invalid("You can only record private payments that you made or received.");
      visibility = "pair";
      pair = orderedPair(input.fromUserId, input.toUserId);
    } else {
      visibility = "group";
    }
  } else {
    if (!involvesViewer) throw invalid("You can only record payments that you made or received.");
    const otherId = input.fromUserId === viewerId ? input.toUserId : input.fromUserId;
    await requireConnection(db, viewerId, otherId);
    visibility = "pair";
    pair = orderedPair(input.fromUserId, input.toUserId);
  }

  const id = newId();
  const statements: BatchItem<"sqlite">[] = [
    db.insert(settlements).values({
      id,
      groupId: input.groupId,
      visibility,
      pairA: pair?.[0] ?? null,
      pairB: pair?.[1] ?? null,
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
      amount,
      currency: input.currency,
      method: input.method,
      paidOn: input.date,
      note: input.note || null,
      createdBy: viewerId,
    }),
    activityInsert(db, {
      type: "settlement.created",
      actorId: viewerId,
      groupId: input.groupId,
      visibility,
      pair,
      settlementId: id,
      data: { amount, currency: input.currency, fromUserId: input.fromUserId, toUserId: input.toUserId },
    }),
  ];
  if (!input.groupId && pair) {
    statements.push(
      db.insert(friendships).values({ userA: pair[0], userB: pair[1], createdBy: viewerId }).onConflictDoNothing(),
    );
  }
  await runBatch(db, statements);

  return {
    id,
    groupId: input.groupId,
    visibility,
    pair,
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    amount,
    currency: input.currency,
  };
}

async function findVisibleSettlement(db: Database, viewerId: string, id: string): Promise<Settlement> {
  const settlement = await db.query.settlements.findFirst({
    where: and(eq(settlements.id, id), isNull(settlements.deletedAt)),
  });
  if (!settlement) throw notFound("That payment");
  if (settlement.visibility === "group") {
    if (!settlement.groupId) throw notFound("That payment");
    await requireMembership(db, settlement.groupId, viewerId);
  } else if (settlement.pairA !== viewerId && settlement.pairB !== viewerId) {
    throw notFound("That payment");
  }
  return settlement;
}

export async function getSettlementForViewer(db: Database, viewerId: string, id: string): Promise<Settlement> {
  return findVisibleSettlement(db, viewerId, id);
}

export async function deleteSettlement(db: Database, viewerId: string, id: string): Promise<Settlement> {
  const settlement = await findVisibleSettlement(db, viewerId, id);
  const pair = settlement.pairA && settlement.pairB ? ([settlement.pairA, settlement.pairB] as [string, string]) : null;
  await runBatch(db, [
    db.update(settlements).set({ deletedAt: new Date(), deletedBy: viewerId }).where(eq(settlements.id, id)),
    activityInsert(db, {
      type: "settlement.deleted",
      actorId: viewerId,
      groupId: settlement.groupId,
      visibility: settlement.visibility,
      pair,
      settlementId: id,
      data: {
        amount: settlement.amount,
        currency: settlement.currency,
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
      },
    }),
  ]);
  return settlement;
}
