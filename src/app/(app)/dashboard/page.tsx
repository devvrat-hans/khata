import type { Metadata } from "next";
import { ActivityList } from "@/components/activity-list";
import { ArrowLink, Index } from "@/components/editorial";
import { GroupList, PeopleList } from "@/components/lists";
import { BalanceHeadline, MoneyList } from "@/components/money";
import { EmptyNote, PageTitle, SectionTitle } from "@/components/page-title";
import { Stat, StatStrip } from "@/components/stats";
import { addTo, isZero, type MoneyByCurrency } from "@/domain/money";
import { firstName } from "@/lib/format";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { getFeed, getOverview } from "@/server/queries";
import { groupRows, peopleRows } from "@/server/rows";

export const metadata: Metadata = { title: "Home" };

const START = [
  {
    title: "Create a group",
    body: "For a trip, a flat or a team. Everyone sees the same expenses and the same balances.",
    href: "/groups/new",
    link: "New group",
  },
  {
    title: "Add a person",
    body: "Keep a one to one hisab with a friend, a flatmate or family, outside any group.",
    href: "/people?add=1",
    link: "Add a person",
  },
  {
    title: "Keep something private",
    body: "Inside any group, record an expense between just two people. The rest of the group never sees it.",
    href: null,
    link: null,
  },
] as const;

export default async function DashboardPage() {
  const viewer = await requireOnboardedViewer();
  const db = getDb();
  const [overview, feed] = await Promise.all([getOverview(db, viewer), getFeed(db, viewer, { limit: 6 })]);
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
    <div className="flex flex-col gap-14 md:gap-20">
      <PageTitle
        eyebrow="Your khata"
        title={`Hello, ${firstName(viewer.name)}`}
        description={
          isNew
            ? "Start with a group or a person you share costs with. Khata keeps the hisab from there."
            : undefined
        }
        actions={
          isNew ? null : (
            <>
              {!allSettled ? <ArrowLink href="/settle">Settle up</ArrowLink> : null}
              <ArrowLink href="/groups/new">New group</ArrowLink>
            </>
          )
        }
      />

      {isNew ? (
        <section aria-label="Get started" className="border-y border-border">
          <ol className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
            {START.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col gap-5 py-8 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0"
              >
                <Index value={index + 1} />
                <div>
                  <h2 className="text-xl leading-snug font-medium tracking-[-0.025em]">{step.title}</h2>
                  <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
                <div className="mt-auto pt-1">
                  {step.href ? (
                    <ArrowLink href={step.href}>{step.link}</ArrowLink>
                  ) : (
                    <p className="text-sm text-muted-foreground">On any expense in a group.</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section aria-label="Your balance" className="flex flex-col gap-10">
          <BalanceHeadline
            balance={net}
            settledLabel={owedAndOwing ? "You are even overall" : "You are all settled up"}
          />
          <StatStrip>
            <Stat label="Owed to you" tone={isZero(owed) ? "muted" : "success"}>
              <MoneyList money={owed} />
            </Stat>
            <Stat label="You owe" tone={isZero(owes) ? "muted" : "danger"}>
              <MoneyList money={owes} />
            </Stat>
            <Stat label="Groups">{groups.length}</Stat>
            <Stat label="Open hisabs">{openPeople.length}</Stat>
          </StatStrip>
        </section>
      )}

      {!isNew ? (
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-12">
          <section aria-labelledby="people-heading" className="min-w-0">
            <SectionTitle
              id="people-heading"
              title="People"
              count={openPeople.length}
              action={<ArrowLink href="/people">All people</ArrowLink>}
            />
            {openPeople.length > 0 ? (
              <PeopleList rows={openPeople.slice(0, 5)} />
            ) : (
              <EmptyNote>No open balances with anyone.</EmptyNote>
            )}
          </section>
          <section aria-labelledby="groups-heading" className="min-w-0">
            <SectionTitle
              id="groups-heading"
              title="Groups"
              count={groups.length}
              action={<ArrowLink href="/groups">All groups</ArrowLink>}
            />
            {groups.length > 0 ? (
              <GroupList rows={groups.slice(0, 5)} />
            ) : (
              <EmptyNote>
                You are not in any groups yet.{" "}
                <ArrowLink href="/groups/new" className="ml-1">
                  Create one
                </ArrowLink>
              </EmptyNote>
            )}
          </section>
        </div>
      ) : null}

      {feed.items.length > 0 ? (
        <section aria-labelledby="activity-heading">
          <SectionTitle
            id="activity-heading"
            title="Recent activity"
            action={<ArrowLink href="/activity">All activity</ArrowLink>}
          />
          <ActivityList items={feed.items} people={feed.people} viewerId={viewer.id} />
        </section>
      ) : null}
    </div>
  );
}
