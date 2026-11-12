"use client";

import {
  Button,
  CopyButton,
  cn,
  Field,
  Input,
  Select,
  Spinner,
  Switch,
  toast,
} from "@aback-ui/ui";
import { IconArrowRight, IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import { formatMoney, parseAmount } from "@/domain/money";
import { PAYMENT_METHOD_LABELS, type PaymentMethodValue } from "@/lib/labels";
import { useLocalToday } from "@/lib/use-local-today";
import { PAYMENT_METHOD_VALUES } from "@/lib/validation";
import { recordPaymentAction } from "@/server/actions/expenses";
import { CurrencySelect } from "../currency-select";

export interface SettlePerson {
  id: string;
  name: string;
  image: string | null;
  upiId: string | null;
}

export type SettleContext =
  | { kind: "group"; groupId: string; groupName: string; members: SettlePerson[] }
  | { kind: "person"; person: SettlePerson };

export function SettleForm({
  viewer,
  context,
  initial,
  cancelHref,
}: {
  viewer: SettlePerson;
  context: SettleContext;
  initial: { from: string; to: string; amount: string; currency: string; isPrivate: boolean };
  cancelHref: string;
}) {
  const router = useRouter();
  const id = useId();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [amount, setAmount] = useState(initial.amount);
  const [currency, setCurrency] = useState(initial.currency);
  const [pickedDate, setDate] = useState("");
  const today = useLocalToday();
  const date = pickedDate || today;
  const [method, setMethod] = useState<PaymentMethodValue>(initial.currency === "INR" ? "upi" : "cash");
  const [note, setNote] = useState("");
  const [isPrivate, setIsPrivate] = useState(initial.isPrivate);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const people = context.kind === "group" ? context.members : [viewer, context.person];
  const find = (personId: string) => people.find((person) => person.id === personId);
  const receiver = find(to);
  const minor = parseAmount(amount || "0", currency) ?? 0;
  const involvesViewer = from === viewer.id || to === viewer.id;
  const label = (personId: string) => (personId === viewer.id ? "You" : (find(personId)?.name ?? "Someone"));

  const upiUrl =
    currency === "INR" && from === viewer.id && receiver?.upiId && minor > 0
      ? `upi://pay?${new URLSearchParams({
          pa: receiver.upiId,
          pn: receiver.name,
          am: (minor / 100).toFixed(2),
          cu: "INR",
          tn: "Khata settle up",
        }).toString()}`
      : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (from === to) return setError("Choose two different people.");
    if (minor <= 0) return setError("Enter an amount greater than zero.");
    startTransition(async () => {
      const result = await recordPaymentAction({
        groupId: context.kind === "group" ? context.groupId : null,
        isPrivate: context.kind === "group" ? isPrivate && involvesViewer : false,
        fromUserId: from,
        toUserId: to,
        amount,
        currency,
        date,
        method,
        note,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Payment recorded");
      router.push(result.data.returnTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-amount`} className="type-meta text-muted-foreground">
          Amount
        </label>
        <div className="flex items-end gap-4">
          <Input
            id={`${id}-amount`}
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            autoFocus={!initial.amount}
            className="h-auto min-w-0 flex-1 border-0 border-b border-separator bg-transparent px-0 dark:bg-transparent py-1 text-5xl font-medium tracking-[-0.045em] tabular-nums shadow-none transition-colors duration-200 focus-visible:border-foreground focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-6xl"
          />
          <div className="w-24 shrink-0 pb-1">
            <CurrencySelect
              compact
              id={`${id}-currency`}
              aria-label="Currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="h-11 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:gap-3">
        <Field htmlFor={`${id}-from`} label="Who paid">
          <Select id={`${id}-from`} value={from} onChange={(event) => setFrom(event.target.value)} className="h-11">
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {label(person.id)}
              </option>
            ))}
          </Select>
        </Field>
        <IconArrowRight aria-hidden="true" className="mx-auto mb-3 size-5 text-muted-foreground" />
        <Field htmlFor={`${id}-to`} label="Who received">
          <Select id={`${id}-to`} value={to} onChange={(event) => setTo(event.target.value)} className="h-11">
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {label(person.id)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {upiUrl && receiver?.upiId ? (
        <div className="flex flex-col gap-4 border-l-2 border-primary-700 py-1 pl-5 dark:border-primary-400">
          <p className="text-[0.9375rem] leading-relaxed">
            {receiver.name} accepts UPI at <span className="font-mono font-medium">{receiver.upiId}</span>. Pay first, then
            record the payment here.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="brand">
              <a href={upiUrl}>Pay {formatMoney(minor, currency)} with a UPI app</a>
            </Button>
            <CopyButton value={receiver.upiId} label="Copy UPI ID" showLabel variant="outline" />
          </div>
          <p className="text-xs text-muted-foreground">The UPI button opens your payments app on a phone.</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <span id={`${id}-method`} className="type-meta text-muted-foreground">
          Paid with
        </span>
        <div role="radiogroup" aria-labelledby={`${id}-method`} className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {PAYMENT_METHOD_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={method === value}
              onClick={() => setMethod(value)}
              className={cn(
                "h-11 border px-2 text-sm leading-tight transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                method === value
                  ? "border-foreground bg-foreground font-medium text-background"
                  : "border-separator bg-background hover:border-foreground",
              )}
            >
              {PAYMENT_METHOD_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <Field htmlFor={`${id}-date`} label="Date">
          <Input id={`${id}-date`} type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11" />
        </Field>
        <Field htmlFor={`${id}-note`} label="Note (optional)">
          <Input id={`${id}-note`} maxLength={200} value={note} onChange={(event) => setNote(event.target.value)} className="h-11" />
        </Field>
      </div>

      {context.kind === "group" && involvesViewer ? (
        <div
          className={cn(
            "flex items-start justify-between gap-6 border-l-2 py-1 pl-5 transition-colors duration-200",
            isPrivate ? "border-primary-700 dark:border-primary-400" : "border-border",
          )}
        >
          <div>
            <label
              htmlFor={`${id}-private`}
              className={cn(
                "flex items-center gap-2 text-base font-medium tracking-[-0.01em]",
                isPrivate ? "text-primary-700 dark:text-primary-400" : "text-foreground",
              )}
            >
              <IconLock aria-hidden="true" className="size-4" />
              Settles a private hisab
            </label>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Turn on when this pays back something private between the two of you. The rest of the group will not see it.
            </p>
          </div>
          <Switch id={`${id}-private`} checked={isPrivate} onCheckedChange={setIsPrivate} />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="border-l-2 border-danger bg-danger-soft px-3 py-2 text-sm text-danger-strong">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2 border-t border-border pt-6">
        <Button type="submit" variant="brand" size="lg" disabled={pending} className="h-12 flex-1 px-6 sm:flex-none">
          {pending ? <Spinner size="sm" /> : null}
          {pending ? "Recording…" : "Record payment"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push(cancelHref)} className="h-12">
          Cancel
        </Button>
      </div>
    </form>
  );
}
