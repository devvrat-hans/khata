import "server-only";

import { and, desc, eq, inArray, isNull, lt, notInArray, or, type SQL } from "drizzle-orm";
import type { Database } from "../db/client";
import { type Activity, type ActivityType, activities, type Visibility } from "../db/schema";
import { newId } from "../ids";
import { activeGroupIds, deletedGroupIds, orderedPair } from "./access";

export interface ActivityInput {
  type: ActivityType;
  actorId: string;
  groupId?: string | null;
  visibility: Visibility;
  /** The two people of a pair row. Required when visibility is "pair". */
  pair?: [string, string] | null;
  expenseId?: string | null;
  settlementId?: string | null;
  targetUserId?: string | null;
  data?: Record<string, unknown>;
}

/** An insert statement for the feed, to run in the same batch as the change. */
export function activityInsert(db: Database, input: ActivityInput) {
  const pair = input.pair ? orderedPair(input.pair[0], input.pair[1]) : null;
  return db.insert(activities).values({
    id: newId(),
    type: input.type,
    actorId: input.actorId,
    groupId: input.groupId ?? null,
    visibility: input.visibility,
    pairA: pair?.[0] ?? null,
    pairB: pair?.[1] ?? null,
    expenseId: input.expenseId ?? null,
    settlementId: input.settlementId ?? null,
    targetUserId: input.targetUserId ?? null,
    data: input.data ?? null,
  });
}

export interface ActivityQuery {
  /** Limit to one group: its shared rows and the viewer's private rows in it. */
  groupId?: string;
  /** Limit to rows between the viewer and one person. */
  personId?: string;
  /** The history of one expense. The caller has already checked the viewer can see it. */
  expenseId?: string;
  /** Only rows created before this time, for paging. */
  before?: Date;
  limit?: number;
}

/** The feed for one viewer, under the same visibility rules as expenses. */
export async function listActivity(db: Database, viewerId: string, query: ActivityQuery = {}): Promise<Activity[]> {
  const limit = Math.min(query.limit ?? 50, 100);
  const conditions: (SQL | undefined)[] = [];

  if (query.expenseId) {
    conditions.push(eq(activities.expenseId, query.expenseId));
  } else if (query.groupId) {
    conditions.push(
      eq(activities.groupId, query.groupId),
      or(
        eq(activities.visibility, "group"),
        and(eq(activities.visibility, "pair"), or(eq(activities.pairA, viewerId), eq(activities.pairB, viewerId))),
      ),
    );
  } else if (query.personId) {
    const [pairA, pairB] = orderedPair(viewerId, query.personId);
    conditions.push(
      eq(activities.visibility, "pair"),
      eq(activities.pairA, pairA),
      eq(activities.pairB, pairB),
      or(isNull(activities.groupId), notInArray(activities.groupId, deletedGroupIds(db))),
    );
  } else {
    conditions.push(
      or(
        and(eq(activities.visibility, "group"), inArray(activities.groupId, activeGroupIds(db, viewerId))),
        and(
          eq(activities.visibility, "pair"),
          or(eq(activities.pairA, viewerId), eq(activities.pairB, viewerId)),
          or(isNull(activities.groupId), notInArray(activities.groupId, deletedGroupIds(db))),
        ),
      ),
    );
  }
  if (query.before) conditions.push(lt(activities.createdAt, query.before));

  return db
    .select()
    .from(activities)
    .where(and(...conditions))
    .orderBy(desc(activities.createdAt), desc(activities.id))
    .limit(limit);
}
