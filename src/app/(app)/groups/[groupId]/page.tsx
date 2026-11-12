import { Button } from "@aback-ui/ui";
import { IconDownload, IconLock, IconPlus, IconSettings } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLink, StatusMark } from "@/components/editorial";
import { DebtsPanel } from "@/components/groups/debts-panel";
import { BalanceBadge, BalanceHeadline, BalanceText, MoneyList } from "@/components/money";
import { EmptyPanel, PageTitle, SectionTitle } from "@/components/page-title";
import { Stat, StatStrip } from "@/components/stats";
import { PersonAvatar } from "@/components/person-avatar";
import { RecordsList } from "@/components/records-list";
import { addTo, type MoneyByCurrency } from "@/domain/money";
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

  // Shared spending only: private hisabs never count toward the group.
  const total: MoneyByCurrency = {};
  const yourShare: MoneyByCurrency = {};
  let expenseCount = 0;
  for (const record of page.records) {
    if (record.kind !== "expense" || record.visibility !== "group") continue;
    expenseCount += 1;
    addTo(total, record.currency, record.amount);
    const share = record.shares.find((portion) => portion.userId === viewer.id)?.amount ?? 0;
    if (share !== 0) addTo(yourShare, record.currency, share);
  }
  const hasDebts = Object.values(page.debts).some((list) => list.length > 0);

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <PageTitle
        eyebrow={
          <>
            {GROUP_KIND_LABELS[group.kind]} · {members.length} {members.length === 1 ? "person" : "people"}
          </>
        }
        title={group.name}
        actions={
          <>
            <Button asChild variant="brand" size="lg" className="flex-1 sm:flex-none">
              <Link href={`/expenses/new?group=${group.id}`}>
                <IconPlus aria-hidden="true" />
                Add expense
              </Link>
            </Button>
            <ArrowLink href={`/settle?group=${group.id}`}>Settle up</ArrowLink>
            <Button asChild variant="ghost" size="icon" aria-label="Group settings" title="Group settings">
              <Link href={`/groups/${group.id}/settings`}>
                <IconSettings aria-hidden="true" />
              </Link>
            </Button>
          </>
        }
      />

      <section aria-label="Your balance" className="flex flex-col gap-10">
        <BalanceHeadline balance={page.viewerBalance.shared} settledLabel="You are settled up in this group" />
        <StatStrip>
          <Stat label="Group spending">
            <MoneyList money={total} />
          </Stat>
          <Stat label="Your share">
            <MoneyList money={yourShare} />
          </Stat>
          <Stat label="Expenses">{expenseCount}</Stat>
          <Stat label="Members">{members.length}</Stat>
        </StatStrip>
      </section>

      {/* Source order is the phone order: who owes whom, then expenses, then the rest. */}
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:grid-rows-[auto_auto_1fr] lg:gap-x-12">
        {hasDebts ? (
          <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
            <DebtsPanel
              groupId={group.id}
              debts={page.debts}
              people={people}
              viewerId={viewer.id}
              simplified={group.simplifyDebts}
            />
          </div>
        ) : null}

        <section aria-labelledby="expenses-heading" className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-span-3 lg:row-start-1">
          <SectionTitle
            id="expenses-heading"
            title="Expenses"
            count={page.records.length}
            action={
              page.records.length > 0 ? (
                <a
                  href={`/api/groups/${group.id}/export`}
                  download
                  className="inline-flex items-center gap-1.5 border-b border-separator pb-0.5 text-sm font-medium transition-colors duration-200 outline-none hover:border-foreground focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <IconDownload aria-hidden="true" className="size-3.5" />
                  Export CSV
                </a>
              ) : null
            }
          />
          {page.records.length > 0 ? (
            <RecordsList records={page.records} people={people} viewerId={viewer.id} />
          ) : (
            <EmptyPanel
              title="No expenses yet."
              description="Add the first one. Split it equally, by exact amounts, by percentages or by shares."
              action={
                <Button asChild variant="brand" size="lg">
                  <Link href={`/expenses/new?group=${group.id}`}>Add an expense</Link>
                </Button>
              }
            />
          )}
          {members.length > 1 ? (
            <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <IconLock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary-700 dark:text-primary-400" />
              <span>
                Something just between two of you?{" "}
                <Link href={`/expenses/new?group=${group.id}&private=1`} className="link-inline font-medium text-foreground">
                  Add a private expense
                </Link>
                . The rest of the group never sees it.
              </span>
            </p>
          ) : null}
        </section>

        {page.privateBalances.length > 0 ? (
          <section aria-labelledby="private-heading" className="lg:col-span-4 lg:col-start-9">
            <SectionTitle
              id="private-heading"
              title={
                <span className="inline-flex items-center gap-2">
                  <IconLock aria-hidden="true" className="size-4 text-primary-700 dark:text-primary-400" />
                  Private hisabs
                </span>
              }
              count={page.privateBalances.length}
            />
            <ul className="border-t border-border">
              {page.privateBalances.map(({ userId, amount }) => {
                const person = people[userId];
                if (!person) return null;
                return (
                  <li key={userId} className="border-b border-border">
                    <Link href={`/people/${userId}`} className="row-link -mx-3 flex items-center gap-3 px-3 py-3.5">
                      <PersonAvatar person={person} size="sm" />
                      <span className="min-w-0 flex-1 text-sm">
                        <BalanceText balance={amount} subject={firstName(person.name)} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="pt-3 text-xs leading-relaxed text-muted-foreground">
              Only you and the other person can see these.
            </p>
          </section>
        ) : null}

        <section aria-labelledby="members-heading" className="lg:col-span-4 lg:col-start-9">
          <SectionTitle
            id="members-heading"
            title="Members"
            count={members.length}
            action={<ArrowLink href={`/groups/${group.id}/settings#members`}>Manage</ArrowLink>}
          />
          <ul className="border-t border-border">
            {members.map((member) => {
              const net = page.netByUser[member.id] ?? {};
              return (
                <li key={member.id} className="flex items-center gap-3 border-b border-border py-3.5">
                  <PersonAvatar person={member} size="sm" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">{member.id === viewer.id ? "You" : member.name}</span>
                    {!member.joined ? <StatusMark tone="warning">Invited</StatusMark> : null}
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
