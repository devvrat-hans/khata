"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  type ButtonProps,
  Spinner,
  toast,
} from "@aback-ui/ui";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import type { ActionResult } from "@/server/actions/result";

/**
 * A button that asks before doing something hard to undo, then runs a server
 * action. On success it shows `successMessage` and goes to `redirectTo` (or the
 * path the action returns); on failure the dialog stays open with the reason.
 */
export function ConfirmAction<T>({
  trigger,
  title,
  description,
  confirmLabel,
  successMessage,
  action,
  redirectTo,
  destructive = true,
  triggerVariant = "outline",
  triggerSize = "default",
  triggerClassName,
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  successMessage: string;
  action: () => Promise<ActionResult<T>>;
  redirectTo?: string | ((data: T) => string);
  destructive?: boolean;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm(event: React.MouseEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(successMessage);
      const target = typeof redirectTo === "function" ? redirectTo(result.data) : redirectTo;
      if (target) router.push(target);
      router.refresh();
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={triggerClassName}>
          {trigger}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="border-l-2 border-danger bg-danger-soft px-3 py-2 text-sm text-danger-strong">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={pending}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
          >
            {pending ? <Spinner size="sm" /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
