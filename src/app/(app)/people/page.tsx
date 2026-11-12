import type { Metadata } from "next";
import { PeopleList } from "@/components/lists";
import { EmptyPanel, PageTitle, SectionTitle } from "@/components/page-title";
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
    <div className="flex flex-col gap-12 md:gap-16">
      <PageTitle
        eyebrow="Your hisabs"
        title="People"
        description="Everyone you share costs with, and where you stand with each of them across groups and one to one hisabs."
      />

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12">
        <section aria-labelledby="people-heading" className="min-w-0 lg:col-span-7">
          <SectionTitle id="people-heading" title="Everyone" count={rows.length} />
          {rows.length > 0 ? (
            <PeopleList rows={rows} />
          ) : (
            <EmptyPanel
              title="Nobody here yet."
              description="People appear here when you add them, or when you share a group with them."
            />
          )}
        </section>

        <section aria-labelledby="add-heading" className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <SectionTitle id="add-heading" title="Start a one to one hisab" />
            <p className="mb-6 text-[0.9375rem] leading-relaxed text-muted-foreground">
              For a friend, a flatmate or family. Only the two of you see what you record. They get an email, and do
              not need an account first.
            </p>
            <AddPersonForm autoFocus={params.add === "1"} />
          </div>
        </section>
      </div>
    </div>
  );
}
