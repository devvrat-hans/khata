"use client";

import { IconTrash } from "@tabler/icons-react";
import { deleteExpenseAction } from "@/server/actions/expenses";
import { ConfirmAction } from "../confirm-action";

export function DeleteExpenseButton({ expenseId, description }: { expenseId: string; description: string }) {
  return (
    <ConfirmAction
      trigger={
        <>
          <IconTrash aria-hidden="true" />
          Delete
        </>
      }
      triggerVariant="ghost"
      triggerSize="lg"
      triggerClassName="text-destructive hover:bg-danger-soft hover:text-destructive"
      title={`Delete "${description}"?`}
      description={
        <p>
          Balances go back to what they were without it. Everyone who can see the expense will see that you deleted it.
        </p>
      }
      confirmLabel="Delete expense"
      successMessage="Expense deleted"
      action={() => deleteExpenseAction(expenseId)}
      redirectTo={(data) => data.returnTo}
    />
  );
}
