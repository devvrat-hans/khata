import "server-only";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import type { Database } from "../db/client";
import { friendships, type Group, groupMembers, groups } from "../db/schema";
import { notFound } from "../errors";

/** Two user ids in the order pair columns store them. */
export function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Groups the user is an active member of, as a subquery. */
export function activeGroupIds(db: Database, userId: string) {
  return db
    .select({ id: groupMembers.groupId })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(and(eq(groupMembers.userId, userId), isNull(groupMembers.leftAt), isNull(groups.deletedAt)));
}

/** Groups that were deleted, as a subquery. */
export function deletedGroupIds(db: Database) {
  return db.select({ id: groups.id }).from(groups).where(sql`${groups.deletedAt} is not null`);
}

export interface Membership {
  group: Group;
  role: "owner" | "member";
}

/**
 * The group, if the user is an active member of it. Anyone else gets "not
 * found", so the response never confirms that a group exists.
 */
export async function requireMembership(db: Database, groupId: string, userId: string): Promise<Membership> {
  const [row] = await db
    .select({ group: groups, role: groupMembers.role })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId),
        isNull(groupMembers.leftAt),
        isNull(groups.deletedAt),
      ),
    )
    .limit(1);
  if (!row) throw notFound("That group");
  return row;
}

/** User ids of the active members of a group. */
export async function activeMemberIds(db: Database, groupId: string): Promise<Set<string>> {
  const rows = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), isNull(groupMembers.leftAt)));
  return new Set(rows.map((row) => row.userId));
}

/**
 * Whether two people know each other in Khata: they keep a one to one hisab,
 * or they are (or were) in a group together. Only connected people can see
 * each other's profile and record expenses with each other.
 */
export async function areConnected(db: Database, a: string, b: string): Promise<boolean> {
  if (a === b) return false;
  const [userA, userB] = orderedPair(a, b);
  const friendship = await db
    .select({ one: sql<number>`1` })
    .from(friendships)
    .where(and(eq(friendships.userA, userA), eq(friendships.userB, userB)))
    .limit(1);
  if (friendship.length > 0) return true;

  const mine = db.select({ id: groupMembers.groupId }).from(groupMembers).where(eq(groupMembers.userId, a));
  const shared = await db
    .select({ one: sql<number>`1` })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(and(eq(groupMembers.userId, b), isNull(groups.deletedAt), inArray(groupMembers.groupId, mine)))
    .limit(1);
  return shared.length > 0;
}

/** Throws "not found" unless the two people are connected. */
export async function requireConnection(db: Database, viewerId: string, otherId: string): Promise<void> {
  if (!(await areConnected(db, viewerId, otherId))) throw notFound("That person");
}
