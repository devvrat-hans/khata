import { IconCash, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { Fragment } from "react";
import { formatMoney } from "@/domain/money";
import { dayParts, firstName, formatMonth } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";
import type { PeopleIndex } from "@/server/queries";
import type { ExpenseRecord, LedgerRecord, SettlementRecord } from "@/server/services/ledger";
import { DeletePaymentButton } from "./delete-payment-button";
import { CATEGORY_ICONS } from "./icons";

function shortName(people: PeopleIndex, id: string, viewerId: string): string {
  return id === viewerId ? "you" : firstName(people[id]?.name ?? "someone");
}

function name(people: PeopleIndex, id: string, viewerId: string, capital = false): string {
  if (id === viewerId) return capital ? "You" : "you";
  return people[id]?.name ?? "Someone";
}

function DateBadge({ date }: { date: string }) {
  const { month, day } = dayParts(date);
  return (
    <span className="flex w-9 shrink-0 flex-col items-start leading-none">
      <span className="text-xl font-medium tracking-[-0.03em] tabular-nums text-foreground">{day}</span>
      <span className="type-meta mt-1 text-muted-foreground">{month}</span>
    </span>
  );
}

function payersText(record: ExpenseRecord, people: PeopleIndex, viewerId: string): string {
  if (record.payers.length === 1) {
    const payer = record.payers[0];
    if (!payer) return "";
    return `${name(people, payer.userId, viewerId, true)} paid ${formatMoney(record.amount, record.currency)}`;
  }
  return `${record.payers.length} people paid ${formatMoney(record.amount, record.currency)}`;
}

function ExpenseImpact({ record, viewerId }: { record: ExpenseRecord; viewerId: string }) {
  const paid = record.payers.find((payer) => payer.userId === viewerId)?.amount ?? 0;
  const share = record.shares.find((portion) => portion.userId === viewerId)?.amount ?? 0;
  const net = paid - share;
  if (paid === 0 && share === 0) return <span className="type-meta shrink-0 text-muted-foreground">not involved</span>;
  if (net === 0) return <span className="type-meta shrink-0 text-muted-foreground">even</span>;
  return (
    <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
      <span className={net > 0 ? "type-meta text-success" : "type-meta text-danger"}>
        {net > 0 ? "you lent" : "you borrowed"}
      </span>
      <span
        className={
          net > 0
            ? "text-base font-medium tracking-[-0.01em] tabular-nums text-success"
            : "text-base font-medium tracking-[-0.01em] tabular-nums text-danger"
        }
      >
        {formatMoney(net, record.currency)}
      </span>
    </span>
  );
}

function privateLabel(record: LedgerRecord, people: PeopleIndex, viewerId: string, showGroup?: Record<string, string>) {
  if (record.visibility !== "pair") return null;
  const other = record.pairA === viewerId ? record.pairB : record.pairA;
  if (record.groupId) {
    const groupName = showGroup?.[record.groupId];
    return (
      <span className="inline-flex items-center gap-1 font-medium text-primary-700 dark:text-primary-400">
        <IconLock aria-hidden="true" className="size-3.5" />
        {showGroup ? `Private in ${groupName ?? "a group"}` : `Private with ${other ? shortName(people, other, viewerId) : "one person"}`}
      </span>
    );
  }
  return null;
}

function ExpenseItem({
  record,
  people,
  viewerId,
  groupNames,
}: {
  record: ExpenseRecord;
  people: PeopleIndex;
  viewerId: string;
  groupNames?: Record<string, string>;
}) {
  const Icon = CATEGORY_ICONS[record.category];
  return (
    <Link
      href={`/expenses/${record.id}`}
      className="row-link -mx-3 flex items-center gap-4 px-3 py-4"
    >
      <DateBadge date={record.date} />
      <span className="hidden size-10 shrink-0 items-center justify-center border border-border text-muted-foreground sm:flex">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-medium tracking-[-0.01em] text-foreground">{record.description}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {payersText(record, people, viewerId)}
          {privateLabel(record, people, viewerId, groupNames)}
        </span>
      </span>
      <ExpenseImpact record={record} viewerId={viewerId} />
    </Link>
  );
}

function SettlementItem({
  record,
  people,
  viewerId,
  groupNames,
}: {
  record: SettlementRecord;
  people: PeopleIndex;
  viewerId: string;
  groupNames?: Record<string, string>;
}) {
  const amount = formatMoney(record.amount, record.currency);
  const involved = record.fromUserId === viewerId || record.toUserId === viewerId;
  return (
    <div className="-mx-3 flex items-center gap-4 px-3 py-4">
      <DateBadge date={record.date} />
      <span className="hidden size-10 shrink-0 items-center justify-center border border-success/40 text-success sm:flex">
        <IconCash aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium tracking-[-0.01em] text-foreground">
          {name(people, record.fromUserId, viewerId, true)} paid {name(people, record.toUserId, viewerId)}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {PAYMENT_METHOD_LABELS[record.method]}
          {record.note ? `: ${record.note}` : ""}
          {privateLabel(record, people, viewerId, groupNames)}
        </span>
      </span>
      <DeletePaymentButton
        settlementId={record.id}
        label={`${name(people, record.fromUserId, viewerId, true)} paid ${name(people, record.toUserId, viewerId)} ${amount}`}
      />
      <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        <span className="type-meta text-muted-foreground">
          {!involved ? "payment" : record.fromUserId === viewerId ? "you paid" : "you received"}
        </span>
        <span className="text-base font-medium tracking-[-0.01em] tabular-nums text-foreground">{amount}</span>
      </span>
    </div>
  );
}

/**
 * Expenses and payments, newest first, under month headings. Each expense
 * shows what it means for the viewer: lent, borrowed or not involved.
 */
export function RecordsList({
  records,
  people,
  viewerId,
  groupNames,
}: {
  records: LedgerRecord[];
  people: PeopleIndex;
  viewerId: string;
  /** Show which group a private record belongs to (on a person's page). */
  groupNames?: Record<string, string>;
}) {
  const months = records.map((record) => formatMonth(record.date));
  return (
    <div>
      {records.map((record, index) => {
        const month = months[index] ?? "";
        const header = index === 0 || months[index - 1] !== month;
        return (
          <Fragment key={`${record.kind}-${record.id}`}>
            {header ? (
              <h3 className={index === 0 ? "type-meta pb-2 text-muted-foreground" : "type-meta pt-8 pb-2 text-muted-foreground"}>
                {month}
              </h3>
            ) : null}
            <div className={header ? "border-y border-border" : "border-b border-border"}>
              {record.kind === "expense" ? (
                <ExpenseItem record={record} people={people} viewerId={viewerId} groupNames={groupNames} />
              ) : (
                <SettlementItem record={record} people={people} viewerId={viewerId} groupNames={groupNames} />
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
