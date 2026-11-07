"use client";

import { Button, Spinner, toast } from "@aback-ui/ui";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { addMembersAction } from "@/server/actions/groups";
import { blankPerson, type ContactOption, type NewPerson, PeoplePicker } from "./people-picker";

export function AddMembersForm({ groupId, contacts }: { groupId: string; contacts: ContactOption[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newPeople, setNewPeople] = useState<NewPerson[]>([blankPerson()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const typed = newPeople.filter((person) => person.email.trim() !== "");
    const invalid = typed.find((person) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email.trim()));
    if (invalid) {
      setError(`"${invalid.email}" is not a valid email address.`);
      return;
    }
    const people = [
      ...contacts.filter((contact) => selected.has(contact.id)).map((contact) => ({ email: contact.email })),
      ...typed.map((person) => ({ email: person.email.trim(), name: person.name.trim() || undefined })),
    ];
    if (people.length === 0) {
      setError("Choose someone or type an email address.");
      return;
    }
    startTransition(async () => {
      const result = await addMembersAction(groupId, people);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const { added, alreadyIn } = result.data;
      toast.success(
        added > 0
          ? `Added ${added} ${added === 1 ? "person" : "people"}${alreadyIn > 0 ? `, ${alreadyIn} already in the group` : ""}`
          : "Everyone was already in the group",
      );
      setSelected(new Set());
      setNewPeople([blankPerson()]);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <PeoplePicker
        contacts={contacts}
        selected={selected}
        onToggle={(id) =>
          setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        newPeople={newPeople}
        onChangeNew={setNewPeople}
      />
      {error ? (
        <p role="alert" className="border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger-strong">
          {error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner size="sm" /> : null}
          {pending ? "Adding…" : "Add to group"}
        </Button>
      </div>
    </form>
  );
}
