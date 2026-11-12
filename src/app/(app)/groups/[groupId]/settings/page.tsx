import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddMembersForm } from "@/components/groups/add-members-form";
import { GroupSettingsForm } from "@/components/groups/group-settings-form";
import { InviteLink } from "@/components/groups/invite-link";
import { DeleteGroupButton, LeaveGroupButton, RemoveMemberButton } from "@/components/groups/member-actions";
import { StatusMark } from "@/components/editorial";
import { PageTitle, RailSection } from "@/components/page-title";
import { PersonAvatar } from "@/components/person-avatar";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { appUrl } from "@/server/env";
import { AppError } from "@/server/errors";
import { requireMembership } from "@/server/services/access";
import { listMembers } from "@/server/services/groups";
import { listConnectedPeople } from "@/server/services/people";

export const metadata: Metadata = { title: "Group settings" };

export default async function GroupSettingsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const viewer = await requireOnboardedViewer();
  const db = getDb();
  const membership = await requireMembership(db, groupId, viewer.id).catch((error: unknown) => {
    if (error instanceof AppError && error.code === "not_found") notFound();
    throw error;
  });
  const { group, role } = membership;
  const [members, connected] = await Promise.all([listMembers(db, groupId), listConnectedPeople(db, viewer.id)]);
  const memberIds = new Set(members.map((member) => member.id));
  const contacts = [...connected.values()]
    .filter((person) => person.email && !memberIds.has(person.id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name, email, image }) => ({ id, name, email, image }));
  const isOwner = role === "owner";

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      <div className="flex flex-col gap-8">
        <Link
          href={`/groups/${group.id}`}
          className="link-quiet inline-flex w-fit items-center gap-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <IconArrowLeft aria-hidden="true" className="size-4" />
          {group.name}
        </Link>
        <PageTitle eyebrow={group.name} title="Group settings" description="Changes apply to everyone in the group." />
      </div>

      <RailSection id="details" title="Details" description="The name, the kind of group, its currency and how debts are shown.">
        <GroupSettingsForm
          groupId={group.id}
          initial={{ name: group.name, kind: group.kind, currency: group.currency, simplifyDebts: group.simplifyDebts }}
        />
      </RailSection>

      <RailSection
        id="members"
        title="Members"
        description="Anyone in the group can add people. Only the owner can remove them."
      >
        <ul className="mb-10 border-t border-border">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 border-b border-border py-3.5">
              <PersonAvatar person={member} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                  {member.id === viewer.id ? `${member.name} (you)` : member.name}
                  {member.role === "owner" ? <StatusMark tone="brand">Owner</StatusMark> : null}
                  {!member.joined ? <StatusMark tone="warning">Invited</StatusMark> : null}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{member.email}</span>
              </span>
              {isOwner && member.id !== viewer.id ? (
                <RemoveMemberButton groupId={group.id} memberId={member.id} name={member.name} />
              ) : null}
            </li>
          ))}
        </ul>
        <h3 className="type-meta mb-4 text-muted-foreground">Add people</h3>
        <AddMembersForm groupId={group.id} contacts={contacts} />
      </RailSection>

      <RailSection
        id="join-link"
        title="Join link"
        description="Anyone with this link can join the group after signing in. Share it in your group chat."
      >
        <InviteLink
          groupId={group.id}
          groupName={group.name}
          baseUrl={appUrl()}
          code={group.inviteCode}
          canReset={isOwner}
        />
      </RailSection>

      <RailSection
        id="leave"
        tone="danger"
        title="Leave or delete"
        description="You can leave once your shared balance is settled. Deleting needs every balance settled, private ones included."
      >
        <div className="flex flex-wrap gap-2">
          <LeaveGroupButton groupId={group.id} isOwner={isOwner} />
          {isOwner ? <DeleteGroupButton groupId={group.id} groupName={group.name} /> : null}
        </div>
      </RailSection>
    </div>
  );
}
