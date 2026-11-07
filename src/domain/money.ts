/**
 * Money is stored and computed as integers in the currency's minor unit
 * (paise, cents, yen). Nothing in Khata adds or splits floating point amounts.
 */

export interface Currency {
  code: string;
  name: string;
  /** Digits after the decimal point in the minor unit. */
  decimals: number;
}

/**
 * Currencies offered in the pickers. The list favours South Asia, the Gulf and
 * the usual travel currencies. Adding one is a one-line change.
 */
export const CURRENCIES: readonly Currency[] = [
  { code: "INR", name: "Indian Rupee", decimals: 2 },
  { code: "USD", name: "US Dollar", decimals: 2 },
  { code: "EUR", name: "Euro", decimals: 2 },
  { code: "GBP", name: "British Pound", decimals: 2 },
  { code: "AED", name: "UAE Dirham", decimals: 2 },
  { code: "SAR", name: "Saudi Riyal", decimals: 2 },
  { code: "QAR", name: "Qatari Riyal", decimals: 2 },
  { code: "KWD", name: "Kuwaiti Dinar", decimals: 3 },
  { code: "BHD", name: "Bahraini Dinar", decimals: 3 },
  { code: "OMR", name: "Omani Rial", decimals: 3 },
  { code: "PKR", name: "Pakistani Rupee", decimals: 2 },
  { code: "BDT", name: "Bangladeshi Taka", decimals: 2 },
  { code: "NPR", name: "Nepalese Rupee", decimals: 2 },
  { code: "LKR", name: "Sri Lankan Rupee", decimals: 2 },
  { code: "SGD", name: "Singapore Dollar", decimals: 2 },
  { code: "MYR", name: "Malaysian Ringgit", decimals: 2 },
  { code: "THB", name: "Thai Baht", decimals: 2 },
  { code: "IDR", name: "Indonesian Rupiah", decimals: 2 },
  { code: "VND", name: "Vietnamese Dong", decimals: 0 },
  { code: "PHP", name: "Philippine Peso", decimals: 2 },
  { code: "JPY", name: "Japanese Yen", decimals: 0 },
  { code: "KRW", name: "South Korean Won", decimals: 0 },
  { code: "CNY", name: "Chinese Yuan", decimals: 2 },
  { code: "HKD", name: "Hong Kong Dollar", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", decimals: 2 },
  { code: "NZD", name: "New Zealand Dollar", decimals: 2 },
  { code: "CAD", name: "Canadian Dollar", decimals: 2 },
  { code: "CHF", name: "Swiss Franc", decimals: 2 },
  { code: "SEK", name: "Swedish Krona", decimals: 2 },
  { code: "NOK", name: "Norwegian Krone", decimals: 2 },
  { code: "DKK", name: "Danish Krone", decimals: 2 },
  { code: "TRY", name: "Turkish Lira", decimals: 2 },
  { code: "ZAR", name: "South African Rand", decimals: 2 },
  { code: "KES", name: "Kenyan Shilling", decimals: 2 },
  { code: "NGN", name: "Nigerian Naira", decimals: 2 },
  { code: "EGP", name: "Egyptian Pound", decimals: 2 },
  { code: "BRL", name: "Brazilian Real", decimals: 2 },
  { code: "MXN", name: "Mexican Peso", decimals: 2 },
];

const BY_CODE = new Map(CURRENCIES.map((currency) => [currency.code, currency]));

export const DEFAULT_CURRENCY = "INR";

/** The largest amount one expense or payment can carry, in minor units. */
export const MAX_AMOUNT_MINOR = 100_000_000_000;

export function isSupportedCurrency(code: string): boolean {
  return BY_CODE.has(code);
}

export function getCurrency(code: string): Currency {
  const currency = BY_CODE.get(code);
  if (!currency) throw new Error(`Unsupported currency: ${code}`);
  return currency;
}

export function currencyDecimals(code: string): number {
  return getCurrency(code).decimals;
}

/**
 * Parses what a person typed ("1,250.5", "  80 ", "0.75") into minor units.
 * Returns null for anything that is not a plain non-negative decimal number
 * with at most the currency's number of decimals.
 */
export function parseAmount(input: string, currencyCode: string): number | null {
  return parseDecimal(input, currencyDecimals(currencyCode), MAX_AMOUNT_MINOR);
}

/**
 * Parses a plain non-negative decimal into an integer scaled by 10^decimals:
 * "12.5" with 2 decimals is 1250. Used for amounts, percentages (basis points)
 * and shares (hundredths). Returns null when the input is not such a number
 * or is larger than `max`.
 */
export function parseDecimal(input: string, decimals: number, max = Number.MAX_SAFE_INTEGER): number | null {
  const cleaned = input.trim().replace(/[,\s_]/g, "");
  if (cleaned === "") return null;
  const match = /^(\d*)(?:\.(\d*))?$/.exec(cleaned);
  if (!match) return null;
  const whole = match[1] ?? "";
  const fraction = match[2] ?? "";
  if (whole === "" && fraction === "") return null;
  if (fraction.length > decimals) return null;
  if (whole.length > 15) return null;
  const scaled = Number(whole || "0") * 10 ** decimals + Number(fraction.padEnd(decimals, "0") || "0");
  if (!Number.isSafeInteger(scaled) || scaled > max) return null;
  return scaled;
}

/** Basis points or hundredths back to "12.5" for an input field. */
export function formatDecimal(scaled: number, decimals: number): string {
  const factor = 10 ** decimals;
  const whole = Math.floor(scaled / factor);
  const fraction = String(scaled % factor)
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

/** Minor units back to a plain decimal string for an input field ("1250.50"). */
export function toDecimalString(minor: number, currencyCode: string): string {
  const decimals = currencyDecimals(currencyCode);
  const negative = minor < 0;
  const abs = Math.abs(minor);
  if (decimals === 0) return `${negative ? "-" : ""}${abs}`;
  const factor = 10 ** decimals;
  const whole = Math.floor(abs / factor);
  const fraction = String(abs % factor).padStart(decimals, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currencyCode: string, locale: string): Intl.NumberFormat {
  const key = `${locale}:${currencyCode}`;
  let cached = formatters.get(key);
  if (!cached) {
    const decimals = currencyDecimals(currencyCode);
    cached = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(key, cached);
  }
  return cached;
}

/** "₹1,250.50". Uses the absolute value; callers word the direction. */
export function formatMoney(minor: number, currencyCode: string, locale = "en-IN"): string {
  const decimals = currencyDecimals(currencyCode);
  return formatter(currencyCode, locale).format(Math.abs(minor) / 10 ** decimals);
}

/** A map of currency code to amount, the shape every balance takes. */
export type MoneyByCurrency = Record<string, number>;

export function addTo(target: MoneyByCurrency, currency: string, amount: number): void {
  const next = (target[currency] ?? 0) + amount;
  if (next === 0) delete target[currency];
  else target[currency] = next;
}

export function isZero(money: MoneyByCurrency): boolean {
  return Object.values(money).every((value) => value === 0);
}

/** Formats several currencies as "₹500 + $12.00", largest first. */
export function formatMoneyList(money: MoneyByCurrency, locale = "en-IN"): string {
  const entries = Object.entries(money).filter(([, value]) => value !== 0);
  if (entries.length === 0) return formatMoney(0, DEFAULT_CURRENCY, locale);
  return entries
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([currency, value]) => formatMoney(value, currency, locale))
    .join(" + ");
}
