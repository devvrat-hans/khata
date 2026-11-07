import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Khata stores, why, who can see it, and how to delete it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="7 November 2026">
      <p>
        Khata is a tool for keeping track of shared expenses. It is run by Aback Group and its code is public, so
        everything described here can be checked in the source.
      </p>

      <section className="flex flex-col gap-3">
        <h2>What we store</h2>
        <ul>
          <li>
            <strong>Your account:</strong> your name, email address, profile picture if you sign in with Google, your
            default currency, your UPI ID if you add one, and your email preference.
          </li>
          <li>
            <strong>What you record:</strong> groups, members, expenses, how they are split, payments, notes, and a log of
            changes so everyone can see who did what.
          </li>
          <li>
            <strong>Sign-in data:</strong> active sessions with the IP address and browser they came from, and, if you use
            Google, the link between your Google account and Khata. One-time sign-in codes are stored only as hashes and
            expire after 10 minutes.
          </li>
        </ul>
        <p>We do not use analytics trackers, advertising cookies or third-party scripts.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Who can see what</h2>
        <ul>
          <li>Everyone in a group sees the group&apos;s shared expenses, payments and balances.</li>
          <li>
            A private hisab inside a group, and a one to one hisab, can only be seen by the two people in it. The server
            enforces this on every request.
          </li>
          <li>People you share a group or hisab with can see your name, email and, if you added one, your UPI ID.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2>When someone adds you</h2>
        <p>
          Anyone can add your email address to a group or a hisab. When they do, Khata keeps your email and the name they
          typed so the expense can include you, and sends you one email to let you know. You can sign in with that address
          to see everything, or ignore it.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Emails</h2>
        <p>
          We send sign-in codes, a note when someone adds you, reminders that people send you, and, if you leave them on,
          emails about new expenses and payments that involve you. You can turn the last kind off in settings. Emails are
          sent through Cloudflare Email Service.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Where it lives</h2>
        <p>
          Khata runs on Cloudflare Workers and stores its data in Cloudflare D1. Data is encrypted in transit and at rest
          by Cloudflare. We do not sell or share your data with anyone.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Taking it out and deleting it</h2>
        <p>
          You can export any group as CSV. Once you are settled up with everyone you can delete your account from
          settings: your name, email and sign-in methods are removed and you leave every group. Expenses you were part of
          stay for the other people, shown as a deleted account, because their balances depend on them.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Contact</h2>
        <p>
          Questions or requests: <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
