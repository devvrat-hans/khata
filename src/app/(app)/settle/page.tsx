import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyPanel, PageTitle, SectionTitle } from "@/components/page-title";
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
      <div className="flex flex-col gap-12 md:gap-14">
        <PageTitle
          eyebrow={
            <Link href={`/groups/${group.id}`} className="link-inline">
              {group.name}
            </Link>
          }
          title="Record a payment"
          description="Pay back what you owe, or record money you received."
        />
        <div className="max-w-2xl">
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
      <div className="flex flex-col gap-12 md:gap-14">
        <PageTitle
          eyebrow={
            <Link href={`/people/${person.id}`} className="link-inline">
              You and {person.name}
            </Link>
          }
          title="Record a payment"
          description="This settles your one to one hisab. To settle a balance from a group, record it in that group."
        />
        <div className="max-w-2xl">
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
    <div className="flex flex-col gap-12 md:gap-16">
      <PageTitle
        eyebrow="Settle up"
        title={suggestions.length === 0 ? "All square." : "Who to pay, who pays you"}
        description="Every open balance, where it lives. Record a payment in the same place, so every balance stays right."
      />
      {suggestions.length === 0 ? (
        <EmptyPanel
          title="You are all settled up."
          description="Nobody owes you and you owe nobody. Enjoy it."
        />
      ) : null}
      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-12">
          {youOwe.length > 0 ? (
            <section aria-labelledby="you-owe" className="min-w-0">
              <SectionTitle id="you-owe" title="You owe" count={youOwe.length} />
              <SuggestionList suggestions={youOwe} people={overview.people} />
            </section>
          ) : null}
          {owedToYou.length > 0 ? (
            <section aria-labelledby="owed-to-you" className="min-w-0">
              <SectionTitle id="owed-to-you" title="Owed to you" count={owedToYou.length} />
              <SuggestionList suggestions={owedToYou} people={overview.people} />
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
