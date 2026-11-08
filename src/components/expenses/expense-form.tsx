"use client";

import {
  Button,
  Checkbox,
  cn,
  Field,
  Input,
  Select,
  Spinner,
  Switch,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from "@aback-ui/ui";
import { IconLock, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useMemo, useState, useTransition } from "react";
import { formatMoney, parseAmount, parseDecimal } from "@/domain/money";
import { checkPayers, computeSplit, describeSplitError, type SplitMethod } from "@/domain/split";
import { CATEGORY_LABELS, type CategoryValue } from "@/lib/labels";
import { useLocalToday } from "@/lib/use-local-today";
import { CATEGORY_VALUES, type ExpenseInput } from "@/lib/validation";
import { saveExpenseAction } from "@/server/actions/expenses";
import { CurrencySelect } from "../currency-select";
import { PersonAvatar } from "../person-avatar";

export interface FormPerson {
  id: string;
  name: string;
  image: string | null;
}

export type ExpenseFormContext =
  | {
      kind: "group";
      groupId: string;
      groupName: string;
      members: FormPerson[];
    }
  | {
      kind: "person";
      person: FormPerson;
    };

export interface ExpenseFormValues {
  description: string;
  amount: string;
  currency: string;
  date: string;
  category: CategoryValue;
  notes: string;
  isPrivate: boolean;
  privateWith: string | null;
  payerMode: "single" | "multiple";
  payer: string;
  payerAmounts: Record<string, string>;
  splitMethod: SplitMethod;
  included: string[];
  values: Record<string, string>;
}

/** Short labels, so all four fit in one row on a phone. */
const SPLIT_OPTIONS: { value: SplitMethod; label: string }[] = [
  { value: "equal", label: "Equal" },
  { value: "exact", label: "Exact" },
  { value: "percent", label: "Percent" },
  { value: "shares", label: "Shares" },
];

const panel = "border border-border bg-card p-4 sm:p-5";
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const choice = (selected: boolean) =>
  cn(
    "border text-sm transition-colors duration-200",
    focusRing,
    selected
      ? "border-primary-500 bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
      : "border-border bg-background hover:bg-muted",
  );

function splitValue(method: SplitMethod, raw: string, currency: string): number | null {
  const value = raw.trim();
  if (value === "") return 0;
  if (method === "exact") return parseAmount(value, currency);
  return parseDecimal(value, 2, method === "percent" ? 10_000 : 100_000_000);
}

export function ExpenseForm({
  viewer,
  context,
  initial,
  expenseId,
  cancelHref,
}: {
  viewer: FormPerson;
  context: ExpenseFormContext;
  initial: ExpenseFormValues;
  expenseId?: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const id = useId();
  const [form, setForm] = useState<ExpenseFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(Boolean(initial.notes));
  const [pending, startTransition] = useTransition();
  const editing = Boolean(expenseId);
  // New expenses default to today in the browser's own time zone.
  const today = useLocalToday();
  const date = form.date || today;

  const set = <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  /** Everyone who can be on this expense right now. */
  const people = useMemo<FormPerson[]>(() => {
    if (context.kind === "person") return [viewer, context.person];
    if (form.isPrivate) {
      const other = context.members.find((member) => member.id === form.privateWith);
      return other ? [viewer, other] : [viewer];
    }
    return context.members;
  }, [context, form.isPrivate, form.privateWith, viewer]);

  const otherMembers = context.kind === "group" ? context.members.filter((member) => member.id !== viewer.id) : [];
  const nameOf = (personId: string) => (personId === viewer.id ? "You" : (people.find((p) => p.id === personId)?.name ?? "Someone"));

  function changePeople(next: Partial<ExpenseFormValues>) {
    setForm((current) => {
      const merged = { ...current, ...next };
      const universe =
        context.kind === "person"
          ? [viewer.id, context.person.id]
          : merged.isPrivate
            ? [viewer.id, merged.privateWith].filter((value): value is string => Boolean(value))
            : context.members.map((member) => member.id);
      return {
        ...merged,
        payer: universe.includes(merged.payer) ? merged.payer : viewer.id,
        payerMode: universe.length < 2 ? "single" : merged.payerMode,
        included: universe,
      };
    });
  }

  const total = parseAmount(form.amount || "0", form.currency) ?? 0;
  const format = (minor: number) => formatMoney(minor, form.currency);

  /** Live preview of the split, with the same code the server runs. */
  const preview = useMemo(() => {
    if (total <= 0) return { shares: new Map<string, number>(), problem: null as string | null };
    const entries =
      form.splitMethod === "equal"
        ? people.filter((person) => form.included.includes(person.id)).map((person) => ({ userId: person.id }))
        : people.map((person) => ({
            userId: person.id,
            value: splitValue(form.splitMethod, form.values[person.id] ?? "", form.currency) ?? -1,
          }));
    const result = computeSplit(total, form.splitMethod, entries);
    const formatPreview = (minor: number) => formatMoney(minor, form.currency);
    if (!result.ok) return { shares: new Map<string, number>(), problem: describeSplitError(result.error, formatPreview) };
    return { shares: new Map(result.portions.map((portion) => [portion.userId, portion.amount])), problem: null };
  }, [form.currency, form.included, form.splitMethod, form.values, people, total]);

  const payerProblem = useMemo(() => {
    if (form.payerMode === "single" || total <= 0) return null;
    const payers = people.map((person) => ({
      userId: person.id,
      amount: parseAmount(form.payerAmounts[person.id] || "0", form.currency) ?? -1,
    }));
    const result = checkPayers(total, payers);
    return result.ok ? null : describeSplitError(result.error, (minor) => formatMoney(minor, form.currency));
  }, [form.currency, form.payerAmounts, form.payerMode, people, total]);

  /** Shortcuts for two people, the most common one to one cases. */
  const quick =
    people.length === 2
      ? (() => {
          const other = people.find((person) => person.id !== viewer.id);
          if (!other) return [];
          const first = other.name.split(" ")[0];
          return [
            { label: "You paid, split equally", payer: viewer.id, included: [viewer.id, other.id] },
            { label: `You paid, ${first} owes it all`, payer: viewer.id, included: [other.id] },
            { label: `${first} paid, split equally`, payer: other.id, included: [viewer.id, other.id] },
            { label: `${first} paid, you owe it all`, payer: other.id, included: [viewer.id] },
          ];
        })()
      : [];
  const activeQuick = quick.findIndex(
    (option) =>
      form.payerMode === "single" &&
      form.splitMethod === "equal" &&
      form.payer === option.payer &&
      option.included.length === form.included.length &&
      option.included.every((value) => form.included.includes(value)),
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!form.description.trim()) return setError("Add a short description, like Dinner or Cab to airport.");
    if (total <= 0) return setError("Enter an amount greater than zero, like 250 or 99.50.");
    if (context.kind === "group" && form.isPrivate && !form.privateWith) {
      return setError("Choose who the private hisab is with.");
    }
    if (payerProblem) return setError(payerProblem);
    if (preview.problem) return setError(preview.problem);

    const input: ExpenseInput = {
      groupId: context.kind === "group" ? context.groupId : null,
      personId: context.kind === "person" ? context.person.id : form.isPrivate ? form.privateWith : null,
      isPrivate: context.kind === "group" ? form.isPrivate : false,
      description: form.description,
      amount: form.amount,
      currency: form.currency,
      date,
      category: form.category,
      notes: form.notes,
      payers:
        form.payerMode === "single"
          ? [{ userId: form.payer }]
          : people
              .filter((person) => (form.payerAmounts[person.id] ?? "").trim() !== "")
              .map((person) => ({ userId: person.id, amount: form.payerAmounts[person.id] })),
      splitMethod: form.splitMethod,
      // In the same order as the preview, so rounding leftovers land on the same people.
      participants:
        form.splitMethod === "equal"
          ? people.filter((person) => form.included.includes(person.id)).map((person) => ({ userId: person.id }))
          : people.map((person) => ({ userId: person.id, value: form.values[person.id] ?? "" })),
    };

    startTransition(async () => {
      const result = await saveExpenseAction(input, expenseId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(editing ? "Expense updated" : "Expense added");
      router.push(editing ? `/expenses/${result.data.expenseId}` : result.data.returnTo);
      router.refresh();
    });
  }

  const remaining = (() => {
    if (total <= 0) return null;
    if (form.splitMethod === "exact") {
      const sum = people.reduce((acc, person) => acc + (splitValue("exact", form.values[person.id] ?? "", form.currency) ?? 0), 0);
      return { left: total - sum, unit: "money" as const };
    }
    if (form.splitMethod === "percent") {
      const sum = people.reduce((acc, person) => acc + (splitValue("percent", form.values[person.id] ?? "", form.currency) ?? 0), 0);
      return { left: 10_000 - sum, unit: "percent" as const };
    }
    return null;
  })();

  const paidBy = (personId: string) =>
    form.payerMode === "single"
      ? form.payer === personId
        ? total
        : 0
      : (parseAmount(form.payerAmounts[personId] || "0", form.currency) ?? 0);
  const yourNet = paidBy(viewer.id) - (preview.shares.get(viewer.id) ?? 0);
  const problem = payerProblem ?? preview.problem;

  const outcome =
    total <= 0 ? (
      <p className="text-sm text-muted-foreground">Enter an amount to see who owes what.</p>
    ) : problem ? (
      <p className="text-sm text-danger">{problem}</p>
    ) : yourNet > 0 ? (
      <p className="text-sm font-medium text-success">You lend {format(yourNet)}</p>
    ) : yourNet < 0 ? (
      <p className="text-sm font-medium text-danger">You borrow {format(-yourNet)}</p>
    ) : (
      <p className="text-sm text-muted-foreground">You neither lend nor borrow on this.</p>
    );

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6"
      noValidate
    >
      <div className="flex min-w-0 flex-col gap-4">
        {/* What and how much */}
        <section aria-label="Expense details" className={cn(panel, "flex flex-col gap-4")}>
          <Field htmlFor={`${id}-description`} label="Description" required>
            <Input
              id={`${id}-description`}
              placeholder="Dinner, cab, groceries"
              value={form.description}
              maxLength={100}
              onChange={(event) => set("description", event.target.value)}
              autoFocus={!editing}
            />
          </Field>
          <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <Field htmlFor={`${id}-amount`} label="Amount" required>
              <Input
                id={`${id}-amount`}
                inputMode="decimal"
                placeholder="0"
                autoComplete="off"
                value={form.amount}
                onChange={(event) => set("amount", event.target.value)}
                className="h-14 text-3xl font-bold tabular-nums"
              />
            </Field>
            <Field htmlFor={`${id}-currency`} label="Currency">
              <CurrencySelect
                id={`${id}-currency`}
                value={form.currency}
                onChange={(event) => set("currency", event.target.value)}
                className="h-14"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field htmlFor={`${id}-category`} label="Category">
              <Select
                id={`${id}-category`}
                value={form.category}
                onChange={(event) => set("category", event.target.value as CategoryValue)}
              >
                {CATEGORY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABELS[value]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field htmlFor={`${id}-date`} label="Date">
              <Input id={`${id}-date`} type="date" value={date} onChange={(event) => set("date", event.target.value)} />
            </Field>
          </div>
          {showNotes ? (
            <Field htmlFor={`${id}-notes`} label="Notes (optional)">
              <Textarea
                id={`${id}-notes`}
                rows={2}
                maxLength={500}
                placeholder="Anything worth remembering"
                value={form.notes}
                onChange={(event) => set("notes", event.target.value)}
                autoFocus={!initial.notes}
              />
            </Field>
          ) : (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className={cn("inline-flex items-center gap-1 self-start text-sm text-link hover:text-link-hover", focusRing)}
            >
              <IconPlus aria-hidden="true" className="size-4" />
              Add a note
            </button>
          )}
        </section>

        {/* Private hisab inside a group */}
        {context.kind === "group" && otherMembers.length > 0 ? (
          <section
            aria-label="Privacy"
            className={cn(
              "flex flex-col gap-3 border p-4 sm:px-5",
              form.isPrivate
                ? "border-primary-300 bg-primary-50/60 dark:border-primary-800 dark:bg-primary-950/30"
                : "border-border bg-card",
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor={`${id}-private`} className="flex items-center gap-1.5 text-sm font-medium">
                  <IconLock aria-hidden="true" className="size-4 text-primary-600 dark:text-primary-400" />
                  Private between two
                </label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Only you and one other member see it. It stays out of the group&apos;s balances.
                </p>
              </div>
              <Switch
                id={`${id}-private`}
                checked={form.isPrivate}
                disabled={editing}
                onCheckedChange={(checked) =>
                  changePeople({
                    isPrivate: checked,
                    privateWith: checked ? (form.privateWith ?? otherMembers[0]?.id ?? null) : form.privateWith,
                  })
                }
              />
            </div>
            {form.isPrivate ? (
              <Field htmlFor={`${id}-with`} label="Between you and">
                <Select
                  id={`${id}-with`}
                  value={form.privateWith ?? ""}
                  disabled={editing}
                  onChange={(event) => changePeople({ privateWith: event.target.value })}
                >
                  {otherMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
          </section>
        ) : null}

        {/* Quick choices for two people */}
        {quick.length > 0 ? (
          <fieldset className={panel}>
            <legend className="float-left mb-3 w-full text-sm font-semibold">Quick split</legend>
            <div className="clear-both grid grid-cols-1 gap-2 sm:grid-cols-2">
              {quick.map((option, index) => (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={activeQuick === index}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      payerMode: "single",
                      payer: option.payer,
                      splitMethod: "equal",
                      included: option.included,
                    }))
                  }
                  className={cn("px-3 py-2.5 text-left", choice(activeQuick === index))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {/* Who paid */}
        <section aria-labelledby={`${id}-paid-heading`} className={cn(panel, "flex flex-col gap-3")}>
          <div className="flex items-center justify-between gap-2">
            <h2 id={`${id}-paid-heading`} className="text-sm font-semibold">
              Paid by
            </h2>
            {people.length > 1 ? (
              <button
                type="button"
                className={cn("text-sm text-link hover:text-link-hover", focusRing)}
                onClick={() => set("payerMode", form.payerMode === "single" ? "multiple" : "single")}
              >
                {form.payerMode === "single" ? "Several people paid" : "One person paid"}
              </button>
            ) : null}
          </div>
          {form.payerMode === "single" ? (
            <div role="radiogroup" aria-labelledby={`${id}-paid-heading`} className="flex flex-wrap gap-2">
              {people.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  role="radio"
                  aria-checked={form.payer === person.id}
                  onClick={() => set("payer", person.id)}
                  className={cn("inline-flex h-10 items-center gap-2 px-2.5", choice(form.payer === person.id))}
                >
                  <PersonAvatar person={person} size="xs" />
                  {person.id === viewer.id ? "You" : person.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {people.map((person) => (
                <div key={person.id} className="flex items-center gap-3">
                  <PersonAvatar person={person} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm">{nameOf(person.id)}</span>
                  <Input
                    inputMode="decimal"
                    placeholder="0"
                    aria-label={`${nameOf(person.id)} paid`}
                    value={form.payerAmounts[person.id] ?? ""}
                    onChange={(event) => set("payerAmounts", { ...form.payerAmounts, [person.id]: event.target.value })}
                    className="w-32 text-right tabular-nums"
                  />
                </div>
              ))}
              {payerProblem ? <p className="text-sm text-danger">{payerProblem}</p> : null}
            </div>
          )}
        </section>

        {/* How to split */}
        <section aria-labelledby={`${id}-split-heading`} className={cn(panel, "flex flex-col gap-3")}>
          <h2 id={`${id}-split-heading`} className="text-sm font-semibold">
            Split
          </h2>
          <ToggleGroup
            type="single"
            value={form.splitMethod}
            onValueChange={(value) => value && set("splitMethod", value as SplitMethod)}
            className="w-full"
            aria-label="Split method"
          >
            {SPLIT_OPTIONS.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value} className="flex-1">
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <ul className="divide-y divide-border">
            {people.map((person) => {
              const share = preview.shares.get(person.id) ?? 0;
              const included = form.included.includes(person.id);
              const checkboxId = `${id}-include-${person.id}`;
              return (
                <li key={person.id} className="flex min-h-12 items-center gap-3 py-2">
                  {form.splitMethod === "equal" ? (
                    <Checkbox
                      id={checkboxId}
                      checked={included}
                      onCheckedChange={(checked) =>
                        set(
                          "included",
                          checked ? [...form.included, person.id] : form.included.filter((value) => value !== person.id),
                        )
                      }
                    />
                  ) : null}
                  <PersonAvatar person={person} size="sm" />
                  <label
                    htmlFor={form.splitMethod === "equal" ? checkboxId : `${id}-value-${person.id}`}
                    className="min-w-0 flex-1 truncate text-sm"
                  >
                    {nameOf(person.id)}
                  </label>
                  {form.splitMethod !== "equal" ? (
                    <span className="flex items-center gap-1.5">
                      <Input
                        id={`${id}-value-${person.id}`}
                        inputMode="decimal"
                        placeholder={form.splitMethod === "shares" ? "1" : "0"}
                        value={form.values[person.id] ?? ""}
                        onChange={(event) => set("values", { ...form.values, [person.id]: event.target.value })}
                        className="w-20 text-right tabular-nums"
                      />
                      <span className="w-10 text-xs text-muted-foreground">
                        {form.splitMethod === "percent" ? "%" : form.splitMethod === "shares" ? "shares" : form.currency}
                      </span>
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "w-20 text-right text-sm tabular-nums",
                      share > 0 ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                    aria-label={`${nameOf(person.id)} share`}
                  >
                    {total > 0 ? format(share) : ""}
                  </span>
                </li>
              );
            })}
          </ul>
          {remaining && remaining.left !== 0 ? (
            <p className="text-sm text-danger">
              {remaining.unit === "money"
                ? remaining.left > 0
                  ? `${format(remaining.left)} left to assign`
                  : `${format(-remaining.left)} too much`
                : remaining.left > 0
                  ? `${remaining.left / 100}% left to assign`
                  : `${-remaining.left / 100}% too much`}
            </p>
          ) : null}
        </section>
      </div>

      {/* The summary and save: a rail on wide screens, a bar above the tabs on phones. */}
      <aside
        aria-label="Summary"
        className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 -mx-4 flex flex-col gap-3 border-t border-separator bg-background/95 px-4 py-3 backdrop-blur-sm md:bottom-0 md:-mx-8 md:px-8 lg:top-8 lg:bottom-auto lg:mx-0 lg:gap-4 lg:border lg:border-border lg:bg-card lg:p-5 lg:backdrop-blur-none"
      >
        <div className="hidden lg:block">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums">
            {total > 0 ? format(total) : format(0)}
          </p>
        </div>
        {total > 0 && !problem ? (
          <ul className="hidden flex-col gap-2 border-t border-border pt-3 lg:flex">
            {people
              .filter((person) => (preview.shares.get(person.id) ?? 0) > 0)
              .map((person) => (
                <li key={person.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-muted-foreground">{nameOf(person.id)}</span>
                  <span className="font-medium tabular-nums">{format(preview.shares.get(person.id) ?? 0)}</span>
                </li>
              ))}
          </ul>
        ) : null}
        <div className="flex items-center justify-between gap-3 lg:block">{outcome}</div>
        {error ? (
          <p role="alert" className="border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger-strong">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2 lg:flex-col">
          <Button type="submit" variant="brand" size="lg" disabled={pending} className="flex-1 lg:w-full lg:flex-none">
            {pending ? <Spinner size="sm" /> : null}
            {pending ? "Saving…" : editing ? "Save changes" : "Save expense"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.push(cancelHref)}
            className="lg:w-full"
          >
            Cancel
          </Button>
        </div>
      </aside>
    </form>
  );
}
