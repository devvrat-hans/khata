import { RelativeTime } from "@aback-ui/ui";
import {
  IconArrowsExchange,
  IconCash,
  IconLock,
  IconPencil,
  IconReceipt,
  IconTrash,
  IconUserMinus,
  IconUserPlus,
  IconUsersGroup,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatMoney } from "@/domain/money";
import type { FeedItem, PeopleIndex } from "@/server/queries";

function nameOf(people: PeopleIndex, id: string | null | undefined, viewerId: string, capital = false): string {
  if (!id) return "someone";
  if (id === viewerId) return capital ? "You" : "you";
  return people[id]?.name ?? "someone";
}

function money(data: Record<string, unknown> | null, key = "amount"): string {
  const amount = data?.[key];
  const currency = data?.currency;
  if (typeof amount !== "number" || typeof currency !== "string") return "";
  try {
    return formatMoney(amount, currency);
  } catch {
    return "";
  }
}

function text(data: Record<string, unknown> | null, key: string): string {
  const value = data?.[key];
  return typeof value === "string" ? value : "";
}

interface Described {
  icon: typeof IconReceipt;
  body: ReactNode;
  href: string | null;
}

/** Turns one feed row into a sentence, from the viewer's point of view. */
function describe(item: FeedItem, people: PeopleIndex, viewerId: string): Described {
  const { activity, groupName } = item;
  const actor = <strong className="font-medium">{nameOf(people, activity.actorId, viewerId, true)}</strong>;
  const target = <strong className="font-medium">{nameOf(people, activity.targetUserId, viewerId)}</strong>;
  const otherId = activity.pairA === viewerId ? activity.pairB : activity.pairA;
  const group = groupName ? <span className="font-medium">{groupName}</span> : <span>a group</span>;
  const where =
    activity.visibility === "pair" ? (
      activity.groupId ? (
        <>
          your private hisab with {nameOf(people, otherId, viewerId)} in {group}
        </>
      ) : (
        <>your hisab with {nameOf(people, otherId, viewerId)}</>
      )
    ) : (
      group
    );
  const placeHref =
    activity.visibility === "pair" && !activity.groupId
      ? otherId
        ? `/people/${otherId}`
        : null
      : activity.groupId
        ? `/groups/${activity.groupId}`
        : null;
  const data = activity.data;
  const description = text(data, "description");

  switch (activity.type) {
    case "group.created":
      return { icon: IconUsersGroup, body: <>{actor} created {group}</>, href: placeHref };
    case "group.updated":
      return { icon: IconPencil, body: <>{actor} changed the settings of {group}</>, href: placeHref };
    case "member.added":
      return { icon: IconUserPlus, body: <>{actor} added {target} to {group}</>, href: placeHref };
    case "member.joined":
      return { icon: IconUserPlus, body: <>{actor} joined {group} with the invite link</>, href: placeHref };
    case "member.left":
      return { icon: IconUserMinus, body: <>{actor} left {group}</>, href: placeHref };
    case "member.removed":
      return { icon: IconUserMinus, body: <>{actor} removed {target} from {group}</>, href: placeHref };
    case "friend.added":
      return { icon: IconUserPlus, body: <>{actor} started a hisab with {target}</>, href: placeHref };
    case "expense.created":
      return {
        icon: IconReceipt,
        body: (
          <>
            {actor} added <span className="font-medium">“{description}”</span> for {money(data)} in {where}
          </>
        ),
        href: activity.expenseId ? `/expenses/${activity.expenseId}` : placeHref,
      };
    case "expense.updated":
      return {
        icon: IconPencil,
        body: (
          <>
            {actor} updated <span className="font-medium">“{description}”</span> in {where}
          </>
        ),
        href: activity.expenseId ? `/expenses/${activity.expenseId}` : placeHref,
      };
    case "expense.deleted":
      return {
        icon: IconTrash,
        body: (
          <>
            {actor} deleted <span className="font-medium">“{description}”</span> ({money(data)}) from {where}
          </>
        ),
        href: placeHref,
      };
    case "settlement.created":
      return {
        icon: IconCash,
        body:
          text(data, "fromUserId") === activity.actorId ? (
            <>
              {actor} paid {nameOf(people, text(data, "toUserId"), viewerId)} {money(data)} in {where}
            </>
          ) : (
            <>
              {actor} recorded that {nameOf(people, text(data, "fromUserId"), viewerId)} paid{" "}
              {nameOf(people, text(data, "toUserId"), viewerId)} {money(data)} in {where}
            </>
          ),
        href: placeHref,
      };
    case "settlement.deleted":
      return {
        icon: IconArrowsExchange,
        body: (
          <>
            {actor} deleted a payment of {money(data)} from {nameOf(people, text(data, "fromUserId"), viewerId)} to{" "}
            {nameOf(people, text(data, "toUserId"), viewerId)} in {where}
          </>
        ),
        href: placeHref,
      };
  }
}

export function ActivityList({
  items,
  people,
  viewerId,
}: {
  items: FeedItem[];
  people: PeopleIndex;
  viewerId: string;
}) {
  return (
    <ul className="border-t border-border">
      {items.map((item) => {
        const { icon: Icon, body, href } = describe(item, people, viewerId);
        const isPrivate = item.activity.visibility === "pair" && item.activity.groupId !== null;
        const content = (
          <>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center border border-border text-muted-foreground">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.9375rem] leading-relaxed text-foreground">{body}</span>
              <span className="mt-1 flex items-center gap-3 text-muted-foreground">
                <span className="type-meta">
                  <RelativeTime date={item.activity.createdAt} />
                </span>
                {isPrivate ? (
                  <span className="type-meta inline-flex items-center gap-1 text-primary-700 dark:text-primary-400">
                    <IconLock aria-hidden="true" className="size-3" />
                    Private
                  </span>
                ) : null}
              </span>
            </span>
          </>
        );
        return (
          <li key={item.activity.id} className="border-b border-border">
            {href ? (
              <Link href={href} className="row-link -mx-3 flex items-start gap-4 px-3 py-4">
                {content}
              </Link>
            ) : (
              <div className="-mx-3 flex items-start gap-4 px-3 py-4">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
