"use client";

import { IconTrash } from "@tabler/icons-react";
import { deleteAccountAction } from "@/server/actions/account";
import { ConfirmAction } from "../confirm-action";

export function DeleteAccountButton() {
  return (
    <ConfirmAction
      trigger={
        <>
          <IconTrash aria-hidden="true" />
          Delete my account
        </>
      }
      triggerVariant="destructive"
      title="Delete your account?"
      description={
        <>
          <p>
            You will be signed out everywhere and removed from every group. Your name and email are removed. Expenses
            you were part of stay for the other people, shown as a deleted account.
          </p>
          <p>This only works once you are settled up with everyone, and it cannot be undone.</p>
        </>
      }
      confirmLabel="Delete account"
      successMessage="Your account was deleted"
      action={deleteAccountAction}
      redirectTo="/"
    />
  );
}
