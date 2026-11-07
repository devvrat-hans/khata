import "server-only";

import { and, eq, inArray, isNull } from "drizzle-orm";
import type { Database } from "../db/client";
import { type User, user } from "../db/schema";
import { invalid } from "../errors";
import { newId } from "../ids";

export interface PersonInput {
  email: string;
  name?: string;
}

/** The public face of a user: what other people in the app may see. */
export interface PersonSummary {
  id: string;
  name: string;
  email: string;
  image: string | null;
  /** False until the person signs in for the first time. */
  joined: boolean;
  upiId: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

/** A display name for someone we only know by email: the part before the @. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const words = local.replace(/[._+-]+/g, " ").trim();
  if (!words) return email;
  return words
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .slice(0, 60);
}

export function toPersonSummary(row: User): PersonSummary {
  const deleted = row.deletedAt !== null;
  return {
    id: row.id,
    name: deleted ? "Deleted account" : row.name || nameFromEmail(row.email),
    email: deleted ? "" : row.email,
    image: deleted ? null : row.image,
    joined: row.emailVerified && !deleted,
    upiId: deleted ? null : row.upiId,
  };
}

export async function getPeople(db: Database, ids: readonly string[]): Promise<Map<string, PersonSummary>> {
  const unique = [...new Set(ids)];
  const result = new Map<string, PersonSummary>();
  // D1 allows 100 bound parameters per statement.
  for (let index = 0; index < unique.length; index += 90) {
    const chunk = unique.slice(index, index + 90);
    const rows = await db.select().from(user).where(inArray(user.id, chunk));
    for (const row of rows) result.set(row.id, toPersonSummary(row));
  }
  return result;
}

/**
 * Finds people by email, creating a placeholder account for anyone who has
 * never signed in. The placeholder has no credentials; the first sign in with
 * that address takes it over.
 */
export async function findOrCreateUsers(
  db: Database,
  people: readonly PersonInput[],
): Promise<{ user: User; created: boolean }[]> {
  const byEmail = new Map<string, PersonInput>();
  for (const person of people) {
    const email = normalizeEmail(person.email);
    if (!isValidEmail(email)) throw invalid(`"${person.email}" is not a valid email address.`);
    if (!byEmail.has(email)) byEmail.set(email, { email, name: person.name?.trim() });
  }
  const emails = [...byEmail.keys()];
  if (emails.length === 0) return [];
  if (emails.length > 50) throw invalid("Add at most 50 people at a time.");

  const existing = await db.select().from(user).where(inArray(user.email, emails));
  const existingEmails = new Set(existing.map((row) => row.email));
  const missing = emails.filter((email) => !existingEmails.has(email));

  if (missing.length > 0) {
    await db
      .insert(user)
      .values(
        missing.map((email) => ({
          id: newId(),
          email,
          name: (byEmail.get(email)?.name || nameFromEmail(email)).slice(0, 60),
          emailVerified: false,
        })),
      )
      .onConflictDoNothing({ target: user.email });
  }

  const rows = missing.length > 0 ? await db.select().from(user).where(inArray(user.email, emails)) : existing;
  const order = new Map(emails.map((email, index) => [email, index]));
  return rows
    .filter((row) => row.deletedAt === null)
    .sort((a, b) => (order.get(a.email) ?? 0) - (order.get(b.email) ?? 0))
    .map((row) => ({ user: row, created: !existingEmails.has(row.email) }));
}

export async function getActiveUser(db: Database, id: string): Promise<User | null> {
  const row = await db.query.user.findFirst({ where: and(eq(user.id, id), isNull(user.deletedAt)) });
  return row ?? null;
}
