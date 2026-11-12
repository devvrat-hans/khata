import type { Metadata } from "next";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import { ProfileForm } from "@/components/account/profile-form";
import { ArrowLink } from "@/components/editorial";
import { PageTitle, RailSection } from "@/components/page-title";
import { SITE } from "@/lib/site";
import { requireOnboardedViewer } from "@/server/auth/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const viewer = await requireOnboardedViewer();

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      <PageTitle eyebrow="Account" title="Settings" description={`Signed in as ${viewer.email}`} />

      <RailSection
        id="profile"
        title="Profile and preferences"
        description="Your name is what people in your groups see. Your UPI ID lets them pay you in one tap."
      >
        <ProfileForm
          mode="settings"
          initial={{
            name: viewer.name,
            defaultCurrency: viewer.defaultCurrency,
            upiId: viewer.upiId ?? "",
            emailNotifications: viewer.emailNotifications,
          }}
        />
      </RailSection>

      <RailSection id="data" title="Your data" description="Your records are yours. Take them anywhere.">
        <div className="flex max-w-xl flex-col gap-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          <p>
            Every group has an <span className="font-medium text-foreground">Export CSV</span> link above its expenses,
            so you can keep your records in a spreadsheet.
          </p>
          <p>
            Khata is open source. You can read exactly what it stores and how in the code, and run your own copy if you
            prefer.
          </p>
          <ArrowLink href={SITE.repository} external className="mt-1">
            Read the code
          </ArrowLink>
        </div>
      </RailSection>

      <RailSection
        id="delete"
        tone="danger"
        title="Delete account"
        description="Settle up with everyone first. After that you can delete your account and the personal details in it."
      >
        <DeleteAccountButton />
      </RailSection>
    </div>
  );
}
