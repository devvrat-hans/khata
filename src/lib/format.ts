/** Date helpers. Calendar dates are "YYYY-MM-DD" strings without a time zone. */

/** Today in the given time zone, as "YYYY-MM-DD". */
export function todayIso(timeZone?: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

function parseIso(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

/** "7 Nov" for this year, "7 Nov 2025" otherwise. */
export function formatDay(date: string, now = new Date()): string {
  const value = parseIso(date);
  const sameYear = value.getUTCFullYear() === now.getUTCFullYear();
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  }).format(value);
}

/** "Friday, 7 November 2026". */
export function formatLongDay(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseIso(date));
}

/** "November 2026", for grouping lists by month. */
export function formatMonth(date: string): string {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(parseIso(date));
}

/** The pieces of a date for a calendar-style badge. */
export function dayParts(date: string): { month: string; day: string } {
  const value = parseIso(date);
  return {
    month: new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" }).format(value),
    day: String(value.getUTCDate()),
  };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** "Asha", "Asha and Bilal", "Asha, Bilal and 2 others". */
export function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]} and ${names[2]}`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} others`;
}

/** First name only, for compact lists. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
