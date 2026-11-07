# Deploying Khata

Khata is one Cloudflare Worker with one D1 database. This guide deploys it from scratch. The production instance at `khata.aback.ai` was set up exactly this way.

## What you need

- A Cloudflare account on the **Workers Paid** plan (Email Sending requires it).
- A domain on that account. These steps use `khata.example.com`.
- Bun 1.3 or newer, and `bunx wrangler login` done once.
- Optional: a Google Cloud project for "Continue with Google".

## 1. Point the config at your domain

In `wrangler.jsonc` change:

- `routes[0].pattern` to `khata.example.com`
- `vars.APP_URL` to `https://khata.example.com`
- `vars.EMAIL_FROM` to `noreply@khata.example.com`, and the same address in `send_email[0].allowed_sender_addresses`
- `src/lib/site.ts` to your own name and URLs

`bun run scripts/check-deploy-config.ts` checks that these agree. `bun run deploy` runs it first.

## 2. Create the database

```bash
bunx wrangler d1 create khata
```

Put the printed `database_id` in `wrangler.jsonc` under `d1_databases`, then create the tables:

```bash
bun run db:migrate:remote
```

## 3. Turn on email sending

```bash
bunx wrangler email sending enable khata.example.com
```

This adds the SPF and DKIM records to your zone. Check that the domain is listed and enabled:

```bash
bunx wrangler email sending list
```

## 4. Set the secrets

```bash
openssl rand -base64 48 | bunx wrangler secret put BETTER_AUTH_SECRET
```

Keep this value stable: changing it signs everyone out.

For Google sign in, create an OAuth client (type "Web application") at https://console.cloud.google.com/apis/credentials with:

- Authorised JavaScript origin: `https://khata.example.com`
- Authorised redirect URI: `https://khata.example.com/api/auth/callback/google`

Then:

```bash
bunx wrangler secret put GOOGLE_CLIENT_ID
```

```bash
bunx wrangler secret put GOOGLE_CLIENT_SECRET
```

Without them, the sign-in page simply offers email codes only.

## 5. Deploy

```bash
bun run deploy
```

This checks the config, builds the Worker with OpenNext and deploys it. The custom domain route makes Wrangler create the DNS record and certificate. The first deploy can take a minute or two to answer on the new hostname.

## 6. Check it

- Open the site, sign in with your own email, and confirm the code arrives.
- Create a group, add an expense, and record a payment.
- `bunx wrangler tail khata` shows live logs.

## Updating

1. If the schema changed, run `bun run db:migrate:remote` first. Migrations must work with the code that is already running.
2. `bun run deploy`.

To roll back, `bunx wrangler rollback` returns to the previous Worker version. Database migrations are not rolled back automatically, which is why they must stay backward compatible.

## Backups

D1 keeps 30 days of point in time recovery (Time Travel):

```bash
bunx wrangler d1 time-travel info khata
```

For an offline copy:

```bash
bunx wrangler d1 export khata --remote --output=khata-backup.sql
```
