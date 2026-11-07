"use client";

import { Button, Checkbox, Input } from "@aback-ui/ui";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useId } from "react";
import { PersonAvatar } from "../person-avatar";

export interface ContactOption {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface NewPerson {
  key: string;
  email: string;
  name: string;
}

let counter = 0;
export function blankPerson(): NewPerson {
  counter += 1;
  return { key: `p${counter}-${Date.now()}`, email: "", name: "" };
}

/**
 * Choose people for a group: tick people you already know, and add anyone
 * else by email. People added by email get an invitation and can sign in
 * with that address to see the group.
 */
export function PeoplePicker({
  contacts,
  selected,
  onToggle,
  newPeople,
  onChangeNew,
}: {
  contacts: ContactOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  newPeople: NewPerson[];
  onChangeNew: (people: NewPerson[]) => void;
}) {
  const id = useId();

  function update(key: string, field: "email" | "name", value: string) {
    onChangeNew(newPeople.map((person) => (person.key === key ? { ...person, [field]: value } : person)));
  }

  return (
    <div className="flex flex-col gap-4">
      {contacts.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">People you know</legend>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {contacts.map((contact) => {
              const checkboxId = `${id}-${contact.id}`;
              return (
                <li key={contact.id}>
                  <label
                    htmlFor={checkboxId}
                    className="flex cursor-pointer items-center gap-3 border border-border p-2 transition-colors hover:bg-muted/40 has-[[data-state=checked]]:border-primary-300 has-[[data-state=checked]]:bg-primary-50/60 dark:has-[[data-state=checked]]:border-primary-800 dark:has-[[data-state=checked]]:bg-primary-950/30"
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={selected.has(contact.id)}
                      onCheckedChange={() => onToggle(contact.id)}
                    />
                    <PersonAvatar person={contact} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{contact.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{contact.email}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{contacts.length > 0 ? "Add someone new" : "Add people"}</legend>
        {newPeople.map((person, index) => (
          <div key={person.key} className="flex items-start gap-2">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1.4fr_1fr]">
              <Input
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="friend@example.com"
                aria-label={`Email of person ${index + 1}`}
                value={person.email}
                onChange={(event) => update(person.key, "email", event.target.value)}
              />
              <Input
                placeholder="Name (optional)"
                aria-label={`Name of person ${index + 1}`}
                value={person.name}
                maxLength={60}
                onChange={(event) => update(person.key, "name", event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove person ${index + 1}`}
              onClick={() =>
                onChangeNew(
                  newPeople.length === 1 ? [blankPerson()] : newPeople.filter((item) => item.key !== person.key),
                )
              }
            >
              <IconX aria-hidden="true" />
            </Button>
          </div>
        ))}
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => onChangeNew([...newPeople, blankPerson()])}>
            <IconPlus aria-hidden="true" />
            Add another
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          They get an email and can sign in with that address. Expenses can include them right away.
        </p>
      </fieldset>
    </div>
  );
}
