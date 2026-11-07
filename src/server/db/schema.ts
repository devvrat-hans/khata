/**
 * The whole database, in one place. Generate a migration after any change
 * with `bun run db:generate`.
 *
 * Conventions:
 * - Money is an integer in the currency's minor unit.
 * - Timestamps are integer milliseconds since the epoch (`timestamp_ms`).
 * - Calendar dates (when an expense happened) are ISO strings, "2026-11-07".
 * - Rows people can see are soft deleted with `deleted_at`, so the activity
 *   feed can still name what was removed.
 *
 * Visibility: an expense or payment is either shared with a whole group
 * (`visibility = "group"`) or kept between two people (`visibility = "pair"`).
 * Pair rows store the two people as `pair_a < pair_b`. A pair row with a
 * `group_id` is a private hisab inside a group: the other members never see it.
 * A pair row without a group is a one to one hisab.
 */

import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

const createdAt = () => integer("created_at", { mode: "timestamp_ms" }).notNull().default(now);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now)
    .$onUpdate(() => new Date());

/* -------------------------------------------------------------------------- */
/* Accounts (shape required by Better Auth)                                    */
/* -------------------------------------------------------------------------- */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  /** Currency preselected for new groups and one to one expenses. */
  defaultCurrency: text("default_currency").notNull().default("INR"),
  /** Optional UPI id, shown to people settling up with this user in INR. */
  upiId: text("upi_id"),
  /** Emails about new expenses and payments that involve this user. */
  emailNotifications: integer("email_notifications", { mode: "boolean" }).notNull().default(true),
  /**
   * Set once the person has confirmed their name after the first sign in.
   * People added by email before they ever signed in have it unset.
   */
  onboardedAt: integer("onboarded_at", { mode: "timestamp_ms" }),
  /** Set when the account is deleted. The row stays so old expenses keep a name. */
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("account_user_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/* -------------------------------------------------------------------------- */
/* Groups                                                                      */
/* -------------------------------------------------------------------------- */

export const GROUP_KINDS = ["trip", "home", "couple", "friends", "work", "other"] as const;
export type GroupKind = (typeof GROUP_KINDS)[number];

export const groups = sqliteTable(
  "groups",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    kind: text("kind", { enum: GROUP_KINDS }).notNull().default("other"),
    currency: text("currency").notNull(),
    /** Show the fewest payments that settle everyone, instead of every debt. */
    simplifyDebts: integer("simplify_debts", { mode: "boolean" }).notNull().default(true),
    /** Secret part of the join link. Rotating it invalidates old links. */
    inviteCode: text("invite_code").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  },
  (table) => [uniqueIndex("groups_invite_code_idx").on(table.inviteCode)],
);

export const MEMBER_ROLES = ["owner", "member"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const groupMembers = sqliteTable(
  "group_members",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    role: text("role", { enum: MEMBER_ROLES }).notNull().default("member"),
    addedBy: text("added_by").references(() => user.id),
    createdAt: createdAt(),
    /** Set when the member leaves or is removed. Their history stays. */
    leftAt: integer("left_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    primaryKey({ columns: [table.groupId, table.userId] }),
    index("group_members_user_idx").on(table.userId, table.leftAt),
  ],
);

/* -------------------------------------------------------------------------- */
/* People                                                                      */
/* -------------------------------------------------------------------------- */

/** Two people who keep a one to one hisab. Stored once, with user_a < user_b. */
export const friendships = sqliteTable(
  "friendships",
  {
    userA: text("user_a")
      .notNull()
      .references(() => user.id),
    userB: text("user_b")
      .notNull()
      .references(() => user.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: createdAt(),
  },
  (table) => [primaryKey({ columns: [table.userA, table.userB] }), index("friendships_user_b_idx").on(table.userB)],
);

/* -------------------------------------------------------------------------- */
/* Expenses and payments                                                       */
/* -------------------------------------------------------------------------- */

export const VISIBILITIES = ["group", "pair"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const EXPENSE_CATEGORIES = [
  "general",
  "food",
  "groceries",
  "transport",
  "travel",
  "stay",
  "rent",
  "utilities",
  "shopping",
  "entertainment",
  "health",
  "gifts",
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const SPLIT_METHOD_VALUES = ["equal", "exact", "percent", "shares"] as const;

export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id").references(() => groups.id, { onDelete: "cascade" }),
    visibility: text("visibility", { enum: VISIBILITIES }).notNull(),
    pairA: text("pair_a").references(() => user.id),
    pairB: text("pair_b").references(() => user.id),
    description: text("description").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    category: text("category", { enum: EXPENSE_CATEGORIES }).notNull().default("general"),
    spentOn: text("spent_on").notNull(),
    splitMethod: text("split_method", { enum: SPLIT_METHOD_VALUES }).notNull(),
    notes: text("notes"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    updatedBy: text("updated_by").references(() => user.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    deletedBy: text("deleted_by").references(() => user.id),
  },
  (table) => [
    index("expenses_group_idx").on(table.groupId, table.visibility, table.deletedAt, table.spentOn),
    index("expenses_pair_idx").on(table.pairA, table.pairB, table.deletedAt),
    index("expenses_pair_b_idx").on(table.pairB, table.deletedAt),
  ],
);

export const expensePayers = sqliteTable(
  "expense_payers",
  {
    expenseId: text("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    amount: integer("amount").notNull(),
  },
  (table) => [primaryKey({ columns: [table.expenseId, table.userId] }), index("expense_payers_user_idx").on(table.userId)],
);

export const expenseShares = sqliteTable(
  "expense_shares",
  {
    expenseId: text("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    amount: integer("amount").notNull(),
    /**
     * What was typed for this person, so the form reopens as it was saved:
     * minor units for exact, basis points for percent, hundredths for shares.
     */
    inputValue: integer("input_value"),
  },
  (table) => [primaryKey({ columns: [table.expenseId, table.userId] }), index("expense_shares_user_idx").on(table.userId)],
);

export const PAYMENT_METHODS = ["cash", "upi", "bank", "card", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** A payment from one person to another that settles debt ("settle up"). */
export const settlements = sqliteTable(
  "settlements",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id").references(() => groups.id, { onDelete: "cascade" }),
    visibility: text("visibility", { enum: VISIBILITIES }).notNull(),
    pairA: text("pair_a").references(() => user.id),
    pairB: text("pair_b").references(() => user.id),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => user.id),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => user.id),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    method: text("method", { enum: PAYMENT_METHODS }).notNull().default("cash"),
    paidOn: text("paid_on").notNull(),
    note: text("note"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    deletedBy: text("deleted_by").references(() => user.id),
  },
  (table) => [
    index("settlements_group_idx").on(table.groupId, table.visibility, table.deletedAt),
    index("settlements_pair_idx").on(table.pairA, table.pairB, table.deletedAt),
    index("settlements_pair_b_idx").on(table.pairB, table.deletedAt),
  ],
);

/* -------------------------------------------------------------------------- */
/* Activity and reminders                                                      */
/* -------------------------------------------------------------------------- */

export const ACTIVITY_TYPES = [
  "group.created",
  "group.updated",
  "member.added",
  "member.joined",
  "member.left",
  "member.removed",
  "friend.added",
  "expense.created",
  "expense.updated",
  "expense.deleted",
  "settlement.created",
  "settlement.deleted",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/**
 * The feed. Each row follows the same visibility rule as expenses: group rows
 * are seen by the group's members, pair rows only by the two people.
 */
export const activities = sqliteTable(
  "activities",
  {
    id: text("id").primaryKey(),
    type: text("type", { enum: ACTIVITY_TYPES }).notNull(),
    actorId: text("actor_id")
      .notNull()
      .references(() => user.id),
    groupId: text("group_id").references(() => groups.id, { onDelete: "cascade" }),
    visibility: text("visibility", { enum: VISIBILITIES }).notNull(),
    pairA: text("pair_a"),
    pairB: text("pair_b"),
    expenseId: text("expense_id"),
    settlementId: text("settlement_id"),
    targetUserId: text("target_user_id"),
    /** A small JSON snapshot (description, amount, currency) for the feed text. */
    data: text("data", { mode: "json" }).$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (table) => [
    index("activities_group_idx").on(table.groupId, table.visibility, table.createdAt),
    index("activities_pair_a_idx").on(table.pairA, table.createdAt),
    index("activities_pair_b_idx").on(table.pairB, table.createdAt),
  ],
);

/** Payment reminders sent between two people, to limit them to one a day. */
export const reminders = sqliteTable(
  "reminders",
  {
    id: text("id").primaryKey(),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => user.id),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => user.id),
    createdAt: createdAt(),
  },
  (table) => [index("reminders_pair_idx").on(table.fromUserId, table.toUserId, table.createdAt)],
);

export const schema = {
  user,
  session,
  account,
  verification,
  groups,
  groupMembers,
  friendships,
  expenses,
  expensePayers,
  expenseShares,
  settlements,
  activities,
  reminders,
};

export type User = typeof user.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Settlement = typeof settlements.$inferSelect;
export type Activity = typeof activities.$inferSelect;
