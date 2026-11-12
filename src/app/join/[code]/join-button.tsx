"use client";

import { Button, Spinner, toast } from "@aback-ui/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { joinGroupAction } from "@/server/actions/groups";

export function JoinButton({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p role="alert" className="border-l-2 border-danger bg-danger-soft px-3 py-2 text-sm text-danger-strong">
          {error}
        </p>
      ) : null}
      <Button
        variant="brand"
        size="lg"
        className="h-12 w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await joinGroupAction(code);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            toast.success("You joined the group");
            router.push(`/groups/${result.data.groupId}`);
            router.refresh();
          })
        }
      >
        {pending ? <Spinner size="sm" /> : null}
        {pending ? "Joining…" : "Join group"}
      </Button>
    </div>
  );
}
