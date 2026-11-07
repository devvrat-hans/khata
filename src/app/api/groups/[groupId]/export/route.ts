import { toDecimalString } from "@/domain/money";
import { getViewer } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { AppError } from "@/server/errors";
import { requireMembership } from "@/server/services/access";
import { listAllMemberIds } from "@/server/services/groups";
import { loadGroupPublicLedger, sortRecords } from "@/server/services/ledger";
import { getPeople } from "@/server/services/users";

/** Quotes a CSV cell and neutralises spreadsheet formulas. */
function cell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * The group's shared expenses and payments as CSV, one row each, with a
 * column per member for their share. Private hisabs are never included.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return new Response("Sign in first.", { status: 401 });
  const { groupId } = await params;
  const db = getDb();

  try {
    const { group } = await requireMembership(db, groupId, viewer.id);
    const [ledger, memberIds] = await Promise.all([loadGroupPublicLedger(db, groupId), listAllMemberIds(db, groupId)]);
    const people = await getPeople(db, memberIds);
    const members = memberIds.map((id) => ({ id, name: people.get(id)?.name ?? "Unknown" }));

    const header = ["Date", "Type", "Description", "Category", "Currency", "Amount", "Paid by", ...members.map((m) => `Share: ${m.name}`)];
    const lines = [header.map(cell).join(",")];

    for (const record of sortRecords([...ledger.expenses, ...ledger.settlements]).reverse()) {
      if (record.kind === "expense") {
        const paidBy = record.payers
          .map((payer) => `${people.get(payer.userId)?.name ?? "Unknown"} ${toDecimalString(payer.amount, record.currency)}`)
          .join("; ");
        const shares = members.map((member) => {
          const share = record.shares.find((portion) => portion.userId === member.id)?.amount ?? 0;
          return toDecimalString(share, record.currency);
        });
        lines.push(
          [record.date, "Expense", record.description, record.category, record.currency, toDecimalString(record.amount, record.currency), paidBy, ...shares]
            .map(cell)
            .join(","),
        );
      } else {
        const from = people.get(record.fromUserId)?.name ?? "Unknown";
        const to = people.get(record.toUserId)?.name ?? "Unknown";
        lines.push(
          [record.date, "Payment", `${from} paid ${to}`, record.method, record.currency, toDecimalString(record.amount, record.currency), from, ...members.map(() => "")]
            .map(cell)
            .join(","),
        );
      }
    }

    const filename = `${group.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "group"}-khata.csv`;
    return new Response(`﻿${lines.join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof AppError && error.code === "not_found") return new Response("Not found.", { status: 404 });
    throw error;
  }
}
