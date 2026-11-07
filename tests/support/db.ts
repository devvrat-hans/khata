import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Miniflare } from "miniflare";
import { createDb, type Database } from "@/server/db/client";
import { user } from "@/server/db/schema";
import { newId } from "@/server/ids";

const MIGRATIONS_DIR = join(import.meta.dirname, "..", "..", "migrations");

/**
 * A fresh, in-memory D1 database with every migration applied. Tests run the
 * real services against the real D1 engine (workerd), not a mock.
 */
export async function createTestDb(): Promise<{ db: Database; dispose: () => Promise<void> }> {
  const mf = new Miniflare({
    modules: true,
    script: "export default { fetch() { return new Response(null, { status: 404 }); } }",
    d1Databases: { DB: `test-${newId(8)}` },
  });
  const d1 = await mf.getD1Database("DB");
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const statements = readFileSync(join(MIGRATIONS_DIR, file), "utf8")
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);
    for (const statement of statements) await d1.prepare(statement).run();
  }
  return { db: createDb(d1 as unknown as D1Database), dispose: () => mf.dispose() };
}

/** A user who has signed in and finished onboarding. */
export async function createUser(db: Database, name: string): Promise<string> {
  const id = newId();
  await db.insert(user).values({
    id,
    name,
    email: `${name.toLowerCase()}@example.com`,
    emailVerified: true,
    onboardedAt: new Date(),
  });
  return id;
}
