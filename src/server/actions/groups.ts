"use server";

import { revalidatePath } from "next/cache";
import type { GroupInput, GroupSettingsInput } from "@/lib/validation";
import { getDb } from "../db/client";
import { rateLimited } from "../errors";
import { getEnv } from "../env";
import {
  addMembers,
  createGroup,
  deleteGroup,
  joinWithInvite,
  leaveGroup,
  removeMember,
  rotateInviteCode,
  updateGroup,
} from "../services/groups";
import { notifyAddedToGroup } from "../services/notifications";
import { allow } from "../rate-limit";
import { type ActionResult, runAction } from "./result";

async function checkInviteLimit(viewerId: string): Promise<void> {
  if (!(await allow(getEnv().OUTBOUND_EMAIL_LIMITER, `invite:${viewerId}`))) {
    throw rateLimited("You are adding people very quickly. Wait a minute and try again.");
  }
}

export async function createGroupAction(input: GroupInput): Promise<ActionResult<{ groupId: string }>> {
  return runAction(async (viewer) => {
    if ((input.members ?? []).length > 0) await checkInviteLimit(viewer.id);
    const db = getDb();
    const { group, added } = await createGroup(db, viewer.id, input);
    notifyAddedToGroup(viewer, group, added);
    revalidatePath("/", "layout");
    return { groupId: group.id };
  });
}

export async function updateGroupAction(groupId: string, input: GroupSettingsInput): Promise<ActionResult> {
  return runAction(async (viewer) => {
    await updateGroup(getDb(), viewer.id, groupId, input);
    revalidatePath("/", "layout");
    return null;
  });
}

export async function addMembersAction(
  groupId: string,
  people: { email: string; name?: string }[],
): Promise<ActionResult<{ added: number; alreadyIn: number }>> {
  return runAction(async (viewer) => {
    await checkInviteLimit(viewer.id);
    const { group, added } = await addMembers(getDb(), viewer.id, groupId, people);
    notifyAddedToGroup(viewer, group, added);
    revalidatePath("/", "layout");
    return {
      added: added.filter((person) => person.added).length,
      alreadyIn: added.filter((person) => !person.added).length,
    };
  });
}

export async function removeMemberAction(groupId: string, memberId: string): Promise<ActionResult> {
  return runAction(async (viewer) => {
    await removeMember(getDb(), viewer.id, groupId, memberId);
    revalidatePath("/", "layout");
    return null;
  });
}

export async function leaveGroupAction(groupId: string): Promise<ActionResult> {
  return runAction(async (viewer) => {
    await leaveGroup(getDb(), viewer.id, groupId);
    revalidatePath("/", "layout");
    return null;
  });
}

export async function deleteGroupAction(groupId: string): Promise<ActionResult> {
  return runAction(async (viewer) => {
    await deleteGroup(getDb(), viewer.id, groupId);
    revalidatePath("/", "layout");
    return null;
  });
}

export async function rotateInviteAction(groupId: string): Promise<ActionResult<{ code: string }>> {
  return runAction(async (viewer) => {
    const code = await rotateInviteCode(getDb(), viewer.id, groupId);
    revalidatePath(`/groups/${groupId}/settings`);
    return { code };
  });
}

export async function joinGroupAction(code: string): Promise<ActionResult<{ groupId: string }>> {
  return runAction(async (viewer) => {
    const group = await joinWithInvite(getDb(), viewer.id, code);
    revalidatePath("/", "layout");
    return { groupId: group.id };
  });
}
