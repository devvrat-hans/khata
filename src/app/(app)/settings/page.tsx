import type { Metadata } from "next";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import { ProfileForm } from "@/components/account/profile-form";
import { PageTitle } from "@/components/page-title";
import { requireOnboardedViewer } from "@/server/auth/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const viewer = await requireOnboardedViewer();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageTitle title="Settings" description={`Signed in as ${viewer.email}`} />

      <section aria-labelledby="profile-heading" className="border border-border bg-card">
        <h2 id="profile-heading" className="border-b border-border px-5 py-4 text-lg font-semibold">
          Profile and preferences
        </h2>
        <div className="p-5">
          <ProfileForm
            mode="settings"
            initial={{
              name: viewer.name,
              defaultCurrency: viewer.defaultCurrency,
              upiId: viewer.upiId ?? "",
              emailNotifications: viewer.emailNotifications,
            }}
          />
        </div>
      </section>

      <section aria-labelledby="data-heading" className="border border-border bg-card">
        <h2 id="data-heading" className="border-b border-border px-5 py-4 text-lg font-semibold">
          Your data
        </h2>
        <div className="flex flex-col gap-3 p-5 text-sm text-muted-foreground">
          <p>
            Every group has an <span className="font-medium text-foreground">Export CSV</span> button next to its
            expenses, so you can take your records anywhere.
          </p>
          <p>
            Khata is open source. You can read exactly what it stores and how in the code, and run your own copy if you
            prefer.
          </p>
        </div>
      </section>

      <section aria-labelledby="danger-heading" className="border border-danger/30 bg-card">
        <h2 id="danger-heading" className="border-b border-danger/30 px-5 py-4 text-lg font-semibold">
          Delete account
        </h2>
        <div className="flex flex-col gap-4 p-5">
          <p className="text-sm text-muted-foreground">
            Settle up with everyone first. After that you can delete your account and the personal details in it.
          </p>
          <div>
            <DeleteAccountButton />
          </div>
        </div>
      </section>
    </div>
  );
}
