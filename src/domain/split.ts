/**
 * Turning "split this equally between four people" into exact amounts.
 *
 * Every function here returns amounts in minor units that add up to the total
 * exactly. Rounding leftovers are handed out one minor unit at a time with the
 * largest remainder method, so nobody pays more than one paisa or cent extra.
 */

export const SPLIT_METHODS = ["equal", "exact", "percent", "shares"] as const;
export type SplitMethod = (typeof SPLIT_METHODS)[number];

/**
 * One participant of a split.
 *
 * `value` depends on the method:
 * - equal: ignored
 * - exact: the amount in minor units
 * - percent: basis points (12.5% is 1250, the values must add up to 10000)
 * - shares: hundredths of a share (1.5 shares is 150)
 */
export interface SplitEntry {
  userId: string;
  value?: number;
}

export interface Portion {
  userId: string;
  amount: number;
}

export type SplitError =
  | { code: "no_participants" }
  | { code: "duplicate_participant"; userId: string }
  | { code: "invalid_total" }
  | { code: "invalid_value"; userId: string }
  | { code: "exact_mismatch"; difference: number }
  | { code: "percent_mismatch"; difference: number }
  | { code: "no_shares" };

export type SplitResult = { ok: true; portions: Portion[] } | { ok: false; error: SplitError };

export const PERCENT_TOTAL = 10_000;

/**
 * Splits `total` in proportion to integer `weights` (largest remainder).
 * Ties for the leftover units go to the earlier entries, so the result is
 * deterministic for a given order.
 */
export function allocate(total: number, weights: readonly number[]): number[] {
  if (!Number.isSafeInteger(total) || total < 0) throw new Error("allocate: total must be a non-negative integer");
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  if (weights.some((weight) => !Number.isSafeInteger(weight) || weight < 0)) {
    throw new Error("allocate: weights must be non-negative integers");
  }
  if (sum === 0) throw new Error("allocate: weights must not all be zero");

  const bigTotal = BigInt(total);
  const bigSum = BigInt(sum);
  const shares = weights.map((weight) => {
    const product = bigTotal * BigInt(weight);
    return { base: product / bigSum, remainder: product % bigSum };
  });

  let leftover = total - shares.reduce((acc, share) => acc + Number(share.base), 0);
  const order = shares
    .map((share, index) => ({ index, remainder: share.remainder }))
    .sort((a, b) => (a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1));

  const result = shares.map((share) => Number(share.base));
  for (const { index } of order) {
    if (leftover === 0) break;
    result[index] = (result[index] ?? 0) + 1;
    leftover -= 1;
  }
  return result;
}

function checkParticipants(entries: readonly SplitEntry[]): SplitError | null {
  if (entries.length === 0) return { code: "no_participants" };
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.userId)) return { code: "duplicate_participant", userId: entry.userId };
    seen.add(entry.userId);
  }
  return null;
}

function valueOf(entry: SplitEntry): number | null {
  const value = entry.value ?? 0;
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

/** Computes each participant's share of `total`. Zero portions are dropped. */
export function computeSplit(total: number, method: SplitMethod, entries: readonly SplitEntry[]): SplitResult {
  if (!Number.isSafeInteger(total) || total <= 0) return { ok: false, error: { code: "invalid_total" } };
  const participantError = checkParticipants(entries);
  if (participantError) return { ok: false, error: participantError };

  let amounts: number[];

  switch (method) {
    case "equal": {
      amounts = allocate(total, entries.map(() => 1));
      break;
    }
    case "exact": {
      const values: number[] = [];
      for (const entry of entries) {
        const value = valueOf(entry);
        if (value === null) return { ok: false, error: { code: "invalid_value", userId: entry.userId } };
        values.push(value);
      }
      const sum = values.reduce((acc, value) => acc + value, 0);
      if (sum !== total) return { ok: false, error: { code: "exact_mismatch", difference: total - sum } };
      amounts = values;
      break;
    }
    case "percent": {
      const values: number[] = [];
      for (const entry of entries) {
        const value = valueOf(entry);
        if (value === null || value > PERCENT_TOTAL) {
          return { ok: false, error: { code: "invalid_value", userId: entry.userId } };
        }
        values.push(value);
      }
      const sum = values.reduce((acc, value) => acc + value, 0);
      if (sum !== PERCENT_TOTAL) {
        return { ok: false, error: { code: "percent_mismatch", difference: PERCENT_TOTAL - sum } };
      }
      amounts = allocate(total, values);
      break;
    }
    case "shares": {
      const values: number[] = [];
      for (const entry of entries) {
        const value = valueOf(entry);
        if (value === null) return { ok: false, error: { code: "invalid_value", userId: entry.userId } };
        values.push(value);
      }
      if (values.every((value) => value === 0)) return { ok: false, error: { code: "no_shares" } };
      amounts = allocate(total, values);
      break;
    }
  }

  const portions = entries
    .map((entry, index) => ({ userId: entry.userId, amount: amounts[index] ?? 0 }))
    .filter((portion) => portion.amount > 0);
  return { ok: true, portions };
}

export type PayerError =
  | { code: "no_payers" }
  | { code: "duplicate_payer"; userId: string }
  | { code: "invalid_value"; userId: string }
  | { code: "payer_mismatch"; difference: number };

export type PayerResult = { ok: true; portions: Portion[] } | { ok: false; error: PayerError };

/** Validates who paid how much. The amounts must add up to the total. */
export function checkPayers(total: number, payers: readonly Portion[]): PayerResult {
  if (payers.length === 0) return { ok: false, error: { code: "no_payers" } };
  const seen = new Set<string>();
  let sum = 0;
  for (const payer of payers) {
    if (seen.has(payer.userId)) return { ok: false, error: { code: "duplicate_payer", userId: payer.userId } };
    seen.add(payer.userId);
    if (!Number.isSafeInteger(payer.amount) || payer.amount < 0) {
      return { ok: false, error: { code: "invalid_value", userId: payer.userId } };
    }
    sum += payer.amount;
  }
  if (sum !== total) return { ok: false, error: { code: "payer_mismatch", difference: total - sum } };
  return { ok: true, portions: payers.filter((payer) => payer.amount > 0) };
}

/** A sentence a person can act on, for every split or payer error. */
export function describeSplitError(error: SplitError | PayerError, format: (minor: number) => string): string {
  switch (error.code) {
    case "no_participants":
      return "Choose at least one person to split with.";
    case "duplicate_participant":
      return "A person appears twice in the split.";
    case "invalid_total":
      return "Enter an amount greater than zero.";
    case "invalid_value":
      return "One of the amounts is not valid. Use positive numbers only.";
    case "exact_mismatch":
      return error.difference > 0
        ? `The amounts are ${format(error.difference)} short of the total.`
        : `The amounts are ${format(-error.difference)} over the total.`;
    case "percent_mismatch": {
      const percent = Math.abs(error.difference) / 100;
      return error.difference > 0
        ? `The percentages add up to ${100 - percent}%. They need to add up to 100%.`
        : `The percentages add up to ${100 + percent}%. They need to add up to 100%.`;
    }
    case "no_shares":
      return "Give at least one person a share.";
    case "no_payers":
      return "Choose who paid.";
    case "duplicate_payer":
      return "A person appears twice in the payers.";
    case "payer_mismatch":
      return error.difference > 0
        ? `The paid amounts are ${format(error.difference)} short of the total.`
        : `The paid amounts are ${format(-error.difference)} over the total.`;
  }
}
