import { Badge } from "@aback-ui/ui";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddMembersForm } from "@/components/groups/add-members-form";
import { GroupSettingsForm } from "@/components/groups/group-settings-form";
import { InviteLink } from "@/components/groups/invite-link";
import { DeleteGroupButton, LeaveGroupButton, RemoveMemberButton } from "@/components/groups/member-actions";
import { PageTitle } from "@/components/page-title";
import { PersonAvatar } from "@/components/person-avatar";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { appUrl } from "@/server/env";
import { AppError } from "@/server/errors";
import { requireMembership } from "@/server/services/access";
import { listMembers } from "@/server/services/groups";
import { listConnectedPeople } from "@/server/services/people";

export const metadata: Metadata = { title: "Group settings" };

function Section({ id, title, description, children }: { id?: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id ?? title}-heading`} className="scroll-mt-20 border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 id={`${id ?? title}-heading`} className="text-lg font-semibold">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Link
          href={`/groups/${group.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft aria-hidden="true" className="size-4" />
          {group.name}
        </Link>
      </div>
      <PageTitle title="Group settings" description="Changes apply to everyone in the group." />

      <Section title="Details">
        <GroupSettingsForm
          groupId={group.id}
          initial={{ name: group.name, kind: group.kind, currency: group.currency, simplifyDebts: group.simplifyDebts }}
        />
      </Section>

      <Section id="members" title="Members" description="Anyone in the group can add people. Only the owner can remove them.">
        <ul className="mb-6 divide-y divide-border border border-border">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-3 py-2.5">
              <PersonAvatar person={member} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {member.id === viewer.id ? `${member.name} (you)` : member.name}
                  {member.role === "owner" ? <Badge variant="muted">Owner</Badge> : null}
                  {!member.joined ? <Badge variant="warning">Invited</Badge> : null}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{member.email}</span>
              </span>
              {isOwner && member.id !== viewer.id ? (
                <RemoveMemberButton groupId={group.id} memberId={member.id} name={member.name} />
              ) : null}
            </li>
          ))}
        </ul>
        <h3 className="mb-3 text-base font-semibold">Add people</h3>
        <AddMembersForm groupId={group.id} contacts={contacts} />
      </Section>

      <Section
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
      </Section>

      <Section title="Leave or delete">
        <div className="flex flex-wrap gap-2">
          <LeaveGroupButton groupId={group.id} isOwner={isOwner} />
          {isOwner ? <DeleteGroupButton groupId={group.id} groupName={group.name} /> : null}
        </div>
      </Section>
    </div>
  );
}
