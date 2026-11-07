import "server-only";

import { ZodError } from "zod";
import { firstIssue } from "@/lib/validation";
import { getViewer, type Viewer } from "../auth/session";
import { AppError } from "../errors";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Runs a server action body and turns failures into a message for the form.
 * Errors meant for people (AppError, validation) keep their message; anything
 * else is logged and replaced, so internals never reach the browser.
 */
export async function runAction<T>(body: (viewer: Viewer) => Promise<T>): Promise<ActionResult<T>> {
  try {
    const viewer = await getViewer();
    if (!viewer) throw new AppError("unauthenticated", "Your session has ended. Sign in again to continue.");
    return { ok: true, data: await body(viewer) };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    if (error instanceof ZodError) return { ok: false, error: firstIssue(error) };
    console.error("[action] failed", error);
    return { ok: false, error: "Something went wrong on our side. Try again in a moment." };
  }
}
