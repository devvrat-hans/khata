import { Button, EmptyState } from "@aback-ui/ui";
import { IconPlus, IconUsersGroup } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GroupList } from "@/components/lists";
import { PageTitle } from "@/components/page-title";
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
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Groups"
        description="Trips, flats, teams: everyone in a group sees the same expenses and balances."
        actions={
          <Button asChild variant="brand">
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
        <EmptyState
          icon={<IconUsersGroup aria-hidden="true" />}
          title="No groups yet"
          description="Create a group for a trip, your flat or anything you share. Add people by email; they do not need an account first."
          action={
            <Button asChild variant="brand">
              <Link href="/groups/new">Create a group</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
