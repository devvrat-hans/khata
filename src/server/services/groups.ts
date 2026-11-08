import "server-only";

import type { BatchItem } from "drizzle-orm/batch";
import { and, asc, eq, isNull, ne, sql } from "drizzle-orm";
import { isZero, type MoneyByCurrency } from "@/domain/money";
import { type GroupInput, type GroupSettingsInput, groupInputSchema, groupSettingsSchema } from "@/lib/validation";
import { runBatch } from "../db/batch";
import type { Database } from "../db/client";
import { expenses, type Group, groupMembers, groups, settlements, type User, user } from "../db/schema";
import { conflict, forbidden, invalid, notFound } from "../errors";
import { newId, newInviteCode } from "../ids";
import { requireMembership } from "./access";
import { activityInsert } from "./activity";
import { computeGroupDebts, computePairBalances } from "./balances";
import { loadGroupPublicLedger, loadLedger } from "./ledger";
import { findOrCreateUsers, type PersonSummary, toPersonSummary } from "./users";

export interface GroupMemberView extends PersonSummary {
  role: "owner" | "member";
  addedAt: Date;
}

export interface GroupListItem {
  group: Group;
  memberCount: number;
}

/** The viewer's active groups, most recently changed first. */
export async function listGroups(db: Database, viewerId: string): Promise<GroupListItem[]> {
  const counts = db
    .select({ groupId: groupMembers.groupId, count: sql<number>`count(*)`.as("count") })
    .from(groupMembers)
    .where(isNull(groupMembers.leftAt))
    .groupBy(groupMembers.groupId)
    .as("counts");

  const rows = await db
    .select({ group: groups, memberCount: counts.count })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .leftJoin(counts, eq(counts.groupId, groups.id))
    .where(and(eq(groupMembers.userId, viewerId), isNull(groupMembers.leftAt), isNull(groups.deletedAt)))
    .orderBy(sql`${groups.updatedAt} desc`);

  return rows.map((row) => ({ group: row.group, memberCount: Number(row.memberCount ?? 1) }));
}

/** Active members of a group, owner first, then by when they were added. */
export async function listMembers(db: Database, groupId: string): Promise<GroupMemberView[]> {
  const rows = await db
    .select({ member: groupMembers, user })
    .from(groupMembers)
    .innerJoin(user, eq(user.id, groupMembers.userId))
    .where(and(eq(groupMembers.groupId, groupId), isNull(groupMembers.leftAt)))
    .orderBy(asc(groupMembers.createdAt));
  // Owners first, then by when they were added. People added together share a
  // timestamp, so name and id break the tie and keep the order stable.
  return rows
    .map((row) => ({ ...toPersonSummary(row.user), role: row.member.role, addedAt: row.member.createdAt }))
    .sort(
      (a, b) =>
        (a.role === b.role ? 0 : a.role === "owner" ? -1 : 1) ||
        a.addedAt.getTime() - b.addedAt.getTime() ||
        a.name.localeCompare(b.name) ||
        a.id.localeCompare(b.id),
    );
}

/** Everyone who was ever in the group, for naming people on old expenses. */
export async function listAllMemberIds(db: Database, groupId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));
  return rows.map((row) => row.userId);
}

export interface AddedPerson {
  user: User;
  created: boolean;
  /** False when they were already a member. */
  added: boolean;
}

export async function createGroup(
  db: Database,
  viewerId: string,
  rawInput: GroupInput,
): Promise<{ group: Group; added: AddedPerson[] }> {
  const input = groupInputSchema.parse(rawInput);
  const people = await findOrCreateUsers(
    db,
    input.members.map((member) => ({ email: member.email, name: member.name })),
  );
  const others = people.filter((person) => person.user.id !== viewerId);

  const groupId = newId();
  const group: Group = {
    id: groupId,
    name: input.name,
    kind: input.kind,
    currency: input.currency,
    simplifyDebts: true,
    inviteCode: newInviteCode(),
    createdBy: viewerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  await runBatch(db, [
    db.insert(groups).values(group),
    db.insert(groupMembers).values([
      { groupId, userId: viewerId, role: "owner", addedBy: viewerId },
      ...others.map((person) => ({ groupId, userId: person.user.id, role: "member" as const, addedBy: viewerId })),
    ]),
    activityInsert(db, {
      type: "group.created",
      actorId: viewerId,
      groupId,
      visibility: "group",
      data: { name: input.name },
    }),
    ...others.map((person) =>
      activityInsert(db, {
        type: "member.added",
        actorId: viewerId,
        groupId,
        visibility: "group",
        targetUserId: person.user.id,
      }),
    ),
  ]);

  return { group, added: others.map((person) => ({ ...person, added: true })) };
}

export async function updateGroup(
  db: Database,
  viewerId: string,
  groupId: string,
  rawInput: GroupSettingsInput,
): Promise<void> {
  const input = groupSettingsSchema.parse(rawInput);
  const { group } = await requireMembership(db, groupId, viewerId);
  await runBatch(db, [
    db
      .update(groups)
      .set({
        name: input.name,
        kind: input.kind,
        currency: input.currency,
        simplifyDebts: input.simplifyDebts,
        updatedAt: new Date(),
      })
      .where(eq(groups.id, groupId)),
    activityInsert(db, {
      type: "group.updated",
      actorId: viewerId,
      groupId,
      visibility: "group",
      data: { name: input.name, previousName: group.name },
    }),
  ]);
}

/** Adds people to a group by email. Anyone in the group may add people. */
export async function addMembers(
  db: Database,
  viewerId: string,
  groupId: string,
  people: { email: string; name?: string }[],
): Promise<{ group: Group; added: AddedPerson[] }> {
  if (people.length === 0) throw invalid("Add at least one email address.");
  if (people.length > 30) throw invalid("Add at most 30 people at a time.");
  const { group } = await requireMembership(db, groupId, viewerId);
  const found = (await findOrCreateUsers(db, people)).filter((person) => person.user.id !== viewerId);

  const existing = await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
  const byUser = new Map(existing.map((row) => [row.userId, row]));

  const statements: BatchItem<"sqlite">[] = [];
  const added: AddedPerson[] = [];
  for (const person of found) {
    const membership = byUser.get(person.user.id);
    if (membership && membership.leftAt === null) {
      added.push({ ...person, added: false });
      continue;
    }
    statements.push(
      membership
        ? db
            .update(groupMembers)
            .set({ leftAt: null, addedBy: viewerId, role: "member" })
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, person.user.id)))
        : db.insert(groupMembers).values({ groupId, userId: person.user.id, role: "member", addedBy: viewerId }),
      activityInsert(db, {
        type: "member.added",
        actorId: viewerId,
        groupId,
        visibility: "group",
        targetUserId: person.user.id,
      }),
    );
    added.push({ ...person, added: true });
  }
  if (statements.length > 0) {
    statements.push(db.update(groups).set({ updatedAt: new Date() }).where(eq(groups.id, groupId)));
    await runBatch(db, statements);
  }
  return { group, added };
}

/** The public balance of one member in a group (all currencies). */
async function memberSharedBalance(db: Database, group: Group, userId: string): Promise<MoneyByCurrency> {
  const ledger = await loadGroupPublicLedger(db, group.id);
  return computeGroupDebts(ledger, group.simplifyDebts).netByUser.get(userId) ?? {};
}

/**
 * Throws unless every private hisab inside the group is settled, even the ones
 * the viewer cannot see, because closing a group hides them for good.
 */
async function assertPrivateHisabsSettled(db: Database, groupId: string): Promise<void> {
  const privateLedger = await loadLedger(db, {
    expenses: and(eq(expenses.groupId, groupId), eq(expenses.visibility, "pair"), isNull(expenses.deletedAt)),
    settlements: and(
      eq(settlements.groupId, groupId),
      eq(settlements.visibility, "pair"),
      isNull(settlements.deletedAt),
    ),
  });
  const pairs = new Set(
    [...privateLedger.expenses, ...privateLedger.settlements].map((record) => `${record.pairA}|${record.pairB}`),
  );
  for (const pair of pairs) {
    const [a, b] = pair.split("|");
    if (!a || !b) continue;
    const subset = {
      expenses: privateLedger.expenses.filter((record) => record.pairA === a && record.pairB === b),
      settlements: privateLedger.settlements.filter((record) => record.pairA === a && record.pairB === b),
    };
    const balance = computePairBalances(a, subset).get(b) ?? {};
    if (!isZero(balance)) {
      throw conflict("Some private hisabs in this group are not settled yet. They need to be settled first.");
    }
  }
}

/** Leaves a group. Only possible once the shared balance is settled. */
export async function leaveGroup(db: Database, viewerId: string, groupId: string): Promise<void> {
  const { group, role } = await requireMembership(db, groupId, viewerId);
  if (!isZero(await memberSharedBalance(db, group, viewerId))) {
    throw conflict("Settle up your balance in this group before you leave it.");
  }

  const statements: BatchItem<"sqlite">[] = [
    db
      .update(groupMembers)
      .set({ leftAt: new Date() })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, viewerId))),
    activityInsert(db, { type: "member.left", actorId: viewerId, groupId, visibility: "group" }),
  ];

  if (role === "owner") {
    // Hand the group to the longest-standing remaining member.
    const [successor] = await db
      .select({ userId: groupMembers.userId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          isNull(groupMembers.leftAt),
          ne(groupMembers.userId, viewerId),
        ),
      )
      .orderBy(asc(groupMembers.createdAt))
      .limit(1);
    if (successor) {
      statements.push(
        db
          .update(groupMembers)
          .set({ role: "owner" })
          .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, successor.userId))),
      );
    } else {
      // The last person out closes the group, which hides its private hisabs.
      await assertPrivateHisabsSettled(db, groupId);
      statements.push(db.update(groups).set({ deletedAt: new Date() }).where(eq(groups.id, groupId)));
    }
  }
  await runBatch(db, statements);
}

/** Removes someone from a group. Owners only, and only when that person is settled. */
export async function removeMember(db: Database, viewerId: string, groupId: string, memberId: string): Promise<void> {
  const { group, role } = await requireMembership(db, groupId, viewerId);
  if (role !== "owner") throw forbidden("Only the group owner can remove people.");
  if (memberId === viewerId) throw invalid("To leave the group yourself, use Leave group.");
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, memberId), isNull(groupMembers.leftAt)));
  if (!membership) throw notFound("That member");
  if (!isZero(await memberSharedBalance(db, group, memberId))) {
    throw conflict("This person still has a balance in the group. Settle it before removing them.");
  }
  await runBatch(db, [
    db
      .update(groupMembers)
      .set({ leftAt: new Date() })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, memberId))),
    activityInsert(db, {
      type: "member.removed",
      actorId: viewerId,
      groupId,
      visibility: "group",
      targetUserId: memberId,
    }),
  ]);
}

/**
 * Deletes a group. Owners only, and only when every balance in it, shared and
 * private, is settled, so nobody loses track of money they are owed.
 */
export async function deleteGroup(db: Database, viewerId: string, groupId: string): Promise<void> {
  const { group, role } = await requireMembership(db, groupId, viewerId);
  if (role !== "owner") throw forbidden("Only the group owner can delete the group.");

  const ledger = await loadGroupPublicLedger(db, groupId);
  const { netByUser } = computeGroupDebts(ledger, group.simplifyDebts);
  if ([...netByUser.values()].some((money) => !isZero(money))) {
    throw conflict("Everyone has to be settled up before the group can be deleted.");
  }

  await assertPrivateHisabsSettled(db, groupId);

  await runBatch(db, [db.update(groups).set({ deletedAt: new Date() }).where(eq(groups.id, groupId))]);
}

/** A new join link. Old links stop working. Owners only. */
export async function rotateInviteCode(db: Database, viewerId: string, groupId: string): Promise<string> {
  const { role } = await requireMembership(db, groupId, viewerId);
  if (role !== "owner") throw forbidden("Only the group owner can reset the join link.");
  const code = newInviteCode();
  await db.update(groups).set({ inviteCode: code }).where(eq(groups.id, groupId));
  return code;
}

export interface InvitePreview {
  group: Group;
  memberCount: number;
  alreadyMember: boolean;
}

/** What a join link points to, for the page that asks "Join this group?". */
export async function previewInvite(db: Database, viewerId: string, code: string): Promise<InvitePreview> {
  const group = await db.query.groups.findFirst({ where: and(eq(groups.inviteCode, code), isNull(groups.deletedAt)) });
  if (!group) throw notFound("That join link");
  const members = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, group.id), isNull(groupMembers.leftAt)));
  return {
    group,
    memberCount: members.length,
    alreadyMember: members.some((member) => member.userId === viewerId),
  };
}

export async function joinWithInvite(db: Database, viewerId: string, code: string): Promise<Group> {
  const preview = await previewInvite(db, viewerId, code);
  if (preview.alreadyMember) return preview.group;
  const groupId = preview.group.id;
  const [previous] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, viewerId)));
  await runBatch(db, [
    previous
      ? db
          .update(groupMembers)
          .set({ leftAt: null, role: "member" })
          .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, viewerId)))
      : db.insert(groupMembers).values({ groupId, userId: viewerId, role: "member", addedBy: viewerId }),
    activityInsert(db, { type: "member.joined", actorId: viewerId, groupId, visibility: "group" }),
    db.update(groups).set({ updatedAt: new Date() }).where(eq(groups.id, groupId)),
  ]);
  return preview.group;
}
