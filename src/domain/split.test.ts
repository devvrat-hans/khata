import { describe, expect, it } from "vitest";
import { allocate, checkPayers, computeSplit, describeSplitError } from "./split";

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

describe("allocate", () => {
  it("splits evenly when it can", () => {
    expect(allocate(900, [1, 1, 1])).toEqual([300, 300, 300]);
  });

  it("hands leftovers to the earliest entries on ties", () => {
    expect(allocate(1000, [1, 1, 1])).toEqual([334, 333, 333]);
    expect(allocate(1001, [1, 1, 1])).toEqual([334, 334, 333]);
  });

  it("uses the largest remainder", () => {
    // 10 in the ratio 1:2:3 is 1.67, 3.33, 5.0
    expect(allocate(10, [1, 2, 3])).toEqual([2, 3, 5]);
  });

  it("always adds up to the total", () => {
    for (let total = 1; total < 500; total += 7) {
      const weights = [3, 7, 11, 1];
      expect(sum(allocate(total, weights))).toBe(total);
    }
  });

  it("handles amounts large enough to overflow float math", () => {
    const total = 99_999_999_999;
    const result = allocate(total, [3333, 3333, 3334]);
    expect(sum(result)).toBe(total);
  });

  it("rejects all-zero weights", () => {
    expect(() => allocate(100, [0, 0])).toThrow();
  });
});

describe("computeSplit", () => {
  it("splits equally", () => {
    const result = computeSplit(1000, "equal", [{ userId: "a" }, { userId: "b" }, { userId: "c" }]);
    expect(result).toEqual({
      ok: true,
      portions: [
        { userId: "a", amount: 334 },
        { userId: "b", amount: 333 },
        { userId: "c", amount: 333 },
      ],
    });
  });

  it("accepts exact amounts that add up", () => {
    const result = computeSplit(1000, "exact", [
      { userId: "a", value: 600 },
      { userId: "b", value: 400 },
    ]);
    expect(result.ok).toBe(true);
  });

  it("reports how far exact amounts are off", () => {
    const result = computeSplit(1000, "exact", [
      { userId: "a", value: 600 },
      { userId: "b", value: 300 },
    ]);
    expect(result).toEqual({ ok: false, error: { code: "exact_mismatch", difference: 100 } });
  });

  it("splits by percent in basis points", () => {
    const result = computeSplit(999, "percent", [
      { userId: "a", value: 5000 },
      { userId: "b", value: 2500 },
      { userId: "c", value: 2500 },
    ]);
    // 499.5, 249.75, 249.75: the two leftover units go to the largest remainders.
    expect(result.ok && result.portions.map((portion) => portion.amount)).toEqual([499, 250, 250]);
  });

  it("requires percentages to add up to 100", () => {
    const result = computeSplit(1000, "percent", [
      { userId: "a", value: 5000 },
      { userId: "b", value: 4000 },
    ]);
    expect(result).toEqual({ ok: false, error: { code: "percent_mismatch", difference: 1000 } });
  });

  it("splits by shares and drops people with no share", () => {
    const result = computeSplit(3000, "shares", [
      { userId: "a", value: 200 },
      { userId: "b", value: 100 },
      { userId: "c", value: 0 },
    ]);
    expect(result).toEqual({
      ok: true,
      portions: [
        { userId: "a", amount: 2000 },
        { userId: "b", amount: 1000 },
      ],
    });
  });

  it("rejects duplicates, empty lists and bad totals", () => {
    expect(computeSplit(100, "equal", [])).toEqual({ ok: false, error: { code: "no_participants" } });
    expect(computeSplit(100, "equal", [{ userId: "a" }, { userId: "a" }])).toEqual({
      ok: false,
      error: { code: "duplicate_participant", userId: "a" },
    });
    expect(computeSplit(0, "equal", [{ userId: "a" }])).toEqual({ ok: false, error: { code: "invalid_total" } });
    expect(computeSplit(10.5, "equal", [{ userId: "a" }])).toEqual({ ok: false, error: { code: "invalid_total" } });
  });

  it("rejects negative and fractional values", () => {
    expect(computeSplit(100, "exact", [{ userId: "a", value: -100 }]).ok).toBe(false);
    expect(computeSplit(100, "shares", [{ userId: "a", value: 1.5 }]).ok).toBe(false);
  });
});

describe("checkPayers", () => {
  it("accepts payers that add up", () => {
    expect(
      checkPayers(1000, [
        { userId: "a", amount: 700 },
        { userId: "b", amount: 300 },
      ]).ok,
    ).toBe(true);
  });

  it("reports a mismatch", () => {
    expect(checkPayers(1000, [{ userId: "a", amount: 900 }])).toEqual({
      ok: false,
      error: { code: "payer_mismatch", difference: 100 },
    });
  });
});

describe("describeSplitError", () => {
  const format = (minor: number) => `Rs ${minor / 100}`;

  it("words mismatches in both directions", () => {
    expect(describeSplitError({ code: "exact_mismatch", difference: 500 }, format)).toContain("short");
    expect(describeSplitError({ code: "exact_mismatch", difference: -500 }, format)).toContain("over");
    expect(describeSplitError({ code: "percent_mismatch", difference: 1000 }, format)).toContain("90%");
  });
});
