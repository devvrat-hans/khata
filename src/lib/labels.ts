import type { CATEGORY_VALUES, GROUP_KIND_VALUES, PAYMENT_METHOD_VALUES } from "./validation";

export type CategoryValue = (typeof CATEGORY_VALUES)[number];
export type GroupKindValue = (typeof GROUP_KIND_VALUES)[number];
export type PaymentMethodValue = (typeof PAYMENT_METHOD_VALUES)[number];

export const CATEGORY_LABELS: Record<CategoryValue, string> = {
  general: "General",
  food: "Food and drinks",
  groceries: "Groceries",
  transport: "Transport",
  travel: "Travel",
  stay: "Stay",
  rent: "Rent",
  utilities: "Bills and utilities",
  shopping: "Shopping",
  entertainment: "Entertainment",
  health: "Health",
  gifts: "Gifts",
  other: "Other",
};

export const GROUP_KIND_LABELS: Record<GroupKindValue, string> = {
  trip: "Trip",
  home: "Home",
  couple: "Couple",
  friends: "Friends",
  work: "Work",
  other: "Other",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  cash: "Cash",
  upi: "UPI",
  bank: "Bank transfer",
  card: "Card",
  other: "Other",
};

export const SPLIT_METHOD_LABELS = {
  equal: "Equally",
  exact: "Exact amounts",
  percent: "Percentages",
  shares: "Shares",
} as const;
