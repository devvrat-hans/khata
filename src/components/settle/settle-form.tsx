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
  ToggleGroup,
  ToggleGroupItem,
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
import { PersonAvatar } from "../person-avatar";

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
  const payer = find(from);
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
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Field htmlFor={`${id}-from`} label="Who paid">
          <Select id={`${id}-from`} value={from} onChange={(event) => setFrom(event.target.value)}>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {label(person.id)}
              </option>
            ))}
          </Select>
        </Field>
        <IconArrowRight aria-hidden="true" className="mx-auto mb-2.5 hidden size-5 text-muted-foreground sm:block" />
        <Field htmlFor={`${id}-to`} label="Who received">
          <Select id={`${id}-to`} value={to} onChange={(event) => setTo(event.target.value)}>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {label(person.id)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {payer && receiver ? (
        <div className="flex items-center justify-center gap-4 border border-border bg-muted/20 p-4">
          <span className="flex flex-col items-center gap-1 text-xs">
            <PersonAvatar person={payer} size="lg" />
            {label(payer.id)}
          </span>
          <span className="flex flex-col items-center">
            <IconArrowRight aria-hidden="true" className="size-6 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-semibold tabular-nums">{minor > 0 ? formatMoney(minor, currency) : ""}</span>
          </span>
          <span className="flex flex-col items-center gap-1 text-xs">
            <PersonAvatar person={receiver} size="lg" />
            {label(receiver.id)}
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <Field htmlFor={`${id}-amount`} label="Amount" required>
          <Input
            id={`${id}-amount`}
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-12 text-2xl font-semibold tabular-nums"
          />
        </Field>
        <Field htmlFor={`${id}-currency`} label="Currency">
          <CurrencySelect id={`${id}-currency`} value={currency} onChange={(event) => setCurrency(event.target.value)} />
        </Field>
      </div>

      {upiUrl && receiver?.upiId ? (
        <div className="flex flex-col gap-3 border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-800/60 dark:bg-primary-950/30">
          <p className="text-sm">
            {receiver.name} accepts UPI at <span className="font-mono font-medium">{receiver.upiId}</span>. Pay first, then
            record the payment here.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="brand" size="sm">
              <a href={upiUrl}>Pay {formatMoney(minor, currency)} with a UPI app</a>
            </Button>
            <CopyButton value={receiver.upiId} label="Copy UPI ID" showLabel variant="outline" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">The UPI button opens your payments app on a phone.</p>
        </div>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Paid with</legend>
        <ToggleGroup
          type="single"
          value={method}
          onValueChange={(value) => value && setMethod(value as PaymentMethodValue)}
          className="flex w-full flex-wrap"
          aria-label="Payment method"
        >
          {PAYMENT_METHOD_VALUES.map((value) => (
            <ToggleGroupItem key={value} value={value} className="flex-1">
              {PAYMENT_METHOD_LABELS[value]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <Field htmlFor={`${id}-date`} label="Date">
          <Input id={`${id}-date`} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field htmlFor={`${id}-note`} label="Note (optional)">
          <Input id={`${id}-note`} maxLength={200} value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
      </div>

      {context.kind === "group" && involvesViewer ? (
        <div
          className={cn(
            "flex items-start justify-between gap-4 border p-4",
            isPrivate ? "border-primary-300 bg-primary-50/60 dark:border-primary-800 dark:bg-primary-950/30" : "border-border bg-muted/20",
          )}
        >
          <div>
            <label htmlFor={`${id}-private`} className="flex items-center gap-1.5 text-sm font-medium">
              <IconLock aria-hidden="true" className="size-4 text-primary-600 dark:text-primary-400" />
              Settles a private hisab
            </label>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Turn on when this pays back something private between the two of you. The rest of the group will not see it.
            </p>
          </div>
          <Switch id={`${id}-private`} checked={isPrivate} onCheckedChange={setIsPrivate} />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger-strong">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="brand" size="lg" disabled={pending}>
          {pending ? <Spinner size="sm" /> : null}
          {pending ? "Recording…" : "Record payment"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push(cancelHref)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
