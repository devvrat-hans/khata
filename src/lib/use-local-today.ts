"use client";

import { useSyncExternalStore } from "react";

function localToday(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

const noop = () => () => {};

/**
 * Today's date ("2026-11-07") in the browser's own time zone. The server
 * render returns "" and the browser fills it in after hydration, so there is
 * no mismatch and no effect that sets state.
 */
export function useLocalToday(): string {
  return useSyncExternalStore(noop, localToday, () => "");
}
