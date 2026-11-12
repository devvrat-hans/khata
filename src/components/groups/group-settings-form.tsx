"use client";

import { Button, Field, Input, Spinner, Switch, toast } from "@aback-ui/ui";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import type { GroupKindValue } from "@/lib/labels";
import { updateGroupAction } from "@/server/actions/groups";
import { CurrencySelect } from "../currency-select";
import { KindPicker } from "./kind-picker";

export function GroupSettingsForm({
  groupId,
  initial,
}: {
  groupId: string;
  initial: { name: string; kind: GroupKindValue; currency: string; simplifyDebts: boolean };
}) {
  const router = useRouter();
  const id = useId();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateGroupAction(groupId, values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Group updated");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <Field htmlFor={`${id}-name`} label="Group name">
        <Input
          id={`${id}-name`}
          value={values.name}
          maxLength={60}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          className="h-11"
        />
      </Field>
      <div className="flex flex-col gap-2">
        <span id={`${id}-kind`} className="text-sm font-medium">
          Type
        </span>
        <KindPicker value={values.kind} onChange={(kind) => setValues({ ...values, kind })} labelledBy={`${id}-kind`} />
      </div>
      <Field htmlFor={`${id}-currency`} label="Default currency">
        <CurrencySelect
          id={`${id}-currency`}
          value={values.currency}
          onChange={(event) => setValues({ ...values, currency: event.target.value })}
          className="h-11"
        />
      </Field>
      <div className="flex items-start justify-between gap-6 border-y border-border py-4">
        <div>
          <label htmlFor={`${id}-simplify`} className="text-sm font-medium">
            Simplify debts
          </label>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Combine debts so everyone settles with the fewest payments. If Asha owes Bilal and Bilal owes Chen, Asha can
            pay Chen directly. Nobody ends up paying more in total.
          </p>
        </div>
        <Switch
          id={`${id}-simplify`}
          checked={values.simplifyDebts}
          onCheckedChange={(checked) => setValues({ ...values, simplifyDebts: checked })}
        />
      </div>
      {error ? (
        <p role="alert" className="border-l-2 border-danger bg-danger-soft px-3 py-2 text-sm text-danger-strong">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner size="sm" /> : null}
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
