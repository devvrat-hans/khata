"use client";

import { Button, Field, Input, Spinner, Switch, toast } from "@aback-ui/ui";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import { completeOnboardingAction, updateProfileAction } from "@/server/actions/account";
import { CurrencySelect } from "../currency-select";

export interface ProfileValues {
  name: string;
  defaultCurrency: string;
  upiId: string;
  emailNotifications: boolean;
}

/** Name, currency, UPI ID and email preference. Used on the welcome page and in settings. */
export function ProfileForm({
  initial,
  mode,
  redirectTo = "/dashboard",
}: {
  initial: ProfileValues;
  mode: "welcome" | "settings";
  redirectTo?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const action = mode === "welcome" ? completeOnboardingAction : updateProfileAction;
      const result = await action(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (mode === "welcome") {
        router.push(redirectTo);
      } else {
        toast.success("Settings saved");
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <Field htmlFor={`${id}-name`} label="Your name" description="This is how people see you in groups and emails.">
        <Input
          id={`${id}-name`}
          autoComplete="name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          maxLength={60}
          required
          className="h-11"
        />
      </Field>
      <Field
        htmlFor={`${id}-currency`}
        label="Default currency"
        description="Used for new groups and one to one hisabs. Each expense can still use any currency."
      >
        <CurrencySelect
          id={`${id}-currency`}
          value={values.defaultCurrency}
          onChange={(event) => update("defaultCurrency", event.target.value)}
          className="h-11"
        />
      </Field>
      <Field
        htmlFor={`${id}-upi`}
        label="UPI ID (optional)"
        description="Shown to people who owe you in INR, so they can pay you in one tap. Only people you share a group or hisab with see it."
      >
        <Input
          id={`${id}-upi`}
          placeholder="yourname@bank"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={values.upiId}
          onChange={(event) => update("upiId", event.target.value)}
          className="h-11"
        />
      </Field>
      <div className="flex items-start justify-between gap-6 border-y border-border py-4">
        <div>
          <label htmlFor={`${id}-notify`} className="text-sm font-medium">
            Email me about new expenses and payments
          </label>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Only for things that involve you. Sign-in codes and reminders are always sent.
          </p>
        </div>
        <Switch
          id={`${id}-notify`}
          checked={values.emailNotifications}
          onCheckedChange={(checked) => update("emailNotifications", checked)}
        />
      </div>
      {error ? (
        <p role="alert" className="border-l-2 border-danger bg-danger-soft px-3 py-2 text-sm text-danger-strong">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" variant={mode === "welcome" ? "brand" : "default"} size="lg" disabled={pending}>
          {pending ? <Spinner size="sm" /> : null}
          {mode === "welcome" ? (pending ? "Saving…" : "Continue") : pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
