import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuth } from "./auth";

/** The signed-in person, as the rest of the app sees them. */
export interface Viewer {
  id: string;
  name: string;
  email: string;
  image: string | null;
  defaultCurrency: string;
  upiId: string | null;
  emailNotifications: boolean;
  onboarded: boolean;
}

/**
 * Reads the session cookie and loads the person behind it. Cached for the
 * request, so layouts and pages can both ask without a second query.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // Reading the request headers first marks every page that asks for the
  // viewer as rendered per request, so the build never tries to prerender it.
  const requestHeaders = await headers();
  const result = await getAuth().api.getSession({ headers: requestHeaders });
  if (!result) return null;
  const row = result.user;
  if (row.deletedAt) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image ?? null,
    defaultCurrency: row.defaultCurrency ?? "INR",
    upiId: row.upiId ?? null,
    emailNotifications: row.emailNotifications ?? true,
    onboarded: Boolean(row.onboardedAt),
  };
});

/** For pages: sends visitors without a session to sign in. */
export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  return viewer;
}

/** For pages inside the app: also sends first-time visitors through onboarding, then back. */
export async function requireOnboardedViewer(): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!viewer.onboarded) {
    const path = (await headers()).get("x-khata-path");
    redirect(path && path.startsWith("/") && !path.startsWith("//") ? `/welcome?next=${encodeURIComponent(path)}` : "/welcome");
  }
  return viewer;
}
