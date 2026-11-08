import "server-only";

import { and, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { runBatch } from "../db/batch";
import type { Database } from "../db/client";
import { friendships, type Group, groupMembers, groups, type User } from "../db/schema";
import { invalid } from "../errors";
import { activeGroupIds, orderedPair, requireConnection } from "./access";
import { activityInsert } from "./activity";
import { findOrCreateUsers, getPeople, type PersonSummary } from "./users";

export interface AddedFriend {
  user: User;
  /** A placeholder account was created for this email. */
  created: boolean;
  /** The hisab did not exist before. */
  isNew: boolean;
}

/** Starts a one to one hisab with someone, by email. */
export async function addFriend(
  db: Database,
  viewerId: string,
  person: { email: string; name?: string },
): Promise<AddedFriend> {
  const [found] = await findOrCreateUsers(db, [person]);
  if (!found) throw invalid("Enter a valid email address.");
  if (found.user.id === viewerId) throw invalid("That is your own email address.");
  const [userA, userB] = orderedPair(viewerId, found.user.id);
  const existing = await db
    .select({ userA: friendships.userA })
    .from(friendships)
    .where(and(eq(friendships.userA, userA), eq(friendships.userB, userB)))
    .limit(1);
  if (existing.length > 0) return { ...found, isNew: false };

  await runBatch(db, [
    db.insert(friendships).values({ userA, userB, createdBy: viewerId }).onConflictDoNothing(),
    activityInsert(db, {
      type: "friend.added",
      actorId: viewerId,
      visibility: "pair",
      pair: [userA, userB],
      targetUserId: found.user.id,
    }),
  ]);
  return { ...found, isNew: true };
}

/**
 * Everyone the viewer knows in Khata: people they keep a one to one hisab
 * with, and people in their active groups.
 */
export async function listConnectedPeople(db: Database, viewerId: string): Promise<Map<string, PersonSummary>> {
  const [friendRows, memberRows] = await db.batch([
    db
      .select({ userA: friendships.userA, userB: friendships.userB })
      .from(friendships)
      .where(or(eq(friendships.userA, viewerId), eq(friendships.userB, viewerId))),
    db
      .selectDistinct({ userId: groupMembers.userId })
      .from(groupMembers)
      .where(
        and(
          isNull(groupMembers.leftAt),
          inArray(groupMembers.groupId, activeGroupIds(db, viewerId)),
          ne(groupMembers.userId, viewerId),
        ),
      ),
  ]);
  const ids = new Set<string>();
  for (const row of friendRows) ids.add(row.userA === viewerId ? row.userB : row.userA);
  for (const row of memberRows) ids.add(row.userId);
  const people = await getPeople(db, [...ids]);
  // Deleting an account needs every balance settled, so there is nothing left to show.
  for (const [id, person] of people) if (person.deleted) people.delete(id);
  return people;
}

/** A person the viewer is connected to, or "not found". */
export async function getConnectedPerson(db: Database, viewerId: string, personId: string): Promise<PersonSummary> {
  await requireConnection(db, viewerId, personId);
  const person = (await getPeople(db, [personId])).get(personId);
  if (!person) throw invalid("That person could not be found.");
  return person;
}

/** Groups both people are active members of. */
export async function listSharedGroups(db: Database, viewerId: string, personId: string): Promise<Group[]> {
  const theirs = db
    .select({ id: groupMembers.groupId })
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, personId), isNull(groupMembers.leftAt)));
  return db
    .select()
    .from(groups)
    .where(
      and(isNull(groups.deletedAt), inArray(groups.id, activeGroupIds(db, viewerId)), inArray(groups.id, theirs)),
    )
    .orderBy(groups.name);
}

export async function isFriend(db: Database, viewerId: string, personId: string): Promise<boolean> {
  const [userA, userB] = orderedPair(viewerId, personId);
  const rows = await db
    .select({ userA: friendships.userA })
    .from(friendships)
    .where(and(eq(friendships.userA, userA), eq(friendships.userB, userB)))
    .limit(1);
  return rows.length > 0;
}
