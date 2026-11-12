import type { Metadata } from "next";
import { ActivityList } from "@/components/activity-list";
import { ArrowLink } from "@/components/editorial";
import { EmptyPanel, PageTitle } from "@/components/page-title";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { getFeed } from "@/server/queries";

export const metadata: Metadata = { title: "Activity" };

const PAGE_SIZE = 40;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireOnboardedViewer();
  const params = await searchParams;
  const beforeParam = typeof params.before === "string" ? Number(params.before) : Number.NaN;
  const before =
    Number.isFinite(beforeParam) && typeof params.id === "string"
      ? { createdAt: new Date(beforeParam), id: params.id }
      : undefined;
  const feed = await getFeed(getDb(), viewer, { limit: PAGE_SIZE, before });
  const last = feed.items.at(-1)?.activity;

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <PageTitle
        eyebrow="History"
        title="Activity"
        description="Everything that changed in your groups and hisabs. Private items are only shown to the two people involved."
      />
      {feed.items.length > 0 ? (
        <div className="flex flex-col gap-8">
          <ActivityList items={feed.items} people={feed.people} viewerId={viewer.id} />
          {feed.items.length === PAGE_SIZE && last ? (
            <ArrowLink href={`/activity?before=${last.createdAt.getTime()}&id=${last.id}`}>Show older activity</ArrowLink>
          ) : null}
        </div>
      ) : (
        <EmptyPanel
          title={before ? "No older activity." : "Nothing here yet."}
          description="When you or the people you share costs with add expenses or payments, they show up here."
        />
      )}
    </div>
  );
}
