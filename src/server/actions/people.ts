"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "../db/client";
import { rateLimited } from "../errors";
import { getEnv } from "../env";
import { computeViewerBalances } from "../services/balances";
import { listGroups } from "../services/groups";
import { loadViewerLedger } from "../services/ledger";
import { notifyAddedAsFriend, notifyReminder } from "../services/notifications";
import { addFriend, getConnectedPerson } from "../services/people";
import { recordReminder } from "../services/reminders";
import { getActiveUser } from "../services/users";
import { allow } from "../rate-limit";
import { type ActionResult, runAction } from "./result";

export async function addPersonAction(input: {
  email: string;
  name?: string;
}): Promise<ActionResult<{ personId: string; isNew: boolean }>> {
  return runAction(async (viewer) => {
    if (!(await allow(getEnv().OUTBOUND_EMAIL_LIMITER, `invite:${viewer.id}`))) {
      throw rateLimited("You are adding people very quickly. Wait a minute and try again.");
    }
    const result = await addFriend(getDb(), viewer.id, input);
    if (result.isNew) notifyAddedAsFriend(viewer, result.user);
    revalidatePath("/", "layout");
    return { personId: result.user.id, isNew: result.isNew };
  });
}

export async function sendReminderAction(personId: string): Promise<ActionResult> {
  return runAction(async (viewer) => {
    const db = getDb();
    await getConnectedPerson(db, viewer.id, personId);
    const groups = await listGroups(db, viewer.id);
    const settings = new Map(groups.map((item) => [item.group.id, { simplifyDebts: item.group.simplifyDebts }]));
    const balances = computeViewerBalances(viewer.id, await loadViewerLedger(db, viewer.id), settings);
    const owed = await recordReminder(db, viewer.id, personId, balances.people.get(personId)?.total ?? {});
    const recipient = await getActiveUser(db, personId);
    if (recipient) notifyReminder(viewer, recipient, owed);
    revalidatePath(`/people/${personId}`);
    return null;
  });
}
