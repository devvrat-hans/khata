"use client";

import { IconDoorExit, IconTrash, IconUserMinus } from "@tabler/icons-react";
import { deleteGroupAction, leaveGroupAction, removeMemberAction } from "@/server/actions/groups";
import { ConfirmAction } from "../confirm-action";

export function RemoveMemberButton({ groupId, memberId, name }: { groupId: string; memberId: string; name: string }) {
  return (
    <ConfirmAction
      trigger={
        <>
          <IconUserMinus aria-hidden="true" />
          <span className="sr-only">Remove {name}</span>
        </>
      }
      triggerVariant="ghost"
      triggerSize="icon-sm"
      triggerClassName="text-muted-foreground hover:text-destructive"
      title={`Remove ${name}?`}
      description={
        <p>
          {name} will no longer see this group. Their past expenses stay. This only works when their balance in the group
          is settled.
        </p>
      }
      confirmLabel="Remove"
      successMessage={`${name} was removed`}
      action={() => removeMemberAction(groupId, memberId)}
    />
  );
}

export function LeaveGroupButton({ groupId, isOwner }: { groupId: string; isOwner: boolean }) {
  return (
    <ConfirmAction
      trigger={
        <>
          <IconDoorExit aria-hidden="true" />
          Leave group
        </>
      }
      title="Leave this group?"
      description={
        <>
          <p>You will stop seeing the group. Your past expenses stay for everyone else.</p>
          <p>You can only leave once your balance in the group is settled.</p>
          {isOwner ? <p>You own this group, so the longest-standing member becomes the owner.</p> : null}
        </>
      }
      confirmLabel="Leave group"
      successMessage="You left the group"
      action={() => leaveGroupAction(groupId)}
      redirectTo="/groups"
    />
  );
}

export function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  return (
    <ConfirmAction
      trigger={
        <>
          <IconTrash aria-hidden="true" />
          Delete group
        </>
      }
      triggerVariant="destructive"
      title={`Delete "${groupName}"?`}
      description={
        <>
          <p>The group and its history disappear for everyone. This cannot be undone.</p>
          <p>It only works when every balance in the group is settled, including private hisabs.</p>
        </>
      }
      confirmLabel="Delete group"
      successMessage="Group deleted"
      action={() => deleteGroupAction(groupId)}
      redirectTo="/groups"
    />
  );
}
