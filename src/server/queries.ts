import "server-only";

import { and, eq, inArray, isNull } from "drizzle-orm";
import type { DebtsByCurrency } from "@/domain/balances";
import type { MoneyByCurrency } from "@/domain/money";
import type { Viewer } from "./auth/session";
import type { Database } from "./db/client";
import { type Activity, type Group, groupMembers, groups } from "./db/schema";
import { requireMembership } from "./services/access";
import { listActivity } from "./services/activity";
import {
  computeGroupDebts,
  computeViewerBalances,
  type GroupBalance,
  type PersonBalance,
  type ViewerBalances,
} from "./services/balances";
import { type GroupListItem, type GroupMemberView, listAllMemberIds, listGroups, listMembers } from "./services/groups";
import {
  type LedgerRecord,
  loadGroupPublicLedger,
  loadPairLedger,
  loadViewerLedger,
  loadViewerPrivateLedgerInGroup,
  sortRecords,
} from "./services/ledger";
import { getConnectedPerson, isFriend, listConnectedPeople, listSharedGroups } from "./services/people";
import { lastReminder } from "./services/reminders";
import { getPeople, type PersonSummary } from "./services/users";

/** Names and faces for every user id a page mentions. */
export type PeopleIndex = Record<string, PersonSummary>;

function toIndex(map: Map<string, PersonSummary>): PeopleIndex {
  return Object.fromEntries(map);
}

function viewerAsPerson(viewer: Viewer): PersonSummary {
  return {
    id: viewer.id,
    name: viewer.name,
    email: viewer.email,
    image: viewer.image,
    joined: true,
    upiId: viewer.upiId,
  };
}

export interface Overview {
  groups: GroupListItem[];
  balances: ViewerBalances;
  people: PeopleIndex;
}

/** Everything the viewer can see, turned into balances. Used by most pages. */
export async function getOverview(db: Database, viewer: Viewer): Promise<Overview> {
  const [groupList, ledger, connected] = await Promise.all([
    listGroups(db, viewer.id),
    loadViewerLedger(db, viewer.id),
    listConnectedPeople(db, viewer.id),
  ]);
  const settings = new Map(groupList.map((item) => [item.group.id, { simplifyDebts: item.group.simplifyDebts }]));
  const balances = computeViewerBalances(viewer.id, ledger, settings);

  // People with a balance may no longer be connected (they left a group): still name them.
  const missing = [...balances.people.keys()].filter((id) => !connected.has(id));
  const extra = missing.length > 0 ? await getPeople(db, missing) : new Map<string, PersonSummary>();
  return {
    groups: groupList,
    balances,
    people: { ...toIndex(connected), ...toIndex(extra), [viewer.id]: viewerAsPerson(viewer) },
  };
}

export interface FeedItem {
  activity: Activity;
  groupName: string | null;
}

/** The activity feed with the names it needs. */
export async function getFeed(
  db: Database,
  viewer: Viewer,
  query: Parameters<typeof listActivity>[2] = {},
): Promise<{ items: FeedItem[]; people: PeopleIndex }> {
  const rows = await listActivity(db, viewer.id, query);
  const userIds = new Set<string>();
  const groupIds = new Set<string>();
  for (const row of rows) {
    userIds.add(row.actorId);
    if (row.targetUserId) userIds.add(row.targetUserId);
    for (const key of ["fromUserId", "toUserId"] as const) {
      const value = row.data?.[key];
      if (typeof value === "string") userIds.add(value);
    }
    if (row.pairA) userIds.add(row.pairA);
    if (row.pairB) userIds.add(row.pairB);
    if (row.groupId) groupIds.add(row.groupId);
  }
  const [people, groupRows] = await Promise.all([
    getPeople(db, [...userIds]),
    groupIds.size > 0
      ? db
          .select({ id: groups.id, name: groups.name })
          .from(groups)
          .where(inArray(groups.id, [...groupIds].slice(0, 90)))
      : Promise.resolve([]),
  ]);
  const groupNames = new Map(groupRows.map((row) => [row.id, row.name]));
  return {
    items: rows.map((activity) => ({
      activity,
      groupName: activity.groupId ? (groupNames.get(activity.groupId) ?? null) : null,
    })),
    people: { ...toIndex(people), [viewer.id]: viewerAsPerson(viewer) },
  };
}

export interface GroupPage {
  group: Group;
  role: "owner" | "member";
  members: GroupMemberView[];
  /** Shared rows and the viewer's private rows, newest first. */
  records: LedgerRecord[];
  /** Who owes whom in what the whole group sees. */
  debts: DebtsByCurrency;
  /** Each member's net position in the shared rows. */
  netByUser: Record<string, MoneyByCurrency>;
  /** The viewer's position, shared and private. */
  viewerBalance: GroupBalance;
  /** The viewer's private balances in this group, per person. */
  privateBalances: { userId: string; amount: MoneyByCurrency }[];
  people: PeopleIndex;
}

export async function getGroupPage(db: Database, viewer: Viewer, groupId: string): Promise<GroupPage> {
  const { group, role } = await requireMembership(db, groupId, viewer.id);
  const [members, publicLedger, privateLedger, everyone] = await Promise.all([
    listMembers(db, groupId),
    loadGroupPublicLedger(db, groupId),
    loadViewerPrivateLedgerInGroup(db, groupId, viewer.id),
    listAllMemberIds(db, groupId),
  ]);
  const { debts, netByUser } = computeGroupDebts(publicLedger, group.simplifyDebts);

  const settings = new Map([[groupId, { simplifyDebts: group.simplifyDebts }]]);
  const combined = {
    expenses: [...publicLedger.expenses, ...privateLedger.expenses],
    settlements: [...publicLedger.settlements, ...privateLedger.settlements],
  };
  const balances = computeViewerBalances(viewer.id, combined, settings);
  const privateBalances: GroupPage["privateBalances"] = [];
  for (const person of balances.people.values()) {
    for (const part of person.parts) {
      if (part.source.kind === "private") privateBalances.push({ userId: person.userId, amount: part.amount });
    }
  }

  const people = await getPeople(db, everyone);
  return {
    group,
    role,
    members,
    records: sortRecords([...combined.expenses, ...combined.settlements]),
    debts,
    netByUser: Object.fromEntries(netByUser),
    viewerBalance: balances.groups.get(groupId) ?? { shared: {}, private: {} },
    privateBalances,
    people: { ...toIndex(people), [viewer.id]: viewerAsPerson(viewer) },
  };
}

export interface PersonPage {
  person: PersonSummary;
  balance: PersonBalance;
  /** Every pair row between the two: one to one, and private ones in groups. */
  records: LedgerRecord[];
  sharedGroups: Group[];
  groupNames: Record<string, string>;
  isFriend: boolean;
  remindedAt: Date | null;
  people: PeopleIndex;
  overview: Overview;
}

export async function getPersonPage(db: Database, viewer: Viewer, personId: string): Promise<PersonPage> {
  const person = await getConnectedPerson(db, viewer.id, personId);
  const [overview, pairLedger, sharedGroups, friend, remindedAt] = await Promise.all([
    getOverview(db, viewer),
    loadPairLedger(db, viewer.id, personId),
    listSharedGroups(db, viewer.id, personId),
    isFriend(db, viewer.id, personId),
    lastReminder(db, viewer.id, personId),
  ]);
  const groupNames: Record<string, string> = {};
  for (const item of overview.groups) groupNames[item.group.id] = item.group.name;
  // Private rows can sit in groups the viewer has since left: name those too.
  const unknown = [...pairLedger.expenses, ...pairLedger.settlements]
    .map((record) => record.groupId)
    .filter((id): id is string => Boolean(id && !groupNames[id]));
  if (unknown.length > 0) {
    const rows = await db
      .select({ id: groups.id, name: groups.name })
      .from(groups)
      .where(inArray(groups.id, [...new Set(unknown)].slice(0, 90)));
    for (const row of rows) groupNames[row.id] = row.name;
  }
  return {
    person,
    balance: overview.balances.people.get(personId) ?? { userId: personId, total: {}, parts: [] },
    records: sortRecords([...pairLedger.expenses, ...pairLedger.settlements]),
    sharedGroups,
    groupNames,
    isFriend: friend,
    remindedAt,
    people: { ...overview.people, [personId]: person },
    overview,
  };
}

/** Members of a group as options for a form, if the viewer is a member. */
export async function getGroupFormContext(db: Database, viewerId: string, groupId: string) {
  const { group } = await requireMembership(db, groupId, viewerId);
  const members = await listMembers(db, groupId);
  return { group, members };
}

/** Whether the viewer is an active member of a group (for edit rights on shared rows). */
export async function isActiveMember(db: Database, viewerId: string, groupId: string): Promise<boolean> {
  const rows = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, viewerId), isNull(groupMembers.leftAt)))
    .limit(1);
  return rows.length > 0;
}
