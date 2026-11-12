"use client";

import { Button, CopyButton, Input, Spinner, toast } from "@aback-ui/ui";
import { IconBrandWhatsapp, IconRefresh } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { rotateInviteAction } from "@/server/actions/groups";

/** The group's join link, with copy, share and (for owners) reset. */
export function InviteLink({
  groupId,
  groupName,
  baseUrl,
  code,
  canReset,
}: {
  groupId: string;
  groupName: string;
  baseUrl: string;
  code: string;
  canReset: boolean;
}) {
  const [current, setCurrent] = useState(code);
  const [pending, startTransition] = useTransition();
  const url = `${baseUrl}/join/${current}`;
  const message = `Join "${groupName}" on Khata so we can split expenses: ${url}`;

  function reset() {
    startTransition(async () => {
      const result = await rotateInviteAction(groupId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setCurrent(result.data.code);
      toast.success("New link created. The old one no longer works.");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input readOnly value={url} aria-label="Join link" className="h-11 font-mono text-xs" onFocus={(event) => event.currentTarget.select()} />
        <CopyButton value={url} label="Copy link" showLabel variant="outline" className="h-11" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            <IconBrandWhatsapp aria-hidden="true" />
            Share on WhatsApp
          </a>
        </Button>
        {canReset ? (
          <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={pending}>
            {pending ? <Spinner size="sm" /> : <IconRefresh aria-hidden="true" />}
            Reset link
          </Button>
        ) : null}
      </div>
    </div>
  );
}
