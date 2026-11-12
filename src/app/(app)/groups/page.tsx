import { Button } from "@aback-ui/ui";
import { IconPlus } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GroupList } from "@/components/lists";
import { EmptyPanel, PageTitle } from "@/components/page-title";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { getOverview } from "@/server/queries";
import { groupRows } from "@/server/rows";

export const metadata: Metadata = { title: "Groups" };

export default async function GroupsPage() {
  const viewer = await requireOnboardedViewer();
  const overview = await getOverview(getDb(), viewer);
  const rows = groupRows(overview);

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <PageTitle
        eyebrow="Shared ledgers"
        title="Groups"
        description="Trips, flats and teams. Everyone in a group sees the same expenses and the same balances."
        actions={
          <Button asChild variant="brand" size="lg">
            <Link href="/groups/new">
              <IconPlus aria-hidden="true" />
              New group
            </Link>
          </Button>
        }
      />
      {rows.length > 0 ? (
        <GroupList rows={rows} />
      ) : (
        <EmptyPanel
          title="No groups yet."
          description="Create a group for a trip, your flat or anything you share. Add people by email; they do not need an account first."
          action={
            <Button asChild variant="brand" size="lg">
              <Link href="/groups/new">Create a group</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
