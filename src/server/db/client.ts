import "server-only";

import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import { getEnv } from "../env";
import { schema } from "./schema";

export type Database = DrizzleD1Database<typeof schema>;

export function createDb(binding: D1Database): Database {
  return drizzle(binding, { schema });
}

/** The database for the current request. */
export const getDb = cache((): Database => createDb(getEnv().DB));
