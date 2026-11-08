import { Badge, Button, EmptyState } from "@aback-ui/ui";
import { IconCash, IconDownload, IconLock, IconPlus, IconReceipt, IconSettings } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DebtsPanel } from "@/components/groups/debts-panel";
import { BalanceBadge, BalanceHeadline, BalanceText, MoneyList } from "@/components/money";
import { PageTitle, SectionTitle } from "@/components/page-title";
import { PersonAvatar } from "@/components/person-avatar";
import { RecordsList } from "@/components/records-list";
import { addTo, isZero, type MoneyByCurrency } from "@/domain/money";
import { firstName } from "@/lib/format";
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
  const hasDebts = Object.values(page.debts).some((list) => list.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        eyebrow={
          <span className="inline-flex items-center gap-2">
            {GROUP_KIND_LABELS[group.kind]}
            <span aria-hidden="true">·</span>
            {members.length} {members.length === 1 ? "person" : "people"}
          </span>
        }
        title={<span className="min-w-0 break-words">{group.name}</span>}
        actions={
          <>
            <Button asChild variant="brand" className="flex-1 sm:flex-none">
              <Link href={`/expenses/new?group=${group.id}`}>
                <IconPlus aria-hidden="true" />
                Add expense
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link href={`/settle?group=${group.id}`}>
                <IconCash aria-hidden="true" />
                Settle up
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" aria-label="Group settings">
              <Link href={`/groups/${group.id}/settings`}>
                <IconSettings aria-hidden="true" />
              </Link>
            </Button>
          </>
        }
      />

      <section
        aria-label="Your balance"
        className="flex flex-col gap-4 border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <BalanceHeadline balance={page.viewerBalance.shared} settledLabel="You are settled up in this group" />
        {!isZero(total) ? (
          <div className="text-sm text-muted-foreground sm:text-right">
            Group spending
            <MoneyList money={total} className="mt-0.5 block text-base font-semibold text-foreground" />
          </div>
        ) : null}
      </section>

      {/* Source order is the phone order: who owes whom, then expenses, then the rest. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_auto_1fr]">
        {hasDebts ? (
          <div className="lg:col-start-2 lg:row-start-1">
            <DebtsPanel
              groupId={group.id}
              debts={page.debts}
              people={people}
              viewerId={viewer.id}
              simplified={group.simplifyDebts}
            />
          </div>
        ) : null}

        <section aria-labelledby="expenses-heading" className="min-w-0 lg:col-start-1 lg:row-span-3 lg:row-start-1">
          <SectionTitle
            id="expenses-heading"
            title="Expenses"
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
          {members.length > 1 ? (
            <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
              <IconLock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Something just between two of you?{" "}
                <Link href={`/expenses/new?group=${group.id}&private=1`} className="text-link hover:underline">
                  Add a private expense
                </Link>
                . The rest of the group never sees it.
              </span>
            </p>
          ) : null}
        </section>

        {page.privateBalances.length > 0 ? (
          <section
            aria-labelledby="private-heading"
            className="border border-primary-200 bg-primary-50/40 lg:col-start-2 dark:border-primary-800/60 dark:bg-primary-950/30"
          >
            <h2 id="private-heading" className="flex items-center gap-2 px-4 pt-3 text-base font-semibold">
              <IconLock aria-hidden="true" className="size-4 text-primary-600 dark:text-primary-400" />
              Your private hisabs
            </h2>
            <ul className="py-1">
              {page.privateBalances.map(({ userId, amount }) => {
                const person = people[userId];
                if (!person) return null;
                return (
                  <li key={userId}>
                    <Link
                      href={`/people/${userId}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                    >
                      <PersonAvatar person={person} size="sm" />
                      <span className="min-w-0 flex-1 text-sm">
                        <BalanceText balance={amount} subject={firstName(person.name)} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="members-heading" className="border border-border bg-card lg:col-start-2">
          <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
            <h2 id="members-heading" className="text-base font-semibold">
              Members
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/groups/${group.id}/settings#members`}>Manage</Link>
            </Button>
          </div>
          <ul className="pb-2">
            {members.map((member) => {
              const net = page.netByUser[member.id] ?? {};
              return (
                <li key={member.id} className="flex items-center gap-3 px-4 py-2">
                  <PersonAvatar person={member} size="sm" />
                  <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{member.id === viewer.id ? "You" : member.name}</span>
                    {!member.joined ? <Badge variant="warning">Invited</Badge> : null}
                  </span>
                  <BalanceBadge balance={net} owedLabel="gets back" owesLabel="owes" />
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
