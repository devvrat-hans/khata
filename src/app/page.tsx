import { Button } from "@aback-ui/ui";
import {
  IconArrowRight,
  IconBrandGithub,
  IconCash,
  IconChartPie,
  IconLock,
  IconMail,
  IconRoute,
  IconWorld,
} from "@tabler/icons-react";
import Link from "next/link";
import { IconChip } from "@/components/icons";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SITE } from "@/lib/site";

const FEATURES = [
  {
    icon: IconLock,
    title: "Private hisab inside a group",
    body: "On a trip with six friends but sharing a cab with one? Record it between just the two of you. The rest of the group never sees it, and it stays out of their balances.",
  },
  {
    icon: IconRoute,
    title: "Fewest payments to settle",
    body: "Khata combines debts so the group settles with as few payments as possible. Nobody pays more in total; there are just fewer transfers.",
  },
  {
    icon: IconChartPie,
    title: "Split any way",
    body: "Equally, by exact amounts, by percentages or by shares. Several people can pay for one bill. You see everyone's share before you save.",
  },
  {
    icon: IconCash,
    title: "Settle with UPI",
    body: "Add your UPI ID and people who owe you get a one-tap payment link with the amount filled in. Then the payment is recorded for both of you.",
  },
  {
    icon: IconWorld,
    title: "Every currency, kept apart",
    body: "A trip in Thailand and rent at home can live side by side. Balances are kept per currency, never converted behind your back.",
  },
  {
    icon: IconMail,
    title: "No app, no password",
    body: "Sign in with Google or a code sent to your email. Add people by email; they can see the group the moment they sign in.",
  },
];

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
];

/** A static picture of the app: a group with a private hisab. */
function Preview() {
  const rows = [
    { name: "Dinner at Thalassa", meta: "Asha paid ₹4,800", impact: "you borrowed", amount: "₹1,200", tone: "text-danger" },
    { name: "Scooter rental", meta: "You paid ₹2,400", impact: "you lent", amount: "₹1,800", tone: "text-success" },
    { name: "Cab to the airport", meta: "You paid ₹900 · Private with Bilal", impact: "you lent", amount: "₹450", tone: "text-success", locked: true },
  ];
  return (
    <div className="border border-border bg-card shadow-lg" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Trip · 4 people</p>
          <p className="text-base font-semibold">Goa, December</p>
        </div>
        <span className="bg-success-soft px-2 py-1 text-xs font-semibold text-success-strong">you are owed ₹1,050</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center gap-3 px-4 py-3">
            <span className="flex w-9 shrink-0 flex-col items-center border border-border py-1 leading-none">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Dec</span>
              <span className="mt-0.5 text-sm font-semibold">14</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{row.name}</span>
              <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                {row.locked ? <IconLock className="size-3 text-primary-600 dark:text-primary-400" /> : null}
                {row.meta}
              </span>
            </span>
            <span className="text-right">
              <span className={`block text-xs ${row.tone}`}>{row.impact}</span>
              <span className={`block text-sm font-semibold tabular-nums ${row.tone}`}>{row.amount}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        Balances are simplified: 2 payments settle the whole trip.
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <section className="border-b border-separator bg-gradient-to-b from-primary-50/70 to-background dark:from-primary-950/40">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 border border-primary-200 bg-background px-2.5 py-1 text-xs font-medium text-primary-700 dark:border-primary-800 dark:text-primary-300">
                <IconBrandGithub aria-hidden="true" className="size-3.5" />
                Free and open source
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                Split expenses without the awkward math.
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Khata keeps the hisab for trips, flats and friends. Split any way you like, keep some things private
                between two people, and settle up with as few payments as possible.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="brand" size="lg">
                  <Link href="/sign-in">
                    Start for free
                    <IconArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={SITE.repository} target="_blank" rel="noopener noreferrer">
                    <IconBrandGithub aria-hidden="true" />
                    View the code
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">No ads, no limits, no passwords.</p>
            </div>
            <Preview />
          </div>
        </section>

        <section aria-labelledby="features-heading" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="features-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Everything a shared khata needs
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Simple enough for a weekend trip, careful enough for a flat you share for years.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex flex-col gap-3 border border-border bg-card p-6 shadow-sm">
                <IconChip icon={feature.icon} />
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-heading" className="border-y border-separator bg-muted/30">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 id="how-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
                How a private hisab works
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Groups are great until two people need to keep something between themselves. In most apps you would
                start a separate group or keep it in your head. In Khata you flip one switch.
              </p>
            </div>
            <ol className="flex flex-col gap-4">
              {[
                ["Add an expense in the group", "Pick who paid and how to split it, as usual."],
                ["Turn on Private between two", "Choose the one person it is with. Only the two of you can be on it."],
                ["Only the two of you see it", "It shows on your group page and on each other's page, with a lock. Everyone else sees nothing."],
                ["Settle it privately too", "Record the payment as private, and it settles without the group ever knowing."],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-4 border border-border bg-card p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center bg-primary-700 text-sm font-bold text-white dark:bg-primary-400 dark:text-primary-950">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <h2 id="faq-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Questions
          </h2>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {FAQ.map((item) => (
              <div key={item.q} className="py-4">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-col items-start gap-3 border border-primary-200 bg-primary-50/50 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-primary-800/60 dark:bg-primary-950/30">
            <p className="font-semibold">Start your first khata in under a minute.</p>
            <Button asChild variant="brand">
              <Link href="/sign-in">Get started</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
