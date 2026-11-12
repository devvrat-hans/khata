import { IconLock } from "@tabler/icons-react";
import Link from "next/link";
import type { MoneyByCurrency } from "@/domain/money";
import { GROUP_KIND_LABELS, type GroupKindValue } from "@/lib/labels";
import type { PersonSummary } from "@/server/services/users";
import { GROUP_KIND_ICONS } from "./icons";
import { BalanceBadge } from "./money";
import { PersonAvatar } from "./person-avatar";

const rowClass = "row-link -mx-3 flex min-h-[4.5rem] items-center gap-4 px-3 py-4";

export interface PersonRow {
  person: PersonSummary;
  balance: MoneyByCurrency;
  hasPrivate?: boolean;
}

/** People with their balance, as ruled rows. */
export function PeopleList({ rows, hrefFor }: { rows: PersonRow[]; hrefFor?: (id: string) => string }) {
  return (
    <ul className="border-t border-border">
      {rows.map(({ person, balance, hasPrivate }) => (
        <li key={person.id} className="border-b border-border">
          <Link href={hrefFor ? hrefFor(person.id) : `/people/${person.id}`} className={rowClass}>
            <PersonAvatar person={person} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-base font-medium tracking-[-0.01em] text-foreground">
                <span className="truncate">{person.name}</span>
                {hasPrivate ? (
                  <IconLock
                    aria-label="Has a private hisab"
                    className="size-3.5 shrink-0 text-primary-700 dark:text-primary-400"
                  />
                ) : null}
              </span>
              <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                {person.joined ? person.email : "Invited, has not signed in yet"}
              </span>
            </span>
            <BalanceBadge balance={balance} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export interface GroupRow {
  id: string;
  name: string;
  kind: GroupKindValue;
  memberCount: number;
  balance: MoneyByCurrency;
  hasPrivate: boolean;
}

/** Groups with the viewer's balance in each, as ruled rows. */
export function GroupList({ rows, hrefFor }: { rows: GroupRow[]; hrefFor?: (id: string) => string }) {
  return (
    <ul className="border-t border-border">
      {rows.map((row) => {
        const Icon = GROUP_KIND_ICONS[row.kind];
        return (
          <li key={row.id} className="border-b border-border">
            <Link href={hrefFor ? hrefFor(row.id) : `/groups/${row.id}`} className={rowClass}>
              <span className="flex size-10 shrink-0 items-center justify-center border border-border text-muted-foreground">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium tracking-[-0.01em] text-foreground">
                  {row.name}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 text-muted-foreground">
                  <span className="type-meta">
                    {GROUP_KIND_LABELS[row.kind]} · {row.memberCount} {row.memberCount === 1 ? "person" : "people"}
                  </span>
                  {row.hasPrivate ? (
                    <span className="type-meta inline-flex items-center gap-1 text-primary-700 dark:text-primary-400">
                      <IconLock aria-hidden="true" className="size-3" />
                      Private
                    </span>
                  ) : null}
                </span>
              </span>
              <BalanceBadge balance={row.balance} owedLabel="you are owed" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
