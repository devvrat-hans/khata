"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { ProfileInput } from "@/lib/validation";
import { getAuth } from "../auth/auth";
import { getDb } from "../db/client";
import { completeOnboarding, deleteAccount, updateProfile } from "../services/account";
import { type ActionResult, runAction } from "./result";

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  return runAction(async (viewer) => {
    await updateProfile(getDb(), viewer.id, input);
    revalidatePath("/", "layout");
    return null;
  });
}

export async function completeOnboardingAction(input: ProfileInput): Promise<ActionResult> {
  return runAction(async (viewer) => {
    await completeOnboarding(getDb(), viewer.id, input);
    revalidatePath("/", "layout");
    return null;
  });
}

export async function deleteAccountAction(): Promise<ActionResult> {
  return runAction(async (viewer) => {
    await deleteAccount(getDb(), viewer.id);
    // Sessions are already gone; this clears the cookie in the browser.
    await getAuth()
      .api.signOut({ headers: await headers() })
      .catch(() => undefined);
    return null;
  });
}
