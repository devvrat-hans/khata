import { Button } from "@aback-ui/ui";
import { IconArrowRight, IconLock, IconUserPlus, IconUsersGroup } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ActivityList } from "@/components/activity-list";
import { GroupList, PeopleList } from "@/components/lists";
import { BalanceHeadline, MoneyList } from "@/components/money";
import { PageTitle, SectionTitle } from "@/components/page-title";
import { addTo, isZero, type MoneyByCurrency } from "@/domain/money";
import { firstName } from "@/lib/format";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { getFeed, getOverview } from "@/server/queries";
import { groupRows, peopleRows } from "@/server/rows";

export const metadata: Metadata = { title: "Home" };

function SeeAll({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-link hover:text-link-hover">
      {children}
      <IconArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

const startCard = "group flex flex-col gap-3 border border-border bg-card p-5 transition-colors duration-200 hover:border-primary-300";

export default async function DashboardPage() {
  const viewer = await requireOnboardedViewer();
  const db = getDb();
  const [overview, feed] = await Promise.all([getOverview(db, viewer), getFeed(db, viewer, { limit: 5 })]);
  const people = peopleRows(overview, viewer.id);
  const groups = groupRows(overview);
  const openPeople = people.filter((row) => !isZero(row.balance));
  const isNew = groups.length === 0 && people.length === 0;

  const { owed, owes } = overview.balances;
  const net: MoneyByCurrency = {};
  for (const [currency, amount] of Object.entries(owed)) addTo(net, currency, amount);
  for (const [currency, amount] of Object.entries(owes)) addTo(net, currency, -amount);
  const allSettled = isZero(owed) && isZero(owes);
  const owedAndOwing = !isZero(owed) && !isZero(owes);

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title={`Hello, ${firstName(viewer.name)}`}
        description={isNew ? "Start by creating a group or adding a person you share costs with." : undefined}
      />

      {isNew ? (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link href="/groups/new" className={startCard}>
            <IconUsersGroup aria-hidden="true" className="size-6 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-400">
              Create a group
            </span>
            <span className="text-sm text-muted-foreground">
              For a trip, a flat or a team. Everyone sees the same expenses and balances.
            </span>
          </Link>
          <Link href="/people?add=1" className={startCard}>
            <IconUserPlus aria-hidden="true" className="size-6 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-400">
              Add a person
            </span>
            <span className="text-sm text-muted-foreground">
              Keep a one to one hisab with a friend, a flatmate or family.
            </span>
          </Link>
          <div className="flex flex-col gap-3 border border-primary-200 bg-primary-50/50 p-5 dark:border-primary-800/60 dark:bg-primary-950/30">
            <IconLock aria-hidden="true" className="size-6 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold">Private hisab in a group</span>
            <span className="text-sm text-muted-foreground">
              Inside any group, record something between just two people. The rest of the group never sees it.
            </span>
          </div>
        </section>
      ) : (
        <section aria-label="Your balance" className="border border-border bg-card">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <BalanceHeadline
              balance={net}
              settledLabel={owedAndOwing ? "You are even overall" : "You are all settled up"}
            />
            {!allSettled ? (
              <Button asChild variant="outline" className="sm:shrink-0">
                <Link href="/settle">Settle up</Link>
              </Button>
            ) : null}
          </div>
          {owedAndOwing ? (
            <dl className="grid grid-cols-2 divide-x divide-border border-t border-border">
              <div className="px-5 py-3 sm:px-6">
                <dt className="text-sm text-muted-foreground">Owed to you</dt>
                <dd className="mt-0.5 font-semibold text-success">
                  <MoneyList money={owed} />
                </dd>
              </div>
              <div className="px-5 py-3 sm:px-6">
                <dt className="text-sm text-muted-foreground">You owe</dt>
                <dd className="mt-0.5 font-semibold text-danger">
                  <MoneyList money={owes} />
                </dd>
              </div>
            </dl>
          ) : null}
        </section>
      )}

      {!isNew ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          <section aria-labelledby="people-heading" className="min-w-0">
            <SectionTitle id="people-heading" title="People" action={<SeeAll href="/people">All people</SeeAll>} />
            {openPeople.length > 0 ? (
              <PeopleList rows={openPeople.slice(0, 5)} />
            ) : (
              <p className="border border-border bg-card p-4 text-sm text-muted-foreground">
                No open balances with anyone.
              </p>
            )}
          </section>
          <section aria-labelledby="groups-heading" className="min-w-0">
            <SectionTitle id="groups-heading" title="Groups" action={<SeeAll href="/groups">All groups</SeeAll>} />
            {groups.length > 0 ? (
              <GroupList rows={groups.slice(0, 5)} />
            ) : (
              <p className="border border-border bg-card p-4 text-sm text-muted-foreground">
                You are not in any groups yet.{" "}
                <Link href="/groups/new" className="text-link hover:underline">
                  Create one
                </Link>
                .
              </p>
            )}
          </section>
        </div>
      ) : null}

      {feed.items.length > 0 ? (
        <section aria-labelledby="activity-heading">
          <SectionTitle
            id="activity-heading"
            title="Recent activity"
            action={<SeeAll href="/activity">All activity</SeeAll>}
          />
          <ActivityList items={feed.items} people={feed.people} viewerId={viewer.id} />
        </section>
      ) : null}
    </div>
  );
}
