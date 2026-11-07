import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Khata.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="7 November 2026">
      <p>
        These terms cover your use of Khata at {SITE.url.replace("https://", "")}, run by Aback Group. By using it you
        agree to them.
      </p>

      <section className="flex flex-col gap-3">
        <h2>What Khata is</h2>
        <p>
          Khata helps you record shared expenses and work out who owes whom. It does not move money, hold money, or act as
          a bank or payment service. When it shows a UPI link, the payment happens in your own payments app, between you
          and the other person.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Your responsibilities</h2>
        <ul>
          <li>Keep what you record honest, and only add people who agreed to share costs with you.</li>
          <li>Do not use Khata to send unwanted email, harass anyone, or break the law.</li>
          <li>Keep access to your email account safe: it is how you sign in.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2>The numbers</h2>
        <p>
          Khata calculates balances from what you and the people you share with record. We work hard to get the math right,
          and it is tested, but you are responsible for checking amounts before you pay or ask for money.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Availability</h2>
        <p>
          Khata is free and provided as is, without warranties. We may change or pause features, and we will try to give
          notice before anything that affects your data. To the extent the law allows, Aback Group is not liable for losses
          from using Khata.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Open source</h2>
        <p>
          The code is available under the MIT license. That license covers the code. The Khata and Aback names and marks
          are not covered, so a copy you run yourself should use its own name.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>Contact</h2>
        <p>
          <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>
        </p>
      </section>
    </LegalPage>
  );
}
