import "server-only";

import { inArray } from "drizzle-orm";
import { formatMoney, formatMoneyList, type MoneyByCurrency } from "@/domain/money";
import type { Database } from "../db/client";
import { type User, user } from "../db/schema";
import { sendEmail } from "../email/mailer";
import {
  addedAsFriendEmail,
  addedToGroupEmail,
  expenseAddedEmail,
  paymentRecordedEmail,
  reminderEmail,
} from "../email/templates";
import { appUrl, getEnv, runInBackground } from "../env";
import { allow } from "../rate-limit";
import type { SavedExpense } from "./expenses";
import type { SavedSettlement } from "./settlements";

/**
 * Every email the app sends besides sign-in codes. All of them run after the
 * response. Activity emails go only to people who have signed in at least
 * once and have not turned them off.
 */

async function loadUsers(db: Database, ids: string[]): Promise<Map<string, User>> {
  if (ids.length === 0) return new Map();
  const rows = await db.select().from(user).where(inArray(user.id, [...new Set(ids)].slice(0, 90)));
  return new Map(rows.map((row) => [row.id, row]));
}

function wantsActivityEmail(row: User | undefined): row is User {
  return Boolean(row && row.emailVerified && row.emailNotifications && !row.deletedAt);
}

/** Sends at most a burst of emails per actor, so a person cannot be spammed. */
async function underLimit(actorId: string): Promise<boolean> {
  return allow(getEnv().OUTBOUND_EMAIL_LIMITER, `notify:${actorId}`);
}

export function notifyAddedToGroup(
  actor: { id: string; name: string },
  group: { id: string; name: string },
  people: { user: User; created: boolean; added: boolean }[],
): void {
  runInBackground(
    (async () => {
      const base = appUrl();
      for (const person of people) {
        if (!person.added || person.user.deletedAt) continue;
        // Someone who signed in before and turned emails off is not emailed.
        if (person.user.emailVerified && !person.user.emailNotifications) continue;
        if (!(await underLimit(actor.id))) return;
        const message = addedToGroupEmail({
          inviterName: actor.name,
          groupName: group.name,
          url: `${base}/groups/${group.id}`,
          appUrl: base,
          isNewUser: !person.user.emailVerified,
        });
        await sendEmail({ to: person.user.email, ...message });
      }
    })(),
  );
}

export function notifyAddedAsFriend(actor: { id: string; name: string }, person: User): void {
  if (person.deletedAt || (person.emailVerified && !person.emailNotifications)) return;
  runInBackground(
    (async () => {
      if (!(await underLimit(actor.id))) return;
      const base = appUrl();
      const message = addedAsFriendEmail({
        inviterName: actor.name,
        url: `${base}/people/${actor.id}`,
        appUrl: base,
        isNewUser: !person.emailVerified,
      });
      await sendEmail({ to: person.email, ...message });
    })(),
  );
}

export function notifyExpense(
  db: Database,
  actor: { id: string; name: string },
  expense: SavedExpense,
  contextName: string,
): void {
  runInBackground(
    (async () => {
      const involved = [...expense.payers, ...expense.shares].map((portion) => portion.userId);
      const recipients = await loadUsers(
        db,
        involved.filter((id) => id !== actor.id),
      );
      const base = appUrl();
      for (const recipient of recipients.values()) {
        if (!wantsActivityEmail(recipient)) continue;
        if (!(await underLimit(actor.id))) return;
        const paid = expense.payers.find((payer) => payer.userId === recipient.id)?.amount ?? 0;
        const share = expense.shares.find((portion) => portion.userId === recipient.id)?.amount ?? 0;
        const message = expenseAddedEmail({
          actorName: actor.name,
          description: expense.description,
          total: formatMoney(expense.amount, expense.currency),
          youPaid: paid > 0 ? formatMoney(paid, expense.currency) : null,
          yourShare: share > 0 ? formatMoney(share, expense.currency) : null,
          context: contextName,
          isPrivate: expense.context.visibility === "pair" && expense.context.groupId !== null,
          url: `${base}/expenses/${expense.id}`,
          appUrl: base,
          settingsUrl: `${base}/settings`,
        });
        await sendEmail({ to: recipient.email, ...message });
      }
    })(),
  );
}

export function notifySettlement(
  db: Database,
  actor: { id: string; name: string },
  settlement: SavedSettlement,
  contextName: string,
): void {
  runInBackground(
    (async () => {
      const people = await loadUsers(db, [settlement.fromUserId, settlement.toUserId]);
      const from = people.get(settlement.fromUserId);
      const to = people.get(settlement.toUserId);
      if (!from || !to) return;
      const base = appUrl();
      // The recipient lands on the group, or on their hisab with the person who recorded it.
      const url = settlement.groupId ? `${base}/groups/${settlement.groupId}` : `${base}/people/${actor.id}`;
      for (const recipient of [from, to]) {
        if (recipient.id === actor.id || !wantsActivityEmail(recipient)) continue;
        if (!(await underLimit(actor.id))) return;
        const message = paymentRecordedEmail({
          actorName: actor.name,
          fromName: from.id === recipient.id ? "you" : from.name,
          toName: to.id === recipient.id ? "you" : to.name,
          amount: formatMoney(settlement.amount, settlement.currency),
          context: contextName,
          url,
          appUrl: base,
          settingsUrl: `${base}/settings`,
        });
        await sendEmail({ to: recipient.email, ...message });
      }
    })(),
  );
}

export function notifyReminder(
  actor: { id: string; name: string; upiId: string | null },
  recipient: User,
  owed: MoneyByCurrency,
): void {
  runInBackground(
    (async () => {
      if (recipient.deletedAt) return;
      const base = appUrl();
      const message = reminderEmail({
        fromName: actor.name,
        amount: formatMoneyList(owed),
        url: `${base}/people/${actor.id}`,
        upiId: owed.INR ? actor.upiId : null,
        appUrl: base,
      });
      await sendEmail({ to: recipient.email, ...message });
    })(),
  );
}
