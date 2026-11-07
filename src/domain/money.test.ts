import { describe, expect, it } from "vitest";
import { addTo, formatMoney, formatMoneyList, isZero, parseAmount, toDecimalString } from "./money";

describe("parseAmount", () => {
  it("parses plain and formatted numbers", () => {
    expect(parseAmount("12", "INR")).toBe(1200);
    expect(parseAmount("12.5", "INR")).toBe(1250);
    expect(parseAmount("1,250.05", "INR")).toBe(125005);
    expect(parseAmount(" .75 ", "USD")).toBe(75);
    expect(parseAmount("1500", "JPY")).toBe(1500);
    expect(parseAmount("1.234", "KWD")).toBe(1234);
  });

  it("rejects anything that is not a plain amount", () => {
    expect(parseAmount("", "INR")).toBeNull();
    expect(parseAmount(".", "INR")).toBeNull();
    expect(parseAmount("-5", "INR")).toBeNull();
    expect(parseAmount("1e3", "INR")).toBeNull();
    expect(parseAmount("12.345", "INR")).toBeNull();
    expect(parseAmount("1.5", "JPY")).toBeNull();
    expect(parseAmount("abc", "INR")).toBeNull();
    expect(parseAmount("99999999999", "INR")).toBeNull();
  });
});

describe("toDecimalString", () => {
  it("round trips with parseAmount", () => {
    for (const value of [0, 1, 99, 100, 125005]) {
      expect(parseAmount(toDecimalString(value, "INR"), "INR")).toBe(value);
    }
    expect(toDecimalString(1500, "JPY")).toBe("1500");
    expect(toDecimalString(5, "INR")).toBe("0.05");
  });
});

describe("formatMoney", () => {
  it("formats with the currency symbol and absolute value", () => {
    expect(formatMoney(125050, "INR")).toBe("₹1,250.50");
    expect(formatMoney(-125050, "INR")).toBe("₹1,250.50");
    expect(formatMoney(1500, "JPY", "en-US")).toBe("¥1,500");
  });

  it("joins several currencies, largest first", () => {
    expect(formatMoneyList({ USD: 500, INR: 10000 }, "en-US")).toBe("₹100.00 + $5.00");
  });
});

describe("addTo and isZero", () => {
  it("drops currencies that come back to zero", () => {
    const money: Record<string, number> = {};
    addTo(money, "INR", 500);
    addTo(money, "INR", -500);
    expect(money).toEqual({});
    expect(isZero(money)).toBe(true);
  });
});
