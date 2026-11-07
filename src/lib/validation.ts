/**
 * Input shapes shared by the forms and the server. The server always parses
 * again: anything that arrives from a browser is untrusted.
 *
 * Amounts travel as the strings people typed ("1,250.50") and are converted to
 * minor units on the server with the currency's rules.
 */

import { z } from "zod";
import { isSupportedCurrency } from "@/domain/money";
import { SPLIT_METHODS } from "@/domain/split";

export const GROUP_KIND_VALUES = ["trip", "home", "couple", "friends", "work", "other"] as const;
export const CATEGORY_VALUES = [
  "general",
  "food",
  "groceries",
  "transport",
  "travel",
  "stay",
  "rent",
  "utilities",
  "shopping",
  "entertainment",
  "health",
  "gifts",
  "other",
] as const;
export const PAYMENT_METHOD_VALUES = ["cash", "upi", "bank", "card", "other"] as const;

const id = z.string().trim().min(1).max(64);

export const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine(isSupportedCurrency, { message: "Choose a currency from the list." });

/** A calendar date, "2026-11-07", that exists and is not far in the future. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Use a valid date." })
  .refine(
    (value) => {
      const date = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
      const year = date.getUTCFullYear();
      const limit = Date.now() + 366 * 24 * 60 * 60 * 1000;
      return year >= 2000 && date.getTime() <= limit;
    },
    { message: "Use a valid date." },
  );

export const personInputSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: "Enter a valid email address." }).max(254),
  name: z.string().trim().max(60).optional(),
});

export const groupInputSchema = z.object({
  name: z.string().trim().min(1, { message: "Give the group a name." }).max(60),
  kind: z.enum(GROUP_KIND_VALUES),
  currency: currencySchema,
  members: z.array(personInputSchema).max(30, { message: "Add at most 30 people at a time." }).default([]),
});
export type GroupInput = z.input<typeof groupInputSchema>;

export const groupSettingsSchema = z.object({
  name: z.string().trim().min(1, { message: "Give the group a name." }).max(60),
  kind: z.enum(GROUP_KIND_VALUES),
  currency: currencySchema,
  simplifyDebts: z.boolean(),
});
export type GroupSettingsInput = z.input<typeof groupSettingsSchema>;

export const expenseInputSchema = z.object({
  /** The group, or null for a one to one hisab. */
  groupId: id.nullable(),
  /** The other person, for one to one and private expenses. */
  personId: id.nullable(),
  /** In a group: keep it between the viewer and `personId` only. */
  isPrivate: z.boolean(),
  description: z.string().trim().min(1, { message: "Add a short description." }).max(100),
  amount: z.string().trim().min(1, { message: "Enter the amount." }).max(24),
  currency: currencySchema,
  date: isoDateSchema,
  category: z.enum(CATEGORY_VALUES),
  notes: z.string().trim().max(500).default(""),
  payers: z
    .array(z.object({ userId: id, amount: z.string().trim().max(24).optional() }))
    .min(1, { message: "Choose who paid." })
    .max(50),
  splitMethod: z.enum(SPLIT_METHODS),
  participants: z
    .array(z.object({ userId: id, value: z.string().trim().max(24).optional() }))
    .min(1, { message: "Choose who it was for." })
    .max(50),
});
export type ExpenseInput = z.input<typeof expenseInputSchema>;

export const settlementInputSchema = z.object({
  groupId: id.nullable(),
  isPrivate: z.boolean(),
  fromUserId: id,
  toUserId: id,
  amount: z.string().trim().min(1, { message: "Enter the amount." }).max(24),
  currency: currencySchema,
  date: isoDateSchema,
  method: z.enum(PAYMENT_METHOD_VALUES),
  note: z.string().trim().max(200).default(""),
});
export type SettlementInput = z.input<typeof settlementInputSchema>;

/** A UPI virtual payment address, "name@bank". */
export const upiIdSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{2,256}@[a-z][a-z0-9]{1,63}$/, { message: "Enter a UPI ID like name@bank." });

export const profileInputSchema = z.object({
  name: z.string().trim().min(1, { message: "Enter your name." }).max(60),
  defaultCurrency: currencySchema,
  upiId: z.union([z.literal(""), upiIdSchema]).default(""),
  emailNotifications: z.boolean(),
});
export type ProfileInput = z.input<typeof profileInputSchema>;

/** The first message of a validation failure, for showing next to a form. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Some of the details are not valid.";
}
