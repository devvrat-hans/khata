import { Button, EmptyState } from "@aback-ui/ui";
import { IconCash, IconLock, IconPlus } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BalanceHeadline } from "@/components/money";
import { PageTitle, SectionTitle } from "@/components/page-title";
import { ReminderButton } from "@/components/people/reminder-button";
import { PersonAvatar } from "@/components/person-avatar";
import { RecordsList } from "@/components/records-list";
import { SuggestionList } from "@/components/settle/suggestion-list";
import { firstName } from "@/lib/format";
import { getViewer, requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { getPersonPage } from "@/server/queries";
import { getConnectedPerson } from "@/server/services/people";
import { settleSuggestions } from "@/server/settle-suggestions";

export async function generateMetadata({ params }: { params: Promise<{ personId: string }> }): Promise<Metadata> {
  const viewer = await getViewer();
  if (!viewer) return { title: "Hisab" };
  const person = await getConnectedPerson(getDb(), viewer.id, (await params).personId).catch(() => null);
  return { title: person ? `You and ${person.name}` : "Hisab" };
}

export default async function PersonPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params;
  const viewer = await requireOnboardedViewer();
  const db = getDb();
  const page = await getPersonPage(db, viewer, personId).catch((error: unknown) => {
    if (error instanceof AppError && error.code === "not_found") notFound();
    throw error;
  });
  const { person, balance } = page;
  const first = firstName(person.name);
  const suggestions = settleSuggestions(page.overview, viewer.id).filter(
    (suggestion) => suggestion.personId === person.id,
  );
  const owesViewer = Object.values(balance.total).some((value) => value > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        description={person.joined ? person.email : `${person.email}, invited and has not signed in yet`}
        title={
          <span className="flex items-center gap-3">
            <PersonAvatar person={person} size="lg" />
            <span className="min-w-0 break-words">{person.name}</span>
          </span>
        }
        actions={
          <>
            <Button asChild variant="brand" className="flex-1 sm:flex-none">
              <Link href={`/expenses/new?person=${person.id}`}>
                <IconPlus aria-hidden="true" />
                Add expense
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link href={`/settle?person=${person.id}`}>
                <IconCash aria-hidden="true" />
                Settle up
              </Link>
            </Button>
          </>
        }
      />

      <section aria-label="Balance" className="border border-border bg-card">
        <div className="p-5 sm:p-6">
          <BalanceHeadline
            balance={balance.total}
            owedLabel={`${first} owes you`}
            owesLabel={`You owe ${first}`}
            settledLabel={`You and ${first} are settled up`}
          />
        </div>
        {owesViewer ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border px-5 py-3 sm:px-6">
            <ReminderButton
              personId={person.id}
              disabledReason={page.remindedAt ? "You can send one reminder a day." : undefined}
            />
            <span className="text-sm text-muted-foreground">
              {page.remindedAt
                ? "You reminded them today. You can send another tomorrow."
                : `${first} gets a friendly email${viewer.upiId ? " with your UPI ID" : ""}.`}
            </span>
          </div>
        ) : null}
      </section>

      {suggestions.length > 0 ? (
        <section aria-labelledby="settle-heading">
          <SectionTitle id="settle-heading" title="Open balances" />
          <SuggestionList suggestions={suggestions} people={page.people} />
        </section>
      ) : null}

      <section aria-labelledby="between-heading">
        <SectionTitle id="between-heading" title={`Between you and ${first}`} />
        <p className="-mt-2 mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconLock aria-hidden="true" className="size-3.5" />
          Only the two of you can see these, including private hisabs inside groups.
        </p>
        {page.records.length > 0 ? (
          <RecordsList records={page.records} people={page.people} viewerId={viewer.id} groupNames={page.groupNames} />
        ) : (
          <EmptyState
            title="Nothing recorded between you two yet"
            description="Add an expense that is just between the two of you."
            action={
              <Button asChild variant="brand">
                <Link href={`/expenses/new?person=${person.id}`}>Add expense</Link>
              </Button>
            }
          />
        )}
      </section>

      {page.sharedGroups.length > 0 ? (
        <section aria-labelledby="groups-heading">
          <SectionTitle id="groups-heading" title="Groups you share" />
          <ul className="flex flex-wrap gap-2">
            {page.sharedGroups.map((group) => (
              <li key={group.id}>
                <Link
                  href={`/groups/${group.id}`}
                  className="inline-flex items-center gap-1.5 border border-separator px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-400"
                >
                  {group.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Something private inside one of these groups?{" "}
            {page.sharedGroups[0] ? (
              <Link
                href={`/expenses/new?group=${page.sharedGroups[0].id}&with=${person.id}`}
                className="text-link hover:underline"
              >
                Add a private expense
              </Link>
            ) : null}
          </p>
        </section>
      ) : null}
    </div>
  );
}
