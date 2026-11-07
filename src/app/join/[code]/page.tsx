import { Button } from "@aback-ui/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GROUP_KIND_ICONS, IconChip } from "@/components/icons";
import { Logo } from "@/components/logo";
import { requireViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { previewInvite } from "@/server/services/groups";
import { JoinButton } from "./join-button";

export const metadata: Metadata = { title: "Join a group", robots: { index: false } };

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const viewer = await requireViewer();
  if (!viewer.onboarded) redirect(`/welcome?next=${encodeURIComponent(`/join/${code}`)}`);

  let preview: Awaited<ReturnType<typeof previewInvite>> | null = null;
  try {
    preview = await previewInvite(getDb(), viewer.id, code);
  } catch (error) {
    if (!(error instanceof AppError && error.code === "not_found")) throw error;
  }
  if (preview?.alreadyMember) redirect(`/groups/${preview.group.id}`);

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="flex h-16 items-center border-b border-separator bg-background px-4 md:px-6">
        <Logo href="/dashboard" />
      </header>
      <main id="main-content" className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-sm border border-border bg-card p-6 shadow-sm sm:p-8">
          {preview ? (
            <>
              <IconChip icon={GROUP_KIND_ICONS[preview.group.kind]} size="lg" />
              <h1 className="mt-4 text-2xl font-bold tracking-tight">Join “{preview.group.name}”</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {preview.memberCount} {preview.memberCount === 1 ? "person is" : "people are"} splitting expenses in
                this group. Once you join, you can see its expenses and add your own.
              </p>
              <div className="mt-6">
                <JoinButton code={code} />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">This link does not work</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The group may have been deleted, or its owner reset the join link. Ask someone in the group for a new
                link.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/dashboard">Go to your home page</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
