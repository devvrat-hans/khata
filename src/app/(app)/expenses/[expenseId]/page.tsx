import { Button, cn, RelativeTime } from "@aback-ui/ui";
import { IconArrowLeft, IconLock, IconPencil } from "@tabler/icons-react";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { SectionLabel, StatusMark } from "@/components/editorial";
import { SectionTitle } from "@/components/page-title";
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
  const changes = [...history].reverse();

  const paid = record.payers.find((payer) => payer.userId === viewer.id)?.amount ?? 0;
  const share = record.shares.find((portion) => portion.userId === viewer.id)?.amount ?? 0;
  const net = paid - share;

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <div className="flex flex-col gap-8">
        <Link
          href={backHref}
          className="link-quiet inline-flex w-fit items-center gap-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <IconArrowLeft aria-hidden="true" className="size-4" />
          {backLabel}
        </Link>

        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0">
            <SectionLabel as="div">
              {CATEGORY_LABELS[record.category]} · {formatLongDay(record.date)}
            </SectionLabel>
            <h1 className="type-page mt-5 text-balance break-words">{record.description}</h1>
            <p className="type-figure mt-6 text-foreground">{formatMoney(record.amount, record.currency)}</p>
            {isPrivate ? (
              <StatusMark tone="brand" className="mt-5">
                <IconLock aria-hidden="true" className="size-3.5" />
                {record.groupId ? "Private between two, hidden from the group" : "One to one hisab"}
              </StatusMark>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="lg">
              <Link href={`/expenses/${record.id}/edit`}>
                <IconPencil aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <DeleteExpenseButton expenseId={record.id} description={record.description} />
          </div>
        </header>
      </div>

      {paid > 0 || share > 0 ? (
        <p className="flex items-center gap-3 border-y border-border py-5 text-lg tracking-[-0.015em]">
          <span
            aria-hidden="true"
            className={cn(
              "size-2.5 shrink-0",
              net > 0 ? "bg-success" : net < 0 ? "bg-danger" : "border border-muted-foreground",
            )}
          />
          {net > 0 ? (
            <span>
              You lent <span className="font-medium text-success">{formatMoney(net, record.currency)}</span> on this
              expense.
            </span>
          ) : net < 0 ? (
            <span>
              You borrowed <span className="font-medium text-danger">{formatMoney(-net, record.currency)}</span> on this
              expense.
            </span>
          ) : (
            <span className="text-muted-foreground">Your share is exactly what you paid.</span>
          )}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-12">
        <section aria-labelledby="paid-heading" className="min-w-0">
          <SectionTitle id="paid-heading" title="Paid by" count={record.payers.length} />
          <ul className="border-t border-border">
            {record.payers.map((payer) => {
              const person = people.get(payer.userId);
              return (
                <li key={payer.userId} className="flex items-center gap-3 border-b border-border py-3.5">
                  {person ? <PersonAvatar person={person} size="sm" /> : null}
                  <span className="flex-1 text-sm font-medium">{nameOf(payer.userId)}</span>
                  <span className="text-[0.9375rem] font-medium tabular-nums">
                    {formatMoney(payer.amount, record.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section aria-labelledby="split-heading" className="min-w-0">
          <SectionTitle
            id="split-heading"
            title="Split"
            count={record.shares.length}
            action={<span className="type-meta text-muted-foreground">{SPLIT_METHOD_LABELS[record.splitMethod]}</span>}
          />
          <ul className="border-t border-border">
            {record.shares.map((portion) => {
              const person = people.get(portion.userId);
              return (
                <li key={portion.userId} className="flex items-center gap-3 border-b border-border py-3.5">
                  {person ? <PersonAvatar person={person} size="sm" /> : null}
                  <span className="flex flex-1 items-baseline gap-2 text-sm font-medium">
                    {nameOf(portion.userId)}
                    {record.splitMethod === "percent" && portion.inputValue !== null ? (
                      <span className="type-meta text-muted-foreground">{portion.inputValue / 100}%</span>
                    ) : null}
                    {record.splitMethod === "shares" && portion.inputValue !== null ? (
                      <span className="type-meta text-muted-foreground">
                        {portion.inputValue / 100} {portion.inputValue === 100 ? "share" : "shares"}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[0.9375rem] font-medium tabular-nums">
                    {formatMoney(portion.amount, record.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {record.notes ? (
        <section aria-labelledby="notes-heading">
          <SectionTitle id="notes-heading" title="Notes" />
          <p className="max-w-2xl text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {record.notes}
          </p>
        </section>
      ) : null}

      <section aria-labelledby="history-heading">
        <SectionTitle id="history-heading" title="History" />
        <ul className="border-t border-border text-sm">
          {changes.length > 0 ? (
            changes.map((row) => (
              <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3">
                <span>
                  <span className="font-medium">{nameOf(row.actorId)}</span>{" "}
                  <span className="text-muted-foreground">
                    {row.type === "expense.created" ? "added this" : "edited this"}
                  </span>
                </span>
                <span className="type-meta text-muted-foreground">
                  <RelativeTime date={row.createdAt} />
                </span>
              </li>
            ))
          ) : (
            <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3">
              <span>
                <span className="font-medium">{nameOf(record.createdBy)}</span>{" "}
                <span className="text-muted-foreground">added this</span>
              </span>
              <span className="type-meta text-muted-foreground">
                <RelativeTime date={record.createdAt} />
              </span>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
