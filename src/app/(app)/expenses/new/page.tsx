import { IconLock } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { newExpenseValues } from "@/components/expenses/initial-values";
import { GroupList, PeopleList } from "@/components/lists";
import { ArrowLink } from "@/components/editorial";
import { EmptyPanel, PageTitle, SectionTitle } from "@/components/page-title";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { getGroupFormContext, getOverview } from "@/server/queries";
import { groupRows, peopleRows } from "@/server/rows";
import { getConnectedPerson } from "@/server/services/people";

export const metadata: Metadata = { title: "Add expense" };

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof AppError && error.code === "not_found") notFound();
    throw error;
  }
}

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireOnboardedViewer();
  const params = await searchParams;
  const groupId = one(params.group);
  const personId = one(params.person);
  const privateWith = one(params.with);
  const db = getDb();
  const me = { id: viewer.id, name: viewer.name, image: viewer.image };
  // The form fills in today in the browser, in the person's own time zone.
  const today = "";

  if (groupId) {
    const { group, members } = await orNotFound(getGroupFormContext(db, viewer.id, groupId));
    const memberIds = members.map((member) => member.id);
    const firstOther = memberIds.find((memberId) => memberId !== viewer.id) ?? null;
    const validPrivate =
      privateWith && privateWith !== viewer.id && memberIds.includes(privateWith)
        ? privateWith
        : one(params.private) === "1"
          ? firstOther
          : null;
    return (
      <div className="flex flex-col gap-12 md:gap-14">
        <PageTitle
          eyebrow={
            <Link href={`/groups/${group.id}`} className="link-inline">
              {group.name}
            </Link>
          }
          title="Add an expense"
        />
        <ExpenseForm
            viewer={me}
            context={{
              kind: "group",
              groupId: group.id,
              groupName: group.name,
              members: members.map(({ id, name, image }) => ({ id, name, image })),
            }}
            initial={newExpenseValues({
              viewerId: viewer.id,
              peopleIds: memberIds,
              currency: group.currency,
              date: today,
              privateWith: validPrivate,
            })}
            cancelHref={`/groups/${group.id}`}
          />
      </div>
    );
  }

  if (personId) {
    const person = await orNotFound(getConnectedPerson(db, viewer.id, personId));
    return (
      <div className="flex flex-col gap-12 md:gap-14">
        <PageTitle
          eyebrow={
            <Link href={`/people/${person.id}`} className="link-inline inline-flex items-center gap-1.5">
              <IconLock aria-hidden="true" className="size-3.5 text-primary-700 dark:text-primary-400" />
              Between you and {person.name}
            </Link>
          }
          title="Add an expense"
        />
        <ExpenseForm
            viewer={me}
            context={{ kind: "person", person: { id: person.id, name: person.name, image: person.image } }}
            initial={newExpenseValues({
              viewerId: viewer.id,
              peopleIds: [viewer.id, person.id],
              currency: viewer.defaultCurrency,
              date: today,
            })}
            cancelHref={`/people/${person.id}`}
          />
      </div>
    );
  }

  // No context yet: ask where the expense belongs.
  const overview = await getOverview(db, viewer);
  const groups = groupRows(overview);
  const people = peopleRows(overview, viewer.id);

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <PageTitle
        eyebrow="New expense"
        title="Add an expense"
        description="Choose the group or the person it belongs to."
      />
      {groups.length === 0 && people.length === 0 ? (
        <EmptyPanel
          title="Nobody to split with yet."
          description="Create a group or add a person first. Then come back to add the expense."
          action={
            <>
              <ArrowLink href="/groups/new">Create a group</ArrowLink>
              <ArrowLink href="/people?add=1">Add a person</ArrowLink>
            </>
          }
        />
      ) : null}
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-12">
        {groups.length > 0 ? (
          <section aria-labelledby="pick-group" className="min-w-0">
            <SectionTitle id="pick-group" title="In a group" count={groups.length} />
            <GroupList rows={groups} hrefFor={(id) => `/expenses/new?group=${id}`} />
          </section>
        ) : null}
        {people.length > 0 ? (
          <section aria-labelledby="pick-person" className="min-w-0">
            <SectionTitle id="pick-person" title="With one person" count={people.length} />
            <PeopleList rows={people} hrefFor={(id) => `/expenses/new?person=${id}`} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
