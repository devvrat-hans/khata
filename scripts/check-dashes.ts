/**
 * Aback copy has no em dashes or en dashes, in the UI, emails, docs or code
 * comments. This fails when one appears in a tracked text file.
 *
 *   bun run scripts/check-dashes.ts
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const FORBIDDEN = /[\u2013\u2014]/;
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".open-next", ".wrangler", "migrations", ".claude"]);
// The shared design contract is maintained upstream in the Aback design repo.
const SKIP_FILES = new Set(["DESIGN.md", "bun.lock", "cloudflare-env.d.ts"]);
const EXTENSIONS = new Set([".ts", ".tsx", ".md", ".css", ".json", ".jsonc", ".yml", ".mjs"]);

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.has(extname(entry)) && !SKIP_FILES.has(entry)) yield path;
  }
}

const hits: string[] = [];
for (const file of walk(ROOT)) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      if (FORBIDDEN.test(line)) hits.push(`${relative(ROOT, file)}:${index + 1}: ${line.trim()}`);
    });
}

if (hits.length > 0) {
  console.error("Found em or en dashes. Use a comma, a colon or a full stop instead:\n");
  for (const hit of hits) console.error(`  ${hit}`);
  process.exit(1);
}
console.log("No em or en dashes.");
