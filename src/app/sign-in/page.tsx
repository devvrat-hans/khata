import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
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
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="flex h-16 items-center border-b border-separator bg-background px-4 md:px-6">
        <Logo />
      </header>
      <main id="main-content" className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-sm border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Sign in to Khata</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            New here? The same steps create your account. No passwords to remember.
          </p>
          <div className="mt-6">
            <SignInForm
              next={next}
              googleEnabled={isGoogleEnabled()}
              initialError={errorKey ? (ERRORS[errorKey] ?? ERRORS.google) : undefined}
            />
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            By continuing you agree to the{" "}
            <Link href="/terms" className="text-link underline-offset-4 hover:underline">
              terms
            </Link>{" "}
            and the{" "}
            <Link href="/privacy" className="text-link underline-offset-4 hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
