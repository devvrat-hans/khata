import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { requireOnboardedViewer } from "@/server/auth/session";

export default async function SignedInLayout({ children }: { children: ReactNode }) {
  const viewer = await requireOnboardedViewer();
  return <AppShell viewer={viewer}>{children}</AppShell>;
}
