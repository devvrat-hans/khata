import { Badge, Button, EmptyState } from "@aback-ui/ui";
import {
  IconCash,
  IconDownload,
  IconLock,
  IconPlus,
  IconReceipt,
  IconSettings,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DebtsPanel } from "@/components/groups/debts-panel";
import { GROUP_KIND_ICONS, IconChip } from "@/components/icons";
import { BalanceBadge, BalanceText, MoneyList } from "@/components/money";
import { PageTitle, SectionTitle } from "@/components/page-title";
import { PersonAvatar } from "@/components/person-avatar";
import { RecordsList } from "@/components/records-list";
import { addTo, isZero, type MoneyByCurrency } from "@/domain/money";
import { GROUP_KIND_LABELS } from "@/lib/labels";
import { getViewer, requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { getGroupPage } from "@/server/queries";
import { requireMembership } from "@/server/services/access";

export async function generateMetadata({ params }: { params: Promise<{ groupId: string }> }): Promise<Metadata> {
  const viewer = await getViewer();
  if (!viewer) return { title: "Group" };
  const membership = await requireMembership(getDb(), (await params).groupId, viewer.id).catch(() => null);
  return { title: membership?.group.name ?? "Group" };
}

async function load(groupId: string) {
  const viewer = await requireOnboardedViewer();
  try {
    return { viewer, page: await getGroupPage(getDb(), viewer, groupId) };
  } catch (error) {
    if (error instanceof AppError && error.code === "not_found") notFound();
    throw error;
  }
}

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { viewer, page } = await load(groupId);
  const { group, members, people } = page;

  const total: MoneyByCurrency = {};
  for (const record of page.records) {
    if (record.kind === "expense" && record.visibility === "group") addTo(total, record.currency, record.amount);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        eyebrow={
          <span className="inline-flex items-center gap-2">
            {GROUP_KIND_LABELS[group.kind]}
            <span aria-hidden="true">·</span>
            {members.length} {members.length === 1 ? "person" : "people"}
            <span aria-hidden="true">·</span>
            {group.currency}
          </span>
        }
        title={
          <span className="flex items-center gap-3">
            <IconChip icon={GROUP_KIND_ICONS[group.kind]} />
            <span className="min-w-0 break-words">{group.name}</span>
          </span>
        }
        actions={
          <>
            <Button asChild variant="brand">
              <Link href={`/expenses/new?group=${group.id}`}>
                <IconPlus aria-hidden="true" />
                Add expense
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/settle?group=${group.id}`}>
                <IconCash aria-hidden="true" />
                Settle up
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Group settings">
              <Link href={`/groups/${group.id}/settings`}>
                <IconSettings aria-hidden="true" />
              </Link>
            </Button>
          </>
        }
      />

      <section aria-label="Your balance" className="flex flex-col gap-2 border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Your balance in this group</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight">
            <BalanceText balance={page.viewerBalance.shared} settledLabel="You are settled up" />
          </p>
        </div>
        {!isZero(total) ? (
          <div className="text-sm text-muted-foreground sm:text-right">
            Group spending
            <MoneyList money={total} className="mt-0.5 block text-base font-semibold text-foreground" />
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="expenses-heading" className="order-2 min-w-0 lg:order-1">
          <SectionTitle
            id="expenses-heading"
            title="Expenses and payments"
            action={
              page.records.length > 0 ? (
                <Button asChild variant="ghost" size="sm">
                  <a href={`/api/groups/${group.id}/export`} download>
                    <IconDownload aria-hidden="true" />
                    Export CSV
                  </a>
                </Button>
              ) : null
            }
          />
          {page.records.length > 0 ? (
            <RecordsList records={page.records} people={people} viewerId={viewer.id} />
          ) : (
            <EmptyState
              icon={<IconReceipt aria-hidden="true" />}
              title="No expenses yet"
              description="Add the first one. Split it equally, by exact amounts, by percentages or by shares."
              action={
                <Button asChild variant="brand">
                  <Link href={`/expenses/new?group=${group.id}`}>Add an expense</Link>
                </Button>
              }
            />
          )}
        </section>

        <aside className="order-1 flex flex-col gap-6 lg:order-2">
          <DebtsPanel
            groupId={group.id}
            debts={page.debts}
            people={people}
            viewerId={viewer.id}
            simplified={group.simplifyDebts}
          />

          <section aria-labelledby="private-heading" className="border border-primary-200 bg-primary-50/40 shadow-sm dark:border-primary-800/60 dark:bg-primary-950/30">
            <div className="flex items-center gap-2 border-b border-primary-200 px-4 py-3 dark:border-primary-800/60">
              <IconLock aria-hidden="true" className="size-4 text-primary-600 dark:text-primary-400" />
              <h2 id="private-heading" className="text-base font-semibold">
                Your private hisabs
              </h2>
            </div>
            {page.privateBalances.length > 0 ? (
              <ul className="divide-y divide-primary-200/60 dark:divide-primary-800/40">
                {page.privateBalances.map(({ userId, amount }) => {
                  const person = people[userId];
                  if (!person) return null;
                  return (
                    <li key={userId}>
                      <Link href={`/people/${userId}`} className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-950/50">
                        <PersonAvatar person={person} size="sm" />
                        <span className="min-w-0 flex-1 text-sm">
                          <span className="block font-medium">{person.name}</span>
                          <BalanceText balance={amount} subject={person.name.split(" ")[0]} className="text-xs" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <p className="px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              Record something between you and one other member that the rest of the group does not see. Turn on{" "}
              <span className="font-medium text-foreground">Private between two</span> when adding an expense.
            </p>
          </section>

          <section aria-labelledby="members-heading" className="border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <h2 id="members-heading" className="text-base font-semibold">
                Members
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/groups/${group.id}/settings#members`}>Manage</Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {members.map((member) => {
                const net = page.netByUser[member.id] ?? {};
                return (
                  <li key={member.id} className="flex items-center gap-3 px-4 py-2.5">
                    <PersonAvatar person={member} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 truncate text-sm font-medium">
                        {member.id === viewer.id ? "You" : member.name}
                        {member.role === "owner" ? <Badge variant="muted">Owner</Badge> : null}
                        {!member.joined ? <Badge variant="warning">Invited</Badge> : null}
                      </span>
                    </span>
                    <BalanceBadge balance={net} owedLabel="gets back" owesLabel="owes" />
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
