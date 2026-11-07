import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit only generates SQL here. Migrations are applied with Wrangler,
 * which tracks them in the d1_migrations table:
 *
 *   bun run db:generate        # write a new migration from schema changes
 *   bun run db:migrate:local   # apply to the local D1 used by `bun run dev`
 *   bun run db:migrate:remote  # apply to production
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/db/schema.ts",
  out: "./migrations",
});
