import { Button } from "@aback-ui/ui";
import {
  IconArrowDownLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconLock,
  IconUserPlus,
  IconUsersGroup,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActivityList } from "@/components/activity-list";
import { GroupList, PeopleList } from "@/components/lists";
import { MoneyList } from "@/components/money";
import { PageTitle, SectionTitle } from "@/components/page-title";
import { firstName } from "@/lib/format";
import { isZero } from "@/domain/money";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { getFeed, getOverview } from "@/server/queries";
import { groupRows, peopleRows } from "@/server/rows";

export const metadata: Metadata = { title: "Home" };

function Total({
  label,
  money,
  tone,
  icon: Icon,
}: {
  label: string;
  money: Record<string, number>;
  tone: "success" | "danger";
  icon: typeof IconArrowDownLeft;
}) {
  const empty = isZero(money);
  return (
    <div className="flex items-start gap-3 border border-border bg-card p-4 shadow-sm">
      <span
        className={
          tone === "success"
            ? "flex size-9 shrink-0 items-center justify-center bg-success-soft text-success"
            : "flex size-9 shrink-0 items-center justify-center bg-danger-soft text-danger"
        }
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={
            empty
              ? "mt-0.5 text-2xl font-bold tracking-tight text-muted-foreground"
              : `mt-0.5 text-2xl font-bold tracking-tight ${tone === "success" ? "text-success" : "text-danger"}`
          }
        >
          {empty ? "Nothing" : <MoneyList money={money} />}
        </p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const viewer = await requireOnboardedViewer();
  const db = getDb();
  const [overview, feed] = await Promise.all([getOverview(db, viewer), getFeed(db, viewer, { limit: 6 })]);
  const people = peopleRows(overview, viewer.id);
  const groups = groupRows(overview);
  const openPeople = people.filter((row) => !isZero(row.balance));
  const isNew = groups.length === 0 && people.length === 0;

  const summary =
    isZero(overview.balances.owes) && isZero(overview.balances.owed)
      ? "You are all settled up."
      : "Here is where things stand across your groups and hisabs.";

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title={`Hello, ${firstName(viewer.name)}`}
        description={isNew ? "Start by creating a group or adding a person you share costs with." : summary}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/settle">Settle up</Link>
            </Button>
            <Button asChild variant="brand" className="hidden md:inline-flex">
              <Link href="/expenses/new">Add expense</Link>
            </Button>
          </>
        }
      />

      <section aria-label="Totals" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Total label="You are owed" money={overview.balances.owed} tone="success" icon={IconArrowDownLeft} />
        <Total label="You owe" money={overview.balances.owes} tone="danger" icon={IconArrowUpRight} />
      </section>

      {isNew ? (
        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link
            href="/groups/new"
            className="group flex flex-col gap-3 border-2 border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
          >
            <IconUsersGroup aria-hidden="true" className="size-6 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-400">
              Create a group
            </span>
            <span className="text-sm text-muted-foreground">
              For a trip, a flat or a team. Everyone sees the same expenses and balances.
            </span>
          </Link>
          <Link
            href="/people?add=1"
            className="group flex flex-col gap-3 border-2 border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
          >
            <IconUserPlus aria-hidden="true" className="size-6 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold group-hover:text-primary-700 dark:group-hover:text-primary-400">
              Add a person
            </span>
            <span className="text-sm text-muted-foreground">
              Keep a one to one hisab with a friend, a flatmate or family.
            </span>
          </Link>
          <div className="flex flex-col gap-3 border-2 border-primary-200 bg-primary-50/50 p-5 dark:border-primary-800/60 dark:bg-primary-950/30">
            <IconLock aria-hidden="true" className="size-6 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold">Private hisab in a group</span>
            <span className="text-sm text-muted-foreground">
              Inside any group, record something between just two people. The rest of the group never sees it.
            </span>
          </div>
        </section>
      ) : null}

      {!isNew ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section aria-labelledby="people-heading">
            <SectionTitle
              id="people-heading"
              title="People"
              action={
                <Link
                  href="/people"
                  className="inline-flex items-center gap-1 text-sm font-medium text-link hover:text-link-hover"
                >
                  All people
                  <IconArrowRight aria-hidden="true" className="size-4" />
                </Link>
              }
            />
            {openPeople.length > 0 ? (
              <PeopleList rows={openPeople.slice(0, 6)} />
            ) : (
              <p className="border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                No open balances with anyone. Nice.
              </p>
            )}
          </section>
          <section aria-labelledby="groups-heading">
            <SectionTitle
              id="groups-heading"
              title="Groups"
              action={
                <Link
                  href="/groups"
                  className="inline-flex items-center gap-1 text-sm font-medium text-link hover:text-link-hover"
                >
                  All groups
                  <IconArrowRight aria-hidden="true" className="size-4" />
                </Link>
              }
            />
            {groups.length > 0 ? (
              <GroupList rows={groups.slice(0, 6)} />
            ) : (
              <p className="border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
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
            action={
              <Link
                href="/activity"
                className="inline-flex items-center gap-1 text-sm font-medium text-link hover:text-link-hover"
              >
                All activity
                <IconArrowRight aria-hidden="true" className="size-4" />
              </Link>
            }
          />
          <ActivityList items={feed.items} people={feed.people} viewerId={viewer.id} />
        </section>
      ) : null}
    </div>
  );
}
