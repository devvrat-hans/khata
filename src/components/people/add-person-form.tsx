"use client";

import { Button, Field, Input, Spinner, toast } from "@aback-ui/ui";
import { IconUserPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import { addPersonAction } from "@/server/actions/people";

/** Starts a one to one hisab with someone, by email. */
export function AddPersonForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError("Enter a valid email address, like friend@example.com.");
      return;
    }
    startTransition(async () => {
      const result = await addPersonAction({ email: address, name: name.trim() || undefined });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(result.data.isNew ? "Person added. They got an email from Khata." : "You already keep a hisab with them");
      router.push(`/people/${result.data.personId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
        <Field htmlFor={`${id}-email`} label="Email address">
          <Input
            id={`${id}-email`}
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="friend@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoFocus={autoFocus}
            aria-invalid={error ? true : undefined}
          />
        </Field>
        <Field htmlFor={`${id}-name`} label="Name (optional)">
          <Input id={`${id}-name`} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
      </div>
      {error ? (
        <p role="alert" className="border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger-strong">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner size="sm" /> : <IconUserPlus aria-hidden="true" />}
          {pending ? "Adding…" : "Add person"}
        </Button>
      </div>
    </form>
  );
}
