import { EmptyState } from "@aback-ui/ui";
import { IconUser } from "@tabler/icons-react";
import type { Metadata } from "next";
import { PeopleList } from "@/components/lists";
import { PageTitle } from "@/components/page-title";
import { AddPersonForm } from "@/components/people/add-person-form";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { getOverview } from "@/server/queries";
import { peopleRows } from "@/server/rows";

export const metadata: Metadata = { title: "People" };

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireOnboardedViewer();
  const params = await searchParams;
  const overview = await getOverview(getDb(), viewer);
  const rows = peopleRows(overview, viewer.id);

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="People"
        description="Everyone you share costs with, and where you stand with each of them across groups and one to one hisabs."
      />

      <section aria-labelledby="add-heading" className="border border-border bg-card p-5">
        <h2 id="add-heading" className="text-lg font-semibold">
          Start a one to one hisab
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          For a friend, a flatmate or family. Only the two of you see what you record.
        </p>
        <AddPersonForm autoFocus={params.add === "1"} />
      </section>

      {rows.length > 0 ? (
        <PeopleList rows={rows} />
      ) : (
        <EmptyState
          icon={<IconUser aria-hidden="true" />}
          title="Nobody here yet"
          description="People appear here when you add them, or when you share a group with them."
        />
      )}
    </div>
  );
}
