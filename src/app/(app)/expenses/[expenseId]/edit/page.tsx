import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpenseForm, type ExpenseFormContext } from "@/components/expenses/expense-form";
import { editExpenseValues } from "@/components/expenses/initial-values";
import { PageTitle } from "@/components/page-title";
import { requireOnboardedViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { getGroupFormContext } from "@/server/queries";
import { getExpenseForViewer } from "@/server/services/expenses";
import { getPeople } from "@/server/services/users";

export const metadata: Metadata = { title: "Edit expense" };

export default async function EditExpensePage({ params }: { params: Promise<{ expenseId: string }> }) {
  const { expenseId } = await params;
  const viewer = await requireOnboardedViewer();
  const db = getDb();
  const record = await getExpenseForViewer(db, viewer.id, expenseId).catch((error: unknown) => {
    if (error instanceof AppError && error.code === "not_found") notFound();
    throw error;
  });
  const me = { id: viewer.id, name: viewer.name, image: viewer.image };

  let context: ExpenseFormContext;
  if (record.groupId) {
    const { members } = await getGroupFormContext(db, viewer.id, record.groupId).catch((error: unknown) => {
      if (error instanceof AppError && error.code === "not_found") notFound();
      throw error;
    });
    // Keep people who have left the group but are on this expense.
    const memberIds = new Set(members.map((member) => member.id));
    const missing = [...record.payers, ...record.shares].map((portion) => portion.userId).filter((id) => !memberIds.has(id));
    const extra = missing.length > 0 ? [...(await getPeople(db, missing)).values()] : [];
    context = {
      kind: "group",
      groupId: record.groupId,
      groupName: "",
      members: [...members, ...extra].map(({ id, name, image }) => ({ id, name, image })),
    };
  } else {
    const otherId = record.pairA === viewer.id ? record.pairB : record.pairA;
    const other = otherId ? (await getPeople(db, [otherId])).get(otherId) : undefined;
    if (!other) notFound();
    context = { kind: "person", person: { id: other.id, name: other.name, image: other.image } };
  }

  return (
    <div className="flex flex-col gap-12 md:gap-14">
      <PageTitle
        eyebrow={
          <Link href={`/expenses/${record.id}`} className="link-inline">
            {record.description}
          </Link>
        }
        title="Edit expense"
      />
      <div>
        <ExpenseForm
          viewer={me}
          context={context}
          initial={editExpenseValues(record, viewer.id)}
          expenseId={record.id}
          cancelHref={`/expenses/${record.id}`}
        />
      </div>
    </div>
  );
}
