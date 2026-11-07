import type { BatchItem } from "drizzle-orm/batch";
import type { Database } from "./client";

/**
 * D1 has no interactive transactions. A batch is its atomic unit: every
 * statement in it commits together or not at all. Every write that touches
 * more than one row goes through here.
 */
export async function runBatch(db: Database, statements: BatchItem<"sqlite">[]): Promise<void> {
  if (statements.length === 0) return;
  const [first, ...rest] = statements;
  if (!first) return;
  await db.batch([first, ...rest]);
}
