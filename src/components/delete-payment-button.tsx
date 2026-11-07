"use client";

import { IconTrash } from "@tabler/icons-react";
import { deletePaymentAction } from "@/server/actions/expenses";
import { ConfirmAction } from "./confirm-action";

export function DeletePaymentButton({ settlementId, label }: { settlementId: string; label: string }) {
  return (
    <ConfirmAction
      trigger={
        <>
          <IconTrash aria-hidden="true" />
          <span className="sr-only">Delete payment</span>
        </>
      }
      triggerVariant="ghost"
      triggerSize="icon-sm"
      triggerClassName="text-muted-foreground hover:text-destructive"
      title="Delete this payment?"
      description={
        <p>
          {label}. Deleting it brings the balance back to what it was before. Everyone who can see it will see that it
          was deleted.
        </p>
      }
      confirmLabel="Delete payment"
      successMessage="Payment deleted"
      action={() => deletePaymentAction(settlementId)}
    />
  );
}
