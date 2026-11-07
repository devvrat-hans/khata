import { formatDecimal, toDecimalString } from "@/domain/money";
import type { ExpenseRecord } from "@/server/services/ledger";
import type { ExpenseFormValues } from "./expense-form";

/** A blank form for a new expense. */
export function newExpenseValues(input: {
  viewerId: string;
  peopleIds: string[];
  currency: string;
  date: string;
  privateWith?: string | null;
}): ExpenseFormValues {
  const isPrivate = Boolean(input.privateWith);
  return {
    description: "",
    amount: "",
    currency: input.currency,
    date: input.date,
    category: "general",
    notes: "",
    isPrivate,
    privateWith: input.privateWith ?? null,
    payerMode: "single",
    payer: input.viewerId,
    payerAmounts: {},
    splitMethod: "equal",
    included: isPrivate ? [input.viewerId, input.privateWith ?? ""] : input.peopleIds,
    values: {},
  };
}

/** The form as the expense was saved, for editing. */
export function editExpenseValues(record: ExpenseRecord, viewerId: string): ExpenseFormValues {
  const otherInPair = record.pairA === viewerId ? record.pairB : record.pairA;
  const values: Record<string, string> = {};
  for (const share of record.shares) {
    if (record.splitMethod === "exact") values[share.userId] = toDecimalString(share.amount, record.currency);
    if ((record.splitMethod === "percent" || record.splitMethod === "shares") && share.inputValue !== null) {
      values[share.userId] = formatDecimal(share.inputValue, 2);
    }
  }
  const payerAmounts: Record<string, string> = {};
  for (const payer of record.payers) payerAmounts[payer.userId] = toDecimalString(payer.amount, record.currency);

  return {
    description: record.description,
    amount: toDecimalString(record.amount, record.currency),
    currency: record.currency,
    date: record.date,
    category: record.category,
    notes: record.notes ?? "",
    isPrivate: record.visibility === "pair" && record.groupId !== null,
    privateWith: record.visibility === "pair" && record.groupId !== null ? otherInPair : null,
    payerMode: record.payers.length > 1 ? "multiple" : "single",
    payer: record.payers[0]?.userId ?? viewerId,
    payerAmounts,
    splitMethod: record.splitMethod,
    included: record.shares.map((share) => share.userId),
    values,
  };
}
