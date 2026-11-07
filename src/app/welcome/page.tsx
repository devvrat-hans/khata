import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { Logo } from "@/components/logo";
import { requireViewer } from "@/server/auth/session";
import { safeNext } from "@/lib/safe-next";
import { nameFromEmail } from "@/server/services/users";

export const metadata: Metadata = { title: "Welcome", robots: { index: false } };

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  const next = safeNext((await searchParams).next);
  if (viewer.onboarded) redirect(next);

  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="flex h-16 items-center border-b border-separator bg-background px-4 md:px-6">
        <Logo href="/welcome" />
      </header>
      <main id="main-content" className="flex flex-1 justify-center px-4 py-10">
        <div className="w-full max-w-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-700 dark:text-primary-400">
            Welcome to Khata
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Let’s get you set up</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check your name and pick the currency you use most. You can change all of this later in settings.
          </p>
          <div className="mt-6">
            <ProfileForm
              mode="welcome"
              redirectTo={next}
              initial={{
                name: viewer.name || nameFromEmail(viewer.email),
                defaultCurrency: viewer.defaultCurrency,
                upiId: viewer.upiId ?? "",
                emailNotifications: viewer.emailNotifications,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
