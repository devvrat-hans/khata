import { Button } from "@aback-ui/ui";
import { IconArrowRight, IconArrowUpRight, IconLock, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { ArrowLink, Band, Index, SectionLabel } from "@/components/editorial";
import { LedgerPlate } from "@/components/landing/ledger-plate";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SITE } from "@/lib/site";

const PARTS = [
  {
    label: "Groups",
    title: "One ledger for everyone",
    body: "For a trip, a flat or a team. Everyone sees the same expenses and the same balances.",
  },
  {
    label: "One to one",
    title: "A hisab with one person",
    body: "For a friend, a flatmate or family, outside any group. Only the two of you see it.",
  },
  {
    label: "Private hisab",
    title: "Between two, inside a group",
    body: "Record something between just two members. The rest of the group never sees it.",
    brand: true,
  },
] as const;

const STEPS = [
  {
    title: "Add what was spent",
    body: "A description, an amount and who paid. Several people can pay for one bill, in any currency.",
  },
  {
    title: "Split it your way",
    body: "Equally, by exact amounts, by percentages or by shares. You see everyone's share before you save, and the server checks every paisa again.",
  },
  {
    title: "Settle in fewer payments",
    body: "Khata combines debts so the group settles with as few transfers as it can. Add your UPI ID and people pay you in one tap.",
  },
] as const;

const DETAILS = [
  {
    title: "Exact to the paisa",
    body: "Money is kept in whole paise and cents. Rounding leftovers land on someone, never in the air.",
  },
  {
    title: "Every currency, kept apart",
    body: "A trip in Thailand and rent at home live side by side. Balances are never converted behind your back.",
  },
  {
    title: "No app, no password",
    body: "Sign in with Google or a code sent to your email. Add people by email; they need no account first.",
  },
  {
    title: "Settle with UPI",
    body: "A payment link with the amount filled in, then the payment is recorded for both of you.",
  },
  {
    title: "Your data, yours",
    body: "Export any group as CSV. Delete your account once you are settled up.",
  },
  {
    title: "No ads, no tracking",
    body: "Nothing to sell and nobody to sell you to. The code is open for anyone to read.",
  },
] as const;

const PRIVATE_STEPS = [
  ["Add an expense in the group", "Pick who paid and how to split it, as usual."],
  ["Turn on Private between two", "Choose the one person it is with. Only the two of you can be on it."],
  ["Only the two of you see it", "It shows with a lock on your group page and on each other's page."],
  ["Settle it privately too", "Record the payment as private. The group never knows it happened."],
] as const;

const FAQ = [
  {
    q: "Is Khata free?",
    a: "Yes. There are no limits on groups, expenses or people, and no ads. The code is open source under the MIT license.",
  },
  {
    q: "Who can see a private hisab?",
    a: "Only the two people it is between. It does not appear in the group's expense list, activity, balances or exports for anyone else. The server checks this on every request.",
  },
  {
    q: "Do my friends need an account before I add them?",
    a: "No. Add them by email and include them in expenses straight away. They get an email, and when they sign in with that address everything is already there.",
  },
  {
    q: "How does simplifying debts work?",
    a: "If Asha owes Bilal and Bilal owes Chen, Asha can pay Chen directly. Khata finds a set of payments that settles everyone with as few transfers as it can. You can turn it off per group.",
  },
  {
    q: "Can I take my data out?",
    a: "Every group can be exported as CSV, and you can delete your account once you are settled up.",
  },
] as const;

/** One column of the privacy comparison: the same group, seen by different people. */
function Seen({
  who,
  rows,
  note,
}: {
  who: string;
  rows: { name: string; amount: string; private?: boolean }[];
  note?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="type-meta text-inverse-muted">{who}</p>
      <ul className="mt-4 border-t border-inverse-border">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center justify-between gap-4 border-b border-inverse-border py-3.5">
            <span className="flex min-w-0 items-center gap-2 text-[0.9375rem]">
              <span className="truncate">{row.name}</span>
              {row.private ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary-300">
                  <IconLock aria-hidden="true" className="size-3.5" />
                  Private
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-[0.9375rem] font-medium tabular-nums">{row.amount}</span>
          </li>
        ))}
      </ul>
      {note ? <p className="mt-4 max-w-sm text-sm leading-relaxed text-inverse-muted">{note}</p> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {/* Statement */}
        <section>
          <div className="container-site pt-14 pb-12 sm:pt-20 md:pt-28 md:pb-16">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
              <SectionLabel>Shared expenses, by Aback</SectionLabel>
              <p className="text-sm text-muted-foreground">
                Free and{" "}
                <a
                  href={SITE.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-inline group inline-flex items-center gap-1 font-medium text-foreground"
                >
                  open source
                  <IconArrowUpRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </p>
            </div>

            <h1 className="type-display mt-10 max-w-[14ch] text-balance md:mt-14">
              Split shared costs without the awkward math.
            </h1>

            <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-12 lg:items-end lg:gap-x-10">
              <div className="lg:col-span-7">
                <p className="type-lede max-w-xl text-muted-foreground">
                  Khata keeps the hisab for trips, flats and friends. Split any way you like, keep some things private
                  between two people, and settle up in as few payments as possible.
                </p>
                <p className="type-meta mt-5 text-muted-foreground">No ads · No limits · No passwords</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:col-span-5 lg:justify-end">
                <Button asChild variant="brand" size="lg" className="h-12 px-6 text-[0.9375rem]">
                  <Link href="/sign-in">
                    Start a khata
                    <IconArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <ArrowLink href="/#how">How it works</ArrowLink>
              </div>
            </div>
          </div>

          {/* The one blue stage on the page */}
          <div className="container-site">
            <div className="overflow-hidden bg-primary-700 px-3 pt-5 sm:px-8 sm:pt-8 lg:px-14 lg:pt-12">
              <div className="mb-5 flex items-center justify-between gap-4 text-white sm:mb-8">
                <p className="type-meta flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 bg-white" />
                  A group in Khata
                </p>
                <p className="type-meta hidden text-white/70 sm:block">Ledger · Balances · Private hisab</p>
              </div>
              <div className="-mb-px translate-y-px">
                <LedgerPlate />
              </div>
            </div>
          </div>

          {/* The three ways to keep a hisab */}
          <div className="mt-px border-t border-border">
            <div className="container-site">
              <ul className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
                {PARTS.map((part) => (
                  <li
                    key={part.label}
                    className="flex flex-col gap-5 py-9 md:px-8 md:py-11 md:first:pl-0 md:last:pr-0 lg:px-10"
                  >
                    <p
                      className={
                        "brand" in part
                          ? "type-meta flex items-center gap-1.5 text-primary-700 dark:text-primary-400"
                          : "type-meta text-muted-foreground"
                      }
                    >
                      {"brand" in part ? <IconLock aria-hidden="true" className="size-3.5" /> : null}
                      {part.label}
                    </p>
                    <div>
                      <h2 className="text-xl leading-snug font-medium tracking-[-0.025em]">{part.title}</h2>
                      <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-muted-foreground">{part.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <Band label="How it works" id="how">
          <h2 className="type-headline max-w-[18ch] text-balance">Add it, split it, settle it.</h2>
          <p className="type-lede mt-6 max-w-2xl text-muted-foreground">
            Three steps, and the hisab keeps itself. Everyone sees what they owe and what they are owed, in words, not
            just colours.
          </p>
          <ol className="mt-12 border-t border-border md:mt-16">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-3 border-b border-border py-7 md:grid-cols-12 md:gap-x-10 md:py-9"
              >
                <Index value={index + 1} className="md:col-span-1 md:pt-2" />
                <h3 className="type-subhead md:col-span-5">{step.title}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-muted-foreground md:col-span-6 md:pt-1.5">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Band>

        {/* The signature feature, on the one inverted band */}
        <Band label="Private hisab" id="private" tone="inverse">
          <h2 className="type-headline max-w-[16ch] text-balance">Some things are between two people.</h2>
          <p className="type-lede mt-6 max-w-2xl text-inverse-muted">
            On a trip with six friends but sharing a cab with one? Record it between just the two of you. It stays out
            of the group&apos;s list, its balances, its feed and its export. The server checks this on every request.
          </p>

          <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-10">
            <Seen
              who="What Asha and Bilal see"
              rows={[
                { name: "Dinner at Thalassa", amount: "₹4,800" },
                { name: "Cab to the airport", amount: "₹900", private: true },
                { name: "Scooter rental", amount: "₹2,400" },
              ]}
            />
            <Seen
              who="What Chen and Dia see"
              rows={[
                { name: "Dinner at Thalassa", amount: "₹4,800" },
                { name: "Scooter rental", amount: "₹2,400" },
              ]}
              note="No trace of the cab. Not the expense, not the balance, not a line in the feed."
            />
          </div>

          <ol className="mt-14 grid gap-px border-y border-inverse-border sm:grid-cols-2 lg:grid-cols-4 md:mt-20">
            {PRIVATE_STEPS.map(([title, body], index) => (
              <li
                key={title}
                className="flex flex-col gap-3 border-inverse-border py-6 sm:pr-6 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <span aria-hidden="true" className="type-meta tabular-nums text-primary-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-medium tracking-[-0.015em]">{title}</span>
                <span className="text-sm leading-relaxed text-inverse-muted">{body}</span>
              </li>
            ))}
          </ol>
        </Band>

        {/* Details */}
        <Band label="Details">
          <h2 className="type-headline max-w-[18ch] text-balance">Careful enough for a flat you share for years.</h2>
          <ul className="mt-12 grid border-t border-border md:mt-16 md:grid-cols-2 md:gap-x-10">
            {DETAILS.map((detail, index) => (
              <li key={detail.title} className="flex gap-5 border-b border-border py-6 md:py-7">
                <Index value={index + 1} className="pt-1" />
                <span>
                  <span className="block text-lg font-medium tracking-[-0.02em]">{detail.title}</span>
                  <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-muted-foreground">
                    {detail.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Band>

        {/* Questions */}
        <Band label="Questions" id="faq" tone="surface">
          <h2 className="type-headline">Questions, answered.</h2>
          <div className="mt-12 border-t border-border md:mt-16">
            {FAQ.map((item) => (
              <details key={item.q} className="group border-b border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium tracking-[-0.02em] outline-none focus-visible:ring-2 focus-visible:ring-focus-ring [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <IconPlus
                    aria-hidden="true"
                    className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  />
                </summary>
                <p className="max-w-2xl pb-7 text-[0.9375rem] leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </Band>

        {/* Open source */}
        <Band label="Open source">
          <h2 className="type-headline max-w-[16ch] text-balance">Read every line. Run your own.</h2>
          <p className="type-lede mt-6 max-w-2xl text-muted-foreground">
            Khata is MIT licensed and runs on Cloudflare Workers with a D1 database. See exactly what it stores, or
            deploy your own copy in an afternoon.
          </p>
          <ul className="mt-12 border-t border-border md:mt-16">
            {[
              { label: "Source code on GitHub", note: "devvrat-hans/khata", href: SITE.repository },
              {
                label: "Deploy your own",
                note: "One Worker, one database",
                href: `${SITE.repository}/blob/main/docs/deployment.md`,
              },
              { label: "MIT license", note: "Use it, change it, share it", href: `${SITE.repository}/blob/main/LICENSE` },
            ].map((link) => (
              <li key={link.label} className="border-b border-border">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group row-link -mx-3 flex items-center justify-between gap-6 px-3 py-6"
                >
                  <span>
                    <span className="block text-lg font-medium tracking-[-0.02em]">{link.label}</span>
                    <span className="type-meta mt-1 block text-muted-foreground">{link.note}</span>
                  </span>
                  <IconArrowUpRight
                    aria-hidden="true"
                    className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Band>

        {/* Sign-off */}
        <section className="border-t border-border">
          <div className="container-site flex flex-col gap-10 py-20 md:py-28 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="type-title max-w-[14ch] text-balance">Start your first khata in a minute.</h2>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <Button asChild variant="brand" size="lg" className="h-12 px-6 text-[0.9375rem]">
                <Link href="/sign-in">
                  Get started
                  <IconArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <ArrowLink href={SITE.repository} external>
                Read the code
              </ArrowLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
