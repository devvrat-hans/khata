/**
 * Runs before every deploy. Fails when wrangler.jsonc would ship a Worker
 * whose public host, APP_URL and email sender disagree, the mistakes that
 * only show up in production (broken sign-in links, rejected emails).
 *
 *   bun run scripts/check-deploy-config.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

interface WranglerConfig {
  name?: string;
  routes?: { pattern: string; custom_domain?: boolean }[];
  vars?: Record<string, string>;
  d1_databases?: { binding: string; database_id: string }[];
  send_email?: { name: string; allowed_sender_addresses?: string[] }[];
}

/** Strips line comments, block comments and trailing commas from JSONC. */
function parseJsonc(text: string): unknown {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inString) {
      out += char;
      if (char === "\\") {
        out += next ?? "";
        i += 1;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
    } else if (char === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      out += "\n";
    } else if (char === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 1;
    } else {
      out += char;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

const config = parseJsonc(readFileSync(join(process.cwd(), "wrangler.jsonc"), "utf8")) as WranglerConfig;
const problems: string[] = [];

const appUrl = config.vars?.APP_URL ?? "";
const from = config.vars?.EMAIL_FROM ?? "";
const route = config.routes?.find((item) => item.custom_domain)?.pattern;

if (!appUrl.startsWith("https://")) problems.push(`APP_URL must be an https URL, got "${appUrl}".`);
if (!route) problems.push("No custom domain route is configured.");
if (route && appUrl && new URL(appUrl).host !== route) {
  problems.push(`APP_URL (${appUrl}) does not match the custom domain route (${route}).`);
}

const db = config.d1_databases?.find((item) => item.binding === "DB");
if (!db || !/^[0-9a-f-]{36}$/.test(db.database_id)) problems.push("The DB binding has no real database_id.");

const email = config.send_email?.find((item) => item.name === "EMAIL");
if (!email) problems.push("The EMAIL send_email binding is missing.");
else if (!email.allowed_sender_addresses?.includes(from)) {
  problems.push(`EMAIL_FROM (${from}) is not in the EMAIL binding's allowed_sender_addresses.`);
}
if (route && from && !from.endsWith(`@${route}`)) {
  problems.push(`EMAIL_FROM (${from}) should be on the app's own domain (${route}).`);
}

if (problems.length > 0) {
  console.error("Deploy config check failed:\n");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`Deploy config OK: ${config.name} on ${route}, sending as ${from}.`);
