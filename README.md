# Khata

**Split expenses without the awkward math.**

Khata keeps the hisab for trips, flats and friends. Split any way you like, keep some things private between two people, and settle up with as few payments as possible. It is free, open source, and runs entirely on Cloudflare.

- Live: [khata.aback.group](https://khata.aback.group)
- Made by [Aback Group](https://aback.group). MIT licensed.

## What it does

- **Groups** for trips, homes, couples and teams. Everyone sees the same expenses and balances.
- **Private hisab inside a group.** Record an expense or payment between just two members. The rest of the group never sees it, and it stays out of their balances. Nothing like it in most expense apps.
- **One to one hisabs** with anyone, without making a group.
- **Four ways to split:** equally, exact amounts, percentages, or shares. Several people can pay for one bill. Shares are previewed live and always add up to the paisa.
- **Simplified debts.** The group settles with the fewest payments. Can be turned off per group.
- **Settle with UPI.** Add your UPI ID; people who owe you get a one-tap payment link with the amount filled in.
- **Every currency, kept apart.** Balances are kept per currency and never converted behind your back.
- **Add people by email.** They can be on expenses straight away, get an invitation, and see everything when they sign in.
- **Passwordless sign in** with Google or a six digit code by email.
- **Emails** for invitations, new expenses and payments (optional), and friendly reminders, sent with Cloudflare Email Service.
- **Activity feed, CSV export, light and dark themes**, and a phone layout with a thumb-friendly bottom bar.

## Stack

Next.js 16 on Cloudflare Workers (OpenNext), Cloudflare D1 with Drizzle ORM, Better Auth, Cloudflare Email Sending, Workers Rate Limiting, and the [Aback UI](https://abackui.com) design system. Details and the rules of the codebase are in [`AGENTS.md`](AGENTS.md).

## Run it locally

Requires [Bun](https://bun.sh) 1.3 or newer.

```bash
bun install
```

```bash
cp .dev.vars.example .dev.vars
```

Put a long random string in `BETTER_AUTH_SECRET` (`openssl rand -base64 48`), then:

```bash
bun run db:migrate:local
```

```bash
bun run dev
```

Open http://localhost:3000 and sign in with any email address. In development the sign-in code is printed in the terminal running `bun run dev`.

## Checks

```bash
bun run check
```

Runs the TypeScript check, ESLint and the test suite. The tests cover the money logic and every service against a real D1 engine, including the privacy rules for private hisabs.

## Deploy your own

Khata needs a Cloudflare account on the Workers Paid plan (for Email Sending), a domain on Cloudflare, and optionally a Google OAuth client. The full guide is in [`docs/deployment.md`](docs/deployment.md).

## Project docs

| File | What it is |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | The engineering contract: architecture, invariants, commands |
| [`DESIGN.md`](DESIGN.md) | The Aback design system shared by every Aback product |
| [`docs/deployment.md`](docs/deployment.md) | Deploying to Cloudflare, step by step |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to propose changes |
| [`SECURITY.md`](SECURITY.md) | How to report a vulnerability |

## License

The code is under the [MIT license](LICENSE). The Khata and Aback names, logos and the Aback Blue mark are trademarks of Aback Group and are not covered by it. If you run your own copy, give it its own name.
