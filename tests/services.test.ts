import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { deleteAccount } from "@/server/services/account";
import { listActivity } from "@/server/services/activity";
import { computeGroupDebts, computeViewerBalances, type GroupSettings } from "@/server/services/balances";
import { createExpense, deleteExpense, getExpenseForViewer, updateExpense } from "@/server/services/expenses";
import {
  addMembers,
  createGroup,
  deleteGroup,
  joinWithInvite,
  leaveGroup,
  listGroups,
  listMembers,
  removeMember,
} from "@/server/services/groups";
import { loadGroupPublicLedger, loadViewerLedger } from "@/server/services/ledger";
import { addFriend, listConnectedPeople } from "@/server/services/people";
import { createSettlement } from "@/server/services/settlements";
import type { ExpenseInput } from "@/lib/validation";
import { createTestDb, createUser } from "./support/db";

let db: Database;
let dispose: () => Promise<void>;
let asha: string;
let bilal: string;
let chen: string;

beforeEach(async () => {
  ({ db, dispose } = await createTestDb());
  asha = await createUser(db, "Asha");
  bilal = await createUser(db, "Bilal");
  chen = await createUser(db, "Chen");
});

afterEach(async () => {
  await dispose();
});

async function balancesFor(userId: string) {
  const groups = await listGroups(db, userId);
  const settings = new Map<string, GroupSettings>(
    groups.map((item) => [item.group.id, { simplifyDebts: item.group.simplifyDebts }]),
  );
  return computeViewerBalances(userId, await loadViewerLedger(db, userId), settings);
}

async function tripWithEveryone() {
  const { group } = await createGroup(db, asha, {
    name: "Goa trip",
    kind: "trip",
    currency: "INR",
    members: [{ email: "bilal@example.com" }, { email: "chen@example.com" }],
  });
  return group;
}

function expense(overrides: Partial<ExpenseInput>): ExpenseInput {
  return {
    groupId: null,
    personId: null,
    isPrivate: false,
    description: "Dinner",
    amount: "900",
    currency: "INR",
    date: "2026-11-01",
    category: "food",
    notes: "",
    payers: [{ userId: asha }],
    splitMethod: "equal",
    participants: [{ userId: asha }, { userId: bilal }, { userId: chen }],
    ...overrides,
  };
}

async function expectAppError(promise: Promise<unknown>, code: AppError["code"]) {
  await expect(promise).rejects.toSatisfy((error: unknown) => error instanceof AppError && error.code === code);
}

describe("groups", () => {
  it("creates a group with existing users and placeholders for new emails", async () => {
    const { group, added } = await createGroup(db, asha, {
      name: "Flat 4B",
      kind: "home",
      currency: "INR",
      members: [{ email: "Bilal@Example.com" }, { email: "newperson@example.com", name: "Dev" }],
    });
    expect(added.map((person) => person.created)).toEqual([false, true]);
    const members = await listMembers(db, group.id);
    expect(members.map((member) => [member.name, member.role, member.joined])).toEqual([
      ["Asha", "owner", true],
      ["Bilal", "member", true],
      ["Dev", "member", false],
    ]);
    expect((await listGroups(db, bilal)).map((item) => item.memberCount)).toEqual([3]);
  });

  it("hides groups from people who are not in them", async () => {
    const { group } = await createGroup(db, asha, { name: "Private", kind: "other", currency: "INR", members: [] });
    await expectAppError(addMembers(db, chen, group.id, [{ email: "x@example.com" }]), "not_found");
    expect(await listGroups(db, chen)).toEqual([]);
  });

  it("lets people join with the invite link", async () => {
    const { group } = await createGroup(db, asha, { name: "Club", kind: "friends", currency: "INR", members: [] });
    await joinWithInvite(db, chen, group.inviteCode);
    expect((await listMembers(db, group.id)).map((member) => member.name)).toContain("Chen");
    await expectAppError(joinWithInvite(db, chen, "not-a-code"), "not_found");
  });
});

describe("group expenses and balances", () => {
  it("splits equally and shows everyone the same balances", async () => {
    const group = await tripWithEveryone();
    await createExpense(db, asha, expense({ groupId: group.id }));

    const { debts } = computeGroupDebts(await loadGroupPublicLedger(db, group.id), true);
    expect(debts.INR).toHaveLength(2);

    expect((await balancesFor(asha)).owed).toEqual({ INR: 60000 });
    expect((await balancesFor(bilal)).owes).toEqual({ INR: 30000 });
    expect((await balancesFor(chen)).owes).toEqual({ INR: 30000 });
  });

  it("rejects splits that do not add up and people outside the group", async () => {
    const group = await tripWithEveryone();
    await expectAppError(
      createExpense(
        db,
        asha,
        expense({
          groupId: group.id,
          splitMethod: "exact",
          participants: [
            { userId: asha, value: "100" },
            { userId: bilal, value: "100" },
          ],
        }),
      ),
      "invalid",
    );
    const outsider = await createUser(db, "Dana");
    await expectAppError(
      createExpense(db, asha, expense({ groupId: group.id, participants: [{ userId: asha }, { userId: outsider }] })),
      "invalid",
    );
  });

  it("settles up to zero, and only then lets a member leave", async () => {
    const group = await tripWithEveryone();
    await createExpense(db, asha, expense({ groupId: group.id }));
    await expectAppError(leaveGroup(db, bilal, group.id), "conflict");

    await createSettlement(db, bilal, {
      groupId: group.id,
      isPrivate: false,
      fromUserId: bilal,
      toUserId: asha,
      amount: "300",
      currency: "INR",
      date: "2026-11-02",
      method: "upi",
      note: "",
    });
    expect((await balancesFor(bilal)).owes).toEqual({});
    await leaveGroup(db, bilal, group.id);
    expect(await listGroups(db, bilal)).toEqual([]);
  });

  it("edits and deletes expenses", async () => {
    const group = await tripWithEveryone();
    const saved = await createExpense(db, asha, expense({ groupId: group.id }));
    await updateExpense(db, bilal, saved.id, expense({ groupId: group.id, amount: "300" }));
    expect((await balancesFor(chen)).owes).toEqual({ INR: 10000 });
    await deleteExpense(db, chen, saved.id);
    expect((await balancesFor(chen)).owes).toEqual({});
    await expectAppError(getExpenseForViewer(db, asha, saved.id), "not_found");
  });

  it("does not let an owner remove someone who still owes", async () => {
    const group = await tripWithEveryone();
    await createExpense(db, asha, expense({ groupId: group.id }));
    await expectAppError(removeMember(db, asha, group.id, bilal), "conflict");
    await expectAppError(removeMember(db, bilal, group.id, chen), "forbidden");
  });
});

describe("private hisab inside a group", () => {
  it("is visible only to the two people and stays out of the group balances", async () => {
    const group = await tripWithEveryone();
    const saved = await createExpense(
      db,
      asha,
      expense({
        groupId: group.id,
        isPrivate: true,
        personId: bilal,
        description: "Cab to the airport",
        amount: "500",
        participants: [{ userId: bilal }],
      }),
    );

    // The group sees nothing.
    const publicLedger = await loadGroupPublicLedger(db, group.id);
    expect(publicLedger.expenses).toHaveLength(0);
    expect((await loadViewerLedger(db, chen)).expenses).toHaveLength(0);
    await expectAppError(getExpenseForViewer(db, chen, saved.id), "not_found");
    const chenFeed = await listActivity(db, chen, { groupId: group.id });
    expect(chenFeed.some((row) => row.expenseId === saved.id)).toBe(false);

    // The two people see it as a private balance in the group.
    const ashaBalances = await balancesFor(asha);
    expect(ashaBalances.groups.get(group.id)?.private).toEqual({ INR: 50000 });
    expect(ashaBalances.groups.get(group.id)?.shared).toEqual({});
    expect(ashaBalances.people.get(bilal)?.parts.map((part) => part.source.kind)).toEqual(["private"]);
    expect((await balancesFor(bilal)).owes).toEqual({ INR: 50000 });
    expect((await getExpenseForViewer(db, bilal, saved.id)).description).toBe("Cab to the airport");
  });

  it("can only include the two people", async () => {
    const group = await tripWithEveryone();
    await expectAppError(
      createExpense(
        db,
        asha,
        expense({ groupId: group.id, isPrivate: true, personId: bilal, participants: [{ userId: chen }] }),
      ),
      "invalid",
    );
    await expectAppError(
      createExpense(db, chen, expense({ groupId: group.id, isPrivate: true, personId: chen })),
      "invalid",
    );
  });

  it("blocks deleting the group until private hisabs are settled", async () => {
    const group = await tripWithEveryone();
    await createExpense(
      db,
      bilal,
      expense({
        groupId: group.id,
        isPrivate: true,
        personId: chen,
        payers: [{ userId: bilal }],
        participants: [{ userId: chen }],
      }),
    );
    // Asha owns the group and cannot see the hisab, but it still blocks deletion.
    await expectAppError(deleteGroup(db, asha, group.id), "conflict");
    await createSettlement(db, chen, {
      groupId: group.id,
      isPrivate: true,
      fromUserId: chen,
      toUserId: bilal,
      amount: "900",
      currency: "INR",
      date: "2026-11-03",
      method: "cash",
      note: "",
    });
    await deleteGroup(db, asha, group.id);
    expect(await listGroups(db, asha)).toEqual([]);
  });

  it("stops the last member closing a group that still has an open private hisab", async () => {
    const group = await tripWithEveryone();
    await createExpense(
      db,
      bilal,
      expense({
        groupId: group.id,
        isPrivate: true,
        personId: asha,
        payers: [{ userId: bilal }],
        participants: [{ userId: asha }],
      }),
    );
    await leaveGroup(db, bilal, group.id);
    await leaveGroup(db, chen, group.id);
    // Closing the group would hide what Asha owes Bilal.
    await expectAppError(leaveGroup(db, asha, group.id), "conflict");
    expect((await balancesFor(bilal)).owed).toEqual({ INR: 90000 });
  });
});

describe("activity feed", () => {
  it("pages through rows that share a timestamp without losing any", async () => {
    await tripWithEveryone();
    const all = await listActivity(db, asha, { limit: 100 });
    expect(all.length).toBeGreaterThan(2);

    const seen: string[] = [];
    let before: { createdAt: Date; id: string } | undefined;
    for (let page = 0; page <= all.length; page += 1) {
      const [row] = await listActivity(db, asha, { limit: 1, before });
      if (!row) break;
      seen.push(row.id);
      before = { createdAt: row.createdAt, id: row.id };
    }
    expect(seen).toEqual(all.map((row) => row.id));
  });
});

describe("one to one hisab", () => {
  it("needs a connection, then works between two people only", async () => {
    const stranger = await createUser(db, "Eve");
    await expectAppError(createExpense(db, asha, expense({ personId: stranger, participants: [{ userId: stranger }] })), "not_found");

    const friend = await addFriend(db, asha, { email: "eve@example.com" });
    expect(friend.isNew).toBe(true);
    await createExpense(db, asha, expense({ personId: stranger, participants: [{ userId: stranger }] }));

    expect((await balancesFor(stranger)).owes).toEqual({ INR: 90000 });
    expect((await balancesFor(asha)).people.get(stranger)?.parts[0]?.source).toEqual({ kind: "direct" });
    expect((await listConnectedPeople(db, stranger)).has(asha)).toBe(true);
    expect((await balancesFor(bilal)).people.size).toBe(0);
  });

  it("does not let a third person record a payment between two others", async () => {
    await addFriend(db, asha, { email: "bilal@example.com" });
    await expectAppError(
      createSettlement(db, chen, {
        groupId: null,
        isPrivate: false,
        fromUserId: asha,
        toUserId: bilal,
        amount: "100",
        currency: "INR",
        date: "2026-11-03",
        method: "cash",
        note: "",
      }),
      "invalid",
    );
  });

  it("keeps currencies apart", async () => {
    await addFriend(db, asha, { email: "bilal@example.com" });
    await createExpense(db, asha, expense({ personId: bilal, participants: [{ userId: bilal }] }));
    await createExpense(
      db,
      bilal,
      expense({ personId: asha, currency: "USD", amount: "12.50", payers: [{ userId: bilal }], participants: [{ userId: asha }] }),
    );
    const balances = await balancesFor(asha);
    expect(balances.owed).toEqual({ INR: 90000 });
    expect(balances.owes).toEqual({ USD: 1250 });
  });
});

describe("accounts", () => {
  it("cannot be deleted with open balances", async () => {
    const group = await tripWithEveryone();
    await createExpense(db, asha, expense({ groupId: group.id }));
    await expectAppError(deleteAccount(db, chen), "conflict");
  });

  it("is anonymised on deletion and leaves its groups", async () => {
    await tripWithEveryone();
    await deleteAccount(db, chen);
    expect(await listGroups(db, chen)).toEqual([]);
    const people = await listConnectedPeople(db, asha);
    expect(people.has(chen)).toBe(false);
  });

  it("drops a deleted person from the people list even with a one to one hisab", async () => {
    await addFriend(db, asha, { email: "chen@example.com" });
    expect((await listConnectedPeople(db, asha)).has(chen)).toBe(true);
    await deleteAccount(db, chen);
    expect((await listConnectedPeople(db, asha)).has(chen)).toBe(false);
  });
});
