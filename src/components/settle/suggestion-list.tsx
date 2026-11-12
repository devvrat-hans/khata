import { Button } from "@aback-ui/ui";
import { IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { formatMoney } from "@/domain/money";
import type { PeopleIndex } from "@/server/queries";
import type { SettleSuggestion } from "@/server/settle-suggestions";
import { PersonAvatar } from "../person-avatar";

export function SuggestionList({ suggestions, people }: { suggestions: SettleSuggestion[]; people: PeopleIndex }) {
  return (
    <ul className="border-t border-border">
      {suggestions.map((suggestion) => {
        const person = people[suggestion.personId];
        const name = person?.name ?? "Someone";
        const owesYou = suggestion.amount > 0;
        const where =
          suggestion.source === "direct"
            ? "One to one"
            : suggestion.source === "private"
              ? `Private in ${suggestion.groupName ?? "a group"}`
              : (suggestion.groupName ?? "A group");
        return (
          <li key={suggestion.key} className="flex min-h-[4.5rem] items-center gap-4 border-b border-border py-4">
            {person ? <PersonAvatar person={person} /> : null}
            <span className="min-w-0 flex-1">
              <span className="block text-[0.9375rem]">
                {owesYou ? (
                  <>
                    <span className="font-medium">{name}</span> owes you{" "}
                    <span className="font-medium tabular-nums text-success">
                      {formatMoney(suggestion.amount, suggestion.currency)}
                    </span>
                  </>
                ) : (
                  <>
                    You owe <span className="font-medium">{name}</span>{" "}
                    <span className="font-medium tabular-nums text-danger">
                      {formatMoney(suggestion.amount, suggestion.currency)}
                    </span>
                  </>
                )}
              </span>
              <span
                className={
                  suggestion.source === "private"
                    ? "type-meta mt-1 flex items-center gap-1 text-primary-700 dark:text-primary-400"
                    : "type-meta mt-1 flex items-center gap-1 text-muted-foreground"
                }
              >
                {suggestion.source === "private" ? <IconLock aria-hidden="true" className="size-3" /> : null}
                {where}
              </span>
            </span>
            <Button asChild size="sm" variant={owesYou ? "outline" : "brand"}>
              <Link href={suggestion.href}>{owesYou ? "Record" : "Settle"}</Link>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
