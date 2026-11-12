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
  toast,
} from "@aback-ui/ui";
import { IconLock, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useId, useMemo, useState, useTransition } from "react";
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

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
/** A selectable chip: ink when chosen, a hairline otherwise. */
const choice = (selected: boolean) =>
  cn(
    "border text-sm transition-colors duration-200",
    focusRing,
    selected
      ? "border-foreground bg-foreground font-medium text-background"
      : "border-separator bg-background text-foreground hover:border-foreground",
  );
/** A large field set on a single hairline, for the two things every expense needs. */
const bareInput =
  "h-auto border-0 border-b border-separator bg-transparent px-0 shadow-none dark:bg-transparent transition-colors duration-200 focus-visible:border-foreground focus-visible:ring-0 focus-visible:ring-offset-0";

/** A numbered step of the form, with a mono index before its heading. */
function Step({
  index,
  title,
  titleId,
  action,
  children,
  className,
}: {
  index: number;
  title: string;
  titleId?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={titleId} className={className}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id={titleId} className="flex items-baseline gap-3 text-lg font-medium tracking-[-0.02em]">
          <span aria-hidden="true" className="type-meta text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

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
      <p className="flex items-center gap-2 text-sm font-medium text-success">
        <span aria-hidden="true" className="size-2 shrink-0 bg-success" />
        You lend {format(yourNet)}
      </p>
    ) : yourNet < 0 ? (
      <p className="flex items-center gap-2 text-sm font-medium text-danger">
        <span aria-hidden="true" className="size-2 shrink-0 bg-danger" />
        You borrow {format(-yourNet)}
      </p>
    ) : (
      <p className="text-sm text-muted-foreground">You neither lend nor borrow on this.</p>
    );

  // Step numbers, counted once: the quick split only shows for two people.
  const offset = quick.length > 0 ? 1 : 0;

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start lg:gap-x-12"
      noValidate
    >
      <div className="flex min-w-0 flex-col gap-12 lg:col-span-8">
        {/* What and how much */}
        <Step index={1} title="What it was" titleId={`${id}-details-heading`}>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label htmlFor={`${id}-description`} className="type-meta text-muted-foreground">
                Description
              </label>
              <Input
                id={`${id}-description`}
                placeholder="Dinner, cab, groceries"
                value={form.description}
                maxLength={100}
                onChange={(event) => set("description", event.target.value)}
                autoFocus={!editing}
                required
                className={cn(bareInput, "py-2 text-2xl font-medium tracking-[-0.025em] placeholder:font-normal")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={`${id}-amount`} className="type-meta text-muted-foreground">
                Amount
              </label>
              <div className="flex items-end gap-4">
                <Input
                  id={`${id}-amount`}
                  inputMode="decimal"
                  placeholder="0"
                  autoComplete="off"
                  value={form.amount}
                  onChange={(event) => set("amount", event.target.value)}
                  required
                  className={cn(
                    bareInput,
                    "min-w-0 flex-1 py-1 text-5xl font-medium tracking-[-0.045em] tabular-nums sm:text-6xl",
                  )}
                />
                <div className="w-24 shrink-0 pb-1">
                  <CurrencySelect
                    compact
                    id={`${id}-currency`}
                    aria-label="Currency"
                    value={form.currency}
                    onChange={(event) => set("currency", event.target.value)}
                    className="h-11 font-medium"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field htmlFor={`${id}-category`} label="Category">
                <Select
                  id={`${id}-category`}
                  value={form.category}
                  onChange={(event) => set("category", event.target.value as CategoryValue)}
                  className="h-11"
                >
                  {CATEGORY_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {CATEGORY_LABELS[value]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field htmlFor={`${id}-date`} label="Date">
                <Input
                  id={`${id}-date`}
                  type="date"
                  value={date}
                  onChange={(event) => set("date", event.target.value)}
                  className="h-11"
                />
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
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 border-b border-separator pb-0.5 text-sm font-medium transition-colors duration-200 hover:border-foreground",
                  focusRing,
                )}
              >
                <IconPlus aria-hidden="true" className="size-3.5" />
                Add a note
              </button>
            )}
          </div>
        </Step>

        {/* Private hisab inside a group */}
        {context.kind === "group" && otherMembers.length > 0 ? (
          <section
            aria-label="Privacy"
            className={cn(
              "flex flex-col gap-5 border-l-2 py-1 pl-5 transition-colors duration-200",
              form.isPrivate ? "border-primary-700 dark:border-primary-400" : "border-border",
            )}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <label
                  htmlFor={`${id}-private`}
                  className={cn(
                    "flex items-center gap-2 text-base font-medium tracking-[-0.01em]",
                    form.isPrivate ? "text-primary-700 dark:text-primary-400" : "text-foreground",
                  )}
                >
                  <IconLock aria-hidden="true" className="size-4" />
                  Private between two
                </label>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Only you and one other member see it. It stays out of the group&apos;s balances, its feed and its
                  export.
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
              <div className="flex flex-col gap-2">
                <p id={`${id}-with-label`} className="type-meta text-muted-foreground">
                  Between you and
                </p>
                <div role="radiogroup" aria-labelledby={`${id}-with-label`} className="flex flex-wrap gap-2">
                  {otherMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      role="radio"
                      aria-checked={form.privateWith === member.id}
                      disabled={editing}
                      onClick={() => changePeople({ privateWith: member.id })}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 px-2.5 disabled:opacity-60",
                        choice(form.privateWith === member.id),
                      )}
                    >
                      <PersonAvatar person={member} size="xs" />
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Quick choices for two people */}
        {quick.length > 0 ? (
          <Step index={2} title="Quick split" titleId={`${id}-quick-heading`}>
            <div role="group" aria-labelledby={`${id}-quick-heading`} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                  className={cn("px-3.5 py-3 text-left", choice(activeQuick === index))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Step>
        ) : null}

        {/* Who paid */}
        <Step
          index={2 + offset}
          title="Paid by"
          titleId={`${id}-paid-heading`}
          action={
            people.length > 1 ? (
              <button
                type="button"
                className={cn(
                  "border-b border-separator pb-0.5 text-sm font-medium transition-colors duration-200 hover:border-foreground",
                  focusRing,
                )}
                onClick={() => set("payerMode", form.payerMode === "single" ? "multiple" : "single")}
              >
                {form.payerMode === "single" ? "Several people paid" : "One person paid"}
              </button>
            ) : null
          }
        >
          {form.payerMode === "single" ? (
            <div role="radiogroup" aria-labelledby={`${id}-paid-heading`} className="flex flex-wrap gap-2">
              {people.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  role="radio"
                  aria-checked={form.payer === person.id}
                  onClick={() => set("payer", person.id)}
                  className={cn("inline-flex h-11 items-center gap-2.5 px-3", choice(form.payer === person.id))}
                >
                  <PersonAvatar person={person} size="xs" />
                  {person.id === viewer.id ? "You" : person.name}
                </button>
              ))}
            </div>
          ) : (
            <ul className="border-t border-border">
              {people.map((person) => (
                <li key={person.id} className="flex items-center gap-3 border-b border-border py-3">
                  <PersonAvatar person={person} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{nameOf(person.id)}</span>
                  <Input
                    inputMode="decimal"
                    placeholder="0"
                    aria-label={`${nameOf(person.id)} paid`}
                    value={form.payerAmounts[person.id] ?? ""}
                    onChange={(event) => set("payerAmounts", { ...form.payerAmounts, [person.id]: event.target.value })}
                    className="h-10 w-32 text-right tabular-nums"
                  />
                </li>
              ))}
              {payerProblem ? <li className="pt-3 text-sm text-danger">{payerProblem}</li> : null}
            </ul>
          )}
        </Step>

        {/* How to split */}
        <Step index={3 + offset} title="Split" titleId={`${id}-split-heading`}>
          <div
            role="radiogroup"
            aria-label="Split method"
            className="grid grid-cols-4 divide-x divide-separator border border-separator"
          >
            {SPLIT_OPTIONS.map((option) => {
              const selected = form.splitMethod === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => set("splitMethod", option.value)}
                  className={cn(
                    "h-11 text-sm transition-colors duration-200",
                    focusRing,
                    selected
                      ? "bg-foreground font-medium text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <ul className="mt-4 border-t border-border">
            {people.map((person) => {
              const share = preview.shares.get(person.id) ?? 0;
              const included = form.included.includes(person.id);
              const checkboxId = `${id}-include-${person.id}`;
              return (
                <li key={person.id} className="flex min-h-14 items-center gap-3 border-b border-border py-2.5">
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
                    className={cn(
                      "min-w-0 flex-1 truncate text-sm font-medium",
                      form.splitMethod === "equal" && !included ? "text-muted-foreground" : "text-foreground",
                    )}
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
                        className="h-10 w-20 text-right tabular-nums"
                      />
                      <span className="type-meta w-12 text-muted-foreground">
                        {form.splitMethod === "percent" ? "%" : form.splitMethod === "shares" ? "shares" : form.currency}
                      </span>
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "w-24 text-right text-[0.9375rem] tabular-nums",
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
            <p className="mt-3 text-sm text-danger">
              {remaining.unit === "money"
                ? remaining.left > 0
                  ? `${format(remaining.left)} left to assign`
                  : `${format(-remaining.left)} too much`
                : remaining.left > 0
                  ? `${remaining.left / 100}% left to assign`
                  : `${-remaining.left / 100}% too much`}
            </p>
          ) : null}
        </Step>
      </div>

      {/* The summary and save: a rail on wide screens, a bar above the tabs on phones. */}
      <aside
        aria-label="Summary"
        className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 flex flex-col gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:bottom-0 lg:top-24 lg:bottom-auto lg:col-span-4 lg:mx-0 lg:gap-5 lg:border-t-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0 lg:backdrop-blur-none"
      >
        <div className="hidden lg:block">
          <p className="type-meta text-muted-foreground">Total</p>
          <p className="mt-2 text-5xl font-medium tracking-[-0.045em] tabular-nums">{format(total > 0 ? total : 0)}</p>
        </div>
        {total > 0 && !problem ? (
          <ul className="hidden border-t border-border lg:block">
            {people
              .filter((person) => (preview.shares.get(person.id) ?? 0) > 0)
              .map((person) => (
                <li
                  key={person.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-sm"
                >
                  <span className="truncate text-muted-foreground">{nameOf(person.id)}</span>
                  <span className="font-medium tabular-nums">{format(preview.shares.get(person.id) ?? 0)}</span>
                </li>
              ))}
          </ul>
        ) : null}
        <div className="flex items-center justify-between gap-3 lg:block">{outcome}</div>
        {error ? (
          <p role="alert" className="border-l-2 border-danger bg-danger-soft px-3 py-2 text-sm text-danger-strong">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2 lg:flex-col">
          <Button type="submit" variant="brand" size="lg" disabled={pending} className="h-12 flex-1 lg:w-full lg:flex-none">
            {pending ? <Spinner size="sm" /> : null}
            {pending ? "Saving…" : editing ? "Save changes" : "Save expense"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => router.push(cancelHref)}
            className="h-12 lg:w-full"
          >
            Cancel
          </Button>
        </div>
      </aside>
    </form>
  );
}
