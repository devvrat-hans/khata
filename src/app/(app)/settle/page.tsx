import { EmptyState } from "@aback-ui/ui";
import { IconCircleCheck } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { type SettlePerson, SettleForm } from "@/components/settle/settle-form";
import { SuggestionList } from "@/components/settle/suggestion-list";
import { isSupportedCurrency, toDecimalString } from "@/domain/money";
import { type Viewer, requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { getGroupFormContext, getOverview } from "@/server/queries";
import { settleSuggestions } from "@/server/settle-suggestions";
import { getConnectedPerson } from "@/server/services/people";

export const metadata: Metadata = { title: "Settle up" };

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function asPerson(viewer: Viewer): SettlePerson {
  return { id: viewer.id, name: viewer.name, image: viewer.image, upiId: viewer.upiId };
}

async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof AppError && error.code === "not_found") notFound();
    throw error;
  }
}

export default async function SettlePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireOnboardedViewer();
  const params = await searchParams;
  const db = getDb();
  const groupId = one(params.group);
  const personId = one(params.person);
  const requestedCurrency = one(params.currency)?.toUpperCase();
  const amount = one(params.amount) ?? "";
  const isPrivate = one(params.private) === "1";

  if (groupId) {
    const { group, members } = await orNotFound(getGroupFormContext(db, viewer.id, groupId));
    const ids = members.map((member) => member.id);
    const otherDefault = ids.find((id) => id !== viewer.id) ?? viewer.id;
    const from = one(params.from);
    const to = one(params.to);
    const currency = requestedCurrency && isSupportedCurrency(requestedCurrency) ? requestedCurrency : group.currency;
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <PageTitle
          eyebrow={
            <Link href={`/groups/${group.id}`} className="hover:text-foreground">
              {group.name}
            </Link>
          }
          title="Record a payment"
          description="Pay back what you owe, or record money you received."
        />
        <div className="border border-border bg-card p-5 sm:p-6">
          <SettleForm
            viewer={asPerson(viewer)}
            context={{
              kind: "group",
              groupId: group.id,
              groupName: group.name,
              members: members.map(({ id, name, image, upiId }) => ({ id, name, image, upiId })),
            }}
            initial={{
              from: from && ids.includes(from) ? from : viewer.id,
              to: to && ids.includes(to) ? to : otherDefault,
              amount,
              currency,
              isPrivate,
            }}
            cancelHref={`/groups/${group.id}`}
          />
        </div>
      </div>
    );
  }

  if (personId) {
    const person = await orNotFound(getConnectedPerson(db, viewer.id, personId));
    const overview = await getOverview(db, viewer);
    const direct = overview.balances.people
      .get(person.id)
      ?.parts.find((part) => part.source.kind === "direct")?.amount;
    const [firstCurrency, firstAmount] = Object.entries(direct ?? {})[0] ?? [];
    const currency =
      requestedCurrency && isSupportedCurrency(requestedCurrency)
        ? requestedCurrency
        : (firstCurrency ?? viewer.defaultCurrency);
    const owesViewer = (firstAmount ?? 0) > 0;
    const ids = [viewer.id, person.id];
    const from = one(params.from);
    const to = one(params.to);
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <PageTitle
          eyebrow={
            <Link href={`/people/${person.id}`} className="hover:text-foreground">
              You and {person.name}
            </Link>
          }
          title="Record a payment"
          description="This settles your one to one hisab. To settle a balance from a group, record it in that group."
        />
        <div className="border border-border bg-card p-5 sm:p-6">
          <SettleForm
            viewer={asPerson(viewer)}
            context={{
              kind: "person",
              person: { id: person.id, name: person.name, image: person.image, upiId: person.upiId },
            }}
            initial={{
              from: from && ids.includes(from) ? from : owesViewer ? person.id : viewer.id,
              to: to && ids.includes(to) ? to : owesViewer ? viewer.id : person.id,
              amount: amount || (firstAmount && firstCurrency ? toDecimalString(Math.abs(firstAmount), firstCurrency) : ""),
              currency,
              isPrivate: false,
            }}
            cancelHref={`/people/${person.id}`}
          />
        </div>
      </div>
    );
  }

  const overview = await getOverview(db, viewer);
  const suggestions = settleSuggestions(overview, viewer.id);
  const youOwe = suggestions.filter((suggestion) => suggestion.amount < 0);
  const owedToYou = suggestions.filter((suggestion) => suggestion.amount > 0);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageTitle
        title="Settle up"
        description="Every open balance, where it lives. Record a payment in the same place so every balance stays right."
      />
      {suggestions.length === 0 ? (
        <EmptyState
          icon={<IconCircleCheck aria-hidden="true" />}
          title="You are all settled up"
          description="Nobody owes you and you owe nobody. Enjoy it."
        />
      ) : null}
      {youOwe.length > 0 ? (
        <section aria-labelledby="you-owe">
          <h2 id="you-owe" className="mb-3 text-lg font-semibold">
            You owe
          </h2>
          <SuggestionList suggestions={youOwe} people={overview.people} />
        </section>
      ) : null}
      {owedToYou.length > 0 ? (
        <section aria-labelledby="owed-to-you">
          <h2 id="owed-to-you" className="mb-3 text-lg font-semibold">
            Owed to you
          </h2>
          <SuggestionList suggestions={owedToYou} people={overview.people} />
        </section>
      ) : null}
    </div>
  );
}
