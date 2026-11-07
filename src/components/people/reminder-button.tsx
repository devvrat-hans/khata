"use client";

import { Button, Spinner, toast } from "@aback-ui/ui";
import { IconBell } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { sendReminderAction } from "@/server/actions/people";

export function ReminderButton({ personId, disabledReason }: { personId: string; disabledReason?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (disabledReason) {
    return (
      <Button variant="outline" disabled title={disabledReason}>
        <IconBell aria-hidden="true" />
        Reminder sent
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await sendReminderAction(personId);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Reminder sent by email");
          router.refresh();
        })
      }
    >
      {pending ? <Spinner size="sm" /> : <IconBell aria-hidden="true" />}
      Send a reminder
    </Button>
  );
}
