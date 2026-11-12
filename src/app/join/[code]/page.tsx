import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLink, SectionLabel } from "@/components/editorial";
import { BareHeader } from "@/components/site-chrome";
import { GROUP_KIND_LABELS } from "@/lib/labels";
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
    <div className="flex min-h-dvh flex-col">
      <BareHeader href="/dashboard" />
      <main id="main-content" className="flex-1">
        <div className="container-site py-14 md:py-24">
          {preview ? (
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <SectionLabel>
                  {GROUP_KIND_LABELS[preview.group.kind]} · {preview.memberCount}{" "}
                  {preview.memberCount === 1 ? "person" : "people"}
                </SectionLabel>
                <h1 className="type-title mt-8 text-balance break-words md:mt-10">Join {preview.group.name}.</h1>
                <p className="type-lede mt-6 max-w-lg text-muted-foreground">
                  {preview.memberCount} {preview.memberCount === 1 ? "person is" : "people are"} splitting expenses in
                  this group. Once you join, you can see its expenses and add your own.
                </p>
              </div>
              <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
                <div>
                  <JoinButton code={code} />
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl">
              <SectionLabel>Join link</SectionLabel>
              <h1 className="type-title mt-8 text-balance md:mt-10">This link does not work.</h1>
              <p className="type-lede mt-6 text-muted-foreground">
                The group may have been deleted, or its owner reset the join link. Ask someone in the group for a new
                link.
              </p>
              <div className="mt-10">
                <ArrowLink href="/dashboard">Go to your home page</ArrowLink>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
