import { Select } from "@aback-ui/ui";
import type { ComponentProps } from "react";
import { CURRENCIES } from "@/domain/money";

/** A native currency picker: fast, accessible, and searchable by typing the code. */
export function CurrencySelect(props: ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      {CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.code}, {currency.name}
        </option>
      ))}
    </Select>
  );
}
