import { IconChevronRight, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import type { MoneyByCurrency } from "@/domain/money";
import type { GroupKindValue } from "@/lib/labels";
import type { PersonSummary } from "@/server/services/users";
import { GROUP_KIND_ICONS, IconChip } from "./icons";
import { BalanceBadge } from "./money";
import { PersonAvatar } from "./person-avatar";

const rowClass =
  "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none";

export interface PersonRow {
  person: PersonSummary;
  balance: MoneyByCurrency;
  hasPrivate?: boolean;
}

/** People with their balance, as a bordered list of links. */
export function PeopleList({ rows, hrefFor }: { rows: PersonRow[]; hrefFor?: (id: string) => string }) {
  return (
    <ul className="divide-y divide-border border border-border bg-card">
      {rows.map(({ person, balance, hasPrivate }) => (
        <li key={person.id}>
          <Link href={hrefFor ? hrefFor(person.id) : `/people/${person.id}`} className={rowClass}>
            <PersonAvatar person={person} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                {person.name}
                {hasPrivate ? (
                  <IconLock aria-label="Has a private hisab" className="size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {person.joined ? person.email : "Invited, has not signed in yet"}
              </span>
            </span>
            <BalanceBadge balance={balance} />
            <IconChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
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

/** Groups with the viewer's balance in each. */
export function GroupList({ rows, hrefFor }: { rows: GroupRow[]; hrefFor?: (id: string) => string }) {
  return (
    <ul className="divide-y divide-border border border-border bg-card">
      {rows.map((row) => (
        <li key={row.id}>
          <Link href={hrefFor ? hrefFor(row.id) : `/groups/${row.id}`} className={rowClass}>
            <IconChip icon={GROUP_KIND_ICONS[row.kind]} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{row.name}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {row.memberCount} {row.memberCount === 1 ? "person" : "people"}
                {row.hasPrivate ? (
                  <span className="inline-flex items-center gap-1">
                    <IconLock aria-hidden="true" className="size-3" />
                    private hisab
                  </span>
                ) : null}
              </span>
            </span>
            <BalanceBadge balance={row.balance} owedLabel="you are owed" />
            <IconChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
