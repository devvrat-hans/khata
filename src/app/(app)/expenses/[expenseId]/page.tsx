import { Badge, Button } from "@aback-ui/ui";
import { IconArrowLeft, IconLock, IconPencil } from "@tabler/icons-react";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { CATEGORY_ICONS, IconChip } from "@/components/icons";
import { PersonAvatar } from "@/components/person-avatar";
import { formatMoney } from "@/domain/money";
import { formatLongDay } from "@/lib/format";
import { CATEGORY_LABELS, SPLIT_METHOD_LABELS } from "@/lib/labels";
import { getViewer, requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { groups } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import { listActivity } from "@/server/services/activity";
import { getExpenseForViewer } from "@/server/services/expenses";
import { getPeople } from "@/server/services/users";

export async function generateMetadata({ params }: { params: Promise<{ expenseId: string }> }): Promise<Metadata> {
  const viewer = await getViewer();
  if (!viewer) return { title: "Expense" };
  const record = await getExpenseForViewer(getDb(), viewer.id, (await params).expenseId).catch(() => null);
  return { title: record?.description ?? "Expense" };
}

export default async function ExpensePage({ params }: { params: Promise<{ expenseId: string }> }) {
  const { expenseId } = await params;
  const viewer = await requireOnboardedViewer();
  const db = getDb();
  const record = await getExpenseForViewer(db, viewer.id, expenseId).catch((error: unknown) => {
    if (error instanceof AppError && error.code === "not_found") notFound();
    throw error;
  });

  const ids = [...record.payers, ...record.shares].map((portion) => portion.userId);
  ids.push(record.createdBy);
  if (record.updatedBy) ids.push(record.updatedBy);
  const [people, group, history] = await Promise.all([
    getPeople(db, ids),
    record.groupId
      ? db.query.groups.findFirst({ where: eq(groups.id, record.groupId), columns: { id: true, name: true } })
      : Promise.resolve(undefined),
    listActivity(db, viewer.id, { expenseId: record.id, limit: 50 }),
  ]);
  const nameOf = (id: string) => (id === viewer.id ? "You" : (people.get(id)?.name ?? "Someone"));
  const isPrivate = record.visibility === "pair";
  const other = record.pairA === viewer.id ? record.pairB : record.pairA;
  const backHref = record.groupId ? `/groups/${record.groupId}` : other ? `/people/${other}` : "/dashboard";
  const backLabel = group?.name ?? (other ? (people.get(other)?.name ?? "Back") : "Home");
  const Icon = CATEGORY_ICONS[record.category];
  const changes = [...history].reverse();

  const paid = record.payers.find((payer) => payer.userId === viewer.id)?.amount ?? 0;
  const share = record.shares.find((portion) => portion.userId === viewer.id)?.amount ?? 0;
  const net = paid - share;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <IconArrowLeft aria-hidden="true" className="size-4" />
          {backLabel}
        </Link>
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <IconChip icon={Icon} size="lg" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight break-words sm:text-3xl">{record.description}</h1>
            <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">
              {formatMoney(record.amount, record.currency)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{formatLongDay(record.date)}</span>
              <Badge variant="muted">{CATEGORY_LABELS[record.category]}</Badge>
              {isPrivate ? (
                <Badge variant="brand" className="gap-1">
                  <IconLock aria-hidden="true" className="size-3" />
                  {record.groupId ? "Private between two" : "One to one"}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/expenses/${record.id}/edit`}>
              <IconPencil aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <DeleteExpenseButton expenseId={record.id} description={record.description} />
        </div>
      </header>

      {paid > 0 || share > 0 ? (
        <p
          className={
            net > 0
              ? "border border-success/20 bg-success-soft px-4 py-3 text-sm text-success-strong"
              : net < 0
                ? "border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger-strong"
                : "border border-border bg-muted/30 px-4 py-3 text-sm"
          }
        >
          {net > 0
            ? `You lent ${formatMoney(net, record.currency)} on this expense.`
            : net < 0
              ? `You borrowed ${formatMoney(-net, record.currency)} on this expense.`
              : "Your share is exactly what you paid."}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section aria-labelledby="paid-heading" className="border border-border bg-card shadow-sm">
          <h2 id="paid-heading" className="border-b border-border px-4 py-3 text-base font-semibold">
            Paid by
          </h2>
          <ul className="divide-y divide-border">
            {record.payers.map((payer) => {
              const person = people.get(payer.userId);
              return (
                <li key={payer.userId} className="flex items-center gap-3 px-4 py-2.5">
                  {person ? <PersonAvatar person={person} size="sm" /> : null}
                  <span className="flex-1 text-sm">{nameOf(payer.userId)}</span>
                  <span className="text-sm font-semibold tabular-nums">{formatMoney(payer.amount, record.currency)}</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby="split-heading" className="border border-border bg-card shadow-sm">
          <h2 id="split-heading" className="flex items-center justify-between border-b border-border px-4 py-3 text-base font-semibold">
            Split
            <span className="text-xs font-normal text-muted-foreground">{SPLIT_METHOD_LABELS[record.splitMethod]}</span>
          </h2>
          <ul className="divide-y divide-border">
            {record.shares.map((portion) => {
              const person = people.get(portion.userId);
              return (
                <li key={portion.userId} className="flex items-center gap-3 px-4 py-2.5">
                  {person ? <PersonAvatar person={person} size="sm" /> : null}
                  <span className="flex-1 text-sm">
                    {nameOf(portion.userId)}
                    {record.splitMethod === "percent" && portion.inputValue !== null ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">{portion.inputValue / 100}%</span>
                    ) : null}
                    {record.splitMethod === "shares" && portion.inputValue !== null ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {portion.inputValue / 100} {portion.inputValue === 100 ? "share" : "shares"}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatMoney(portion.amount, record.currency)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {record.notes ? (
        <section aria-labelledby="notes-heading" className="border border-border bg-card p-4 shadow-sm">
          <h2 id="notes-heading" className="text-sm font-semibold">
            Notes
          </h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{record.notes}</p>
        </section>
      ) : null}

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-2 text-sm font-semibold">
          History
        </h2>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {changes.length > 0 ? (
            changes.map((row) => (
              <li key={row.id}>
                {nameOf(row.actorId)} {row.type === "expense.created" ? "added this" : "edited this"} on{" "}
                {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(row.createdAt)}
              </li>
            ))
          ) : (
            <li>
              Added by {nameOf(record.createdBy)} on{" "}
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(record.createdAt)}
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
