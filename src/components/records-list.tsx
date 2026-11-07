import { Badge } from "@aback-ui/ui";
import { IconCash, IconChevronRight, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { Fragment } from "react";
import { formatMoney } from "@/domain/money";
import { dayParts, formatMonth } from "@/lib/format";
import type { PeopleIndex } from "@/server/queries";
import type { ExpenseRecord, LedgerRecord, SettlementRecord } from "@/server/services/ledger";
import { DeletePaymentButton } from "./delete-payment-button";
import { CATEGORY_ICONS } from "./icons";

function name(people: PeopleIndex, id: string, viewerId: string, capital = false): string {
  if (id === viewerId) return capital ? "You" : "you";
  return people[id]?.name ?? "Someone";
}

function DateBadge({ date }: { date: string }) {
  const { month, day } = dayParts(date);
  return (
    <span className="flex w-10 shrink-0 flex-col items-center border border-border bg-background py-1 leading-none">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{month}</span>
      <span className="mt-1 text-base font-semibold tabular-nums text-foreground">{day}</span>
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
  if (paid === 0 && share === 0) return <span className="text-xs text-muted-foreground">not involved</span>;
  if (net === 0) return <span className="text-xs text-muted-foreground">your share is paid</span>;
  return (
    <span className="flex flex-col items-end text-right">
      <span className={net > 0 ? "text-xs text-success" : "text-xs text-danger"}>{net > 0 ? "you lent" : "you borrowed"}</span>
      <span className={net > 0 ? "text-sm font-semibold tabular-nums text-success" : "text-sm font-semibold tabular-nums text-danger"}>
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
      <Badge variant="brand" className="gap-1">
        <IconLock aria-hidden="true" className="size-3" />
        {showGroup ? `Private in ${groupName ?? "a group"}` : `Private with ${other ? name(people, other, viewerId) : "one person"}`}
      </Badge>
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
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
    >
      <DateBadge date={record.date} />
      <span className="hidden size-10 shrink-0 items-center justify-center bg-primary-100 text-primary-600 sm:flex dark:bg-primary-900 dark:text-primary-400">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{record.description}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {payersText(record, people, viewerId)}
          {privateLabel(record, people, viewerId, groupNames)}
        </span>
      </span>
      <ExpenseImpact record={record} viewerId={viewerId} />
      <IconChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
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
    <div className="flex items-center gap-3 px-4 py-3">
      <DateBadge date={record.date} />
      <span className="hidden size-10 shrink-0 items-center justify-center bg-success-soft text-success sm:flex">
        <IconCash aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">
          {name(people, record.fromUserId, viewerId, true)} paid {name(people, record.toUserId, viewerId)} {amount}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          Payment{record.note ? `: ${record.note}` : ""}
          {privateLabel(record, people, viewerId, groupNames)}
        </span>
      </span>
      {involved ? (
        <span className="flex flex-col items-end text-right">
          <span className="text-xs text-muted-foreground">{record.fromUserId === viewerId ? "you paid" : "you received"}</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">{amount}</span>
        </span>
      ) : null}
      <DeletePaymentButton settlementId={record.id} label={`${name(people, record.fromUserId, viewerId, true)} paid ${name(people, record.toUserId, viewerId)} ${amount}`} />
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
    <div className="border border-border bg-card">
      {records.map((record, index) => {
        const month = months[index] ?? "";
        const header = index === 0 || months[index - 1] !== month;
        return (
          <Fragment key={`${record.kind}-${record.id}`}>
            {header ? (
              <h3
                className={
                  index === 0
                    ? "bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    : "border-t border-border bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                }
              >
                {month}
              </h3>
            ) : null}
            <div className="border-t border-border">
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
