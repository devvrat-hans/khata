import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Index, SectionLabel } from "@/components/editorial";
import { BareHeader } from "@/components/site-chrome";
import { safeNext } from "@/lib/safe-next";
import { getViewer } from "@/server/auth/session";
import { isGoogleEnabled } from "@/server/env";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Khata with Google or a one-time code sent to your email.",
};

const ERRORS: Record<string, string> = {
  google: "Google sign in did not finish. Try again, or use a code sent to your email.",
  account_not_linked: "That Google account could not be linked. Sign in with a code sent to your email instead.",
};

const PROMISES = [
  "No password to remember: a code by email, or Google.",
  "Friends you add need no account first.",
  "Private hisabs stay between the two of you.",
] as const;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getViewer()) redirect(next);
  const errorKey = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <BareHeader />
      <main id="main-content" className="flex-1">
        <div className="container-site grid gap-14 py-14 md:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <SectionLabel>Sign in</SectionLabel>
            <h1 className="type-title mt-8 max-w-[12ch] text-balance md:mt-10">Welcome to Khata.</h1>
            <p className="type-lede mt-6 max-w-md text-muted-foreground">
              New here? The same steps create your account. It takes under a minute.
            </p>
            <ol className="mt-10 hidden max-w-md border-t border-border lg:block">
              {PROMISES.map((line, index) => (
                <li key={line} className="flex gap-5 border-b border-border py-4 text-[0.9375rem]">
                  <Index value={index + 1} className="pt-1" />
                  {line}
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <section aria-labelledby="form-heading">
              <h2 id="form-heading" className="text-lg font-medium tracking-[-0.02em]">
                Sign in or create an account
              </h2>
              <div className="mt-8">
                <SignInForm
                  next={next}
                  googleEnabled={isGoogleEnabled()}
                  initialError={errorKey ? (ERRORS[errorKey] ?? ERRORS.google) : undefined}
                />
              </div>
              <p className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
                By continuing you agree to the{" "}
                <Link href="/terms" className="link-inline text-foreground">
                  terms
                </Link>{" "}
                and the{" "}
                <Link href="/privacy" className="link-inline text-foreground">
                  privacy policy
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
