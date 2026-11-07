"use client";

import { Button, Field, Input, Spinner, toast } from "@aback-ui/ui";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import type { GroupKindValue } from "@/lib/labels";
import { createGroupAction } from "@/server/actions/groups";
import { CurrencySelect } from "../currency-select";
import { KindPicker } from "./kind-picker";
import { blankPerson, type ContactOption, type NewPerson, PeoplePicker } from "./people-picker";

export function GroupForm({ contacts, defaultCurrency }: { contacts: ContactOption[]; defaultCurrency: string }) {
  const router = useRouter();
  const id = useId();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<GroupKindValue>("trip");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newPeople, setNewPeople] = useState<NewPerson[]>([blankPerson()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(contactId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(contactId)) next.delete(contactId);
      else next.add(contactId);
      return next;
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const typed = newPeople.filter((person) => person.email.trim() !== "");
    const invalid = typed.find((person) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email.trim()));
    if (!name.trim()) {
      setError("Give the group a name.");
      return;
    }
    if (invalid) {
      setError(`"${invalid.email}" is not a valid email address.`);
      return;
    }
    const members = [
      ...contacts.filter((contact) => selected.has(contact.id)).map((contact) => ({ email: contact.email })),
      ...typed.map((person) => ({ email: person.email.trim(), name: person.name.trim() || undefined })),
    ];
    startTransition(async () => {
      const result = await createGroupAction({ name, kind, currency, members });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Group created");
      router.push(`/groups/${result.data.groupId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <Field htmlFor={`${id}-name`} label="Group name" required>
        <Input
          id={`${id}-name`}
          placeholder="Goa trip, Flat 4B, Office lunches"
          value={name}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </Field>
      <div className="flex flex-col gap-2">
        <span id={`${id}-kind`} className="text-sm font-medium">
          What is it for?
        </span>
        <KindPicker value={kind} onChange={setKind} labelledBy={`${id}-kind`} />
      </div>
      <Field htmlFor={`${id}-currency`} label="Currency" description="The default for new expenses. Any expense can use another currency.">
        <CurrencySelect id={`${id}-currency`} value={currency} onChange={(event) => setCurrency(event.target.value)} />
      </Field>
      <PeoplePicker
        contacts={contacts}
        selected={selected}
        onToggle={toggle}
        newPeople={newPeople}
        onChangeNew={setNewPeople}
      />
      {error ? (
        <p role="alert" className="border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger-strong">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="brand" size="lg" disabled={pending}>
          {pending ? <Spinner size="sm" /> : null}
          {pending ? "Creating…" : "Create group"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
