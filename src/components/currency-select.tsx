import { Select } from "@aback-ui/ui";
import type { ComponentProps } from "react";
import { CURRENCIES } from "@/domain/money";

/**
 * A native currency picker: fast, accessible, and searchable by typing the
 * code. `compact` shows codes only, for the narrow spot beside an amount.
 */
export function CurrencySelect({ compact = false, ...props }: ComponentProps<typeof Select> & { compact?: boolean }) {
  return (
    <Select {...props}>
      {CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code} title={currency.name}>
          {compact ? currency.code : `${currency.code}, ${currency.name}`}
        </option>
      ))}
    </Select>
  );
}
