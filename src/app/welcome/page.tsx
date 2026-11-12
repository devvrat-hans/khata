import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { SectionLabel } from "@/components/editorial";
import { BareHeader } from "@/components/site-chrome";
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
    <div className="flex min-h-dvh flex-col">
      <BareHeader href="/welcome" />
      <main id="main-content" className="flex-1">
        <div className="container-site grid gap-14 py-14 md:py-24 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionLabel>Welcome to Khata</SectionLabel>
            <h1 className="type-title mt-8 max-w-[12ch] text-balance md:mt-10">Let&rsquo;s get you set up.</h1>
            <p className="type-lede mt-6 max-w-md text-muted-foreground">
              Check your name and pick the currency you use most. You can change all of this later in settings.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="border-t border-foreground pt-8">
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
        </div>
      </main>
    </div>
  );
}
