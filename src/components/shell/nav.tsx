"use client";

import { cn } from "@aback-ui/ui";
import { IconHistory, IconLayoutDashboard, IconPlus, IconSettings, IconUser, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, NAV_ITEMS, type NavItem } from "./nav-items";

const ICONS: Record<NavItem["icon"], typeof IconUser> = {
  home: IconLayoutDashboard,
  groups: IconUsersGroup,
  people: IconUser,
  activity: IconHistory,
  settings: IconSettings,
};

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Settings lives in the account menu; the bars carry the four sections. */
const SECTIONS = NAV_ITEMS.filter((item) => item.icon !== "settings");

/** The header links, from md up. The active one is underlined in brand blue. */
export function TopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden h-full items-stretch gap-7 md:flex">
      {SECTIONS.map((item) => {
        const active = isActivePath(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex items-center border-b-2 text-sm transition-colors duration-200",
              focusRing,
              active
                ? "border-primary-700 font-medium text-foreground dark:border-primary-400"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** The bottom tab bar on phones, with the add button in the middle. */
export function BottomNav() {
  const pathname = usePathname();
  const left = SECTIONS.slice(0, 2);
  const right = SECTIONS.slice(2);

  const tab = (item: NavItem) => {
    const Icon = ICONS[item.icon];
    const active = isActivePath(item.href, pathname);
    return (
      <li key={item.href} className="flex-1">
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-[0.01em] transition-colors duration-200",
            focusRing,
            active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-4 top-0 h-0.5 transition-colors duration-200",
              active ? "bg-primary-700 dark:bg-primary-400" : "bg-transparent",
            )}
          />
          <Icon aria-hidden="true" className="size-[1.375rem]" stroke={active ? 2 : 1.6} />
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
    >
      <ul className="flex items-stretch">
        {left.map(tab)}
        <li className="flex flex-1 items-center justify-center">
          <Link
            href="/expenses/new"
            aria-label="Add an expense"
            className={cn(
              "flex size-12 items-center justify-center bg-primary-700 text-white transition-colors duration-200 hover:bg-primary-800 active:scale-[0.97] dark:bg-primary-400 dark:text-primary-950 dark:hover:bg-primary-300",
              focusRing,
            )}
          >
            <IconPlus aria-hidden="true" className="size-6" stroke={2} />
          </Link>
        </li>
        {right.map(tab)}
      </ul>
    </nav>
  );
}
