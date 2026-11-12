import type { Metadata } from "next";
import { GroupForm } from "@/components/groups/group-form";
import { PageTitle } from "@/components/page-title";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { listConnectedPeople } from "@/server/services/people";

export const metadata: Metadata = { title: "New group" };

export default async function NewGroupPage() {
  const viewer = await requireOnboardedViewer();
  const people = await listConnectedPeople(getDb(), viewer.id);
  const contacts = [...people.values()]
    .filter((person) => person.email)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name, email, image }) => ({ id, name, email, image }));

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <PageTitle
        eyebrow="New group"
        title="Start a shared ledger"
        description="Name it, pick a currency, and add the people you share costs with. They do not need an account first."
      />
      <div className="max-w-2xl">
        <GroupForm contacts={contacts} defaultCurrency={viewer.defaultCurrency} />
      </div>
    </div>
  );
}
