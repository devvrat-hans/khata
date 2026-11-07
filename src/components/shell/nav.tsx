"use client";

import { cn } from "@aback-ui/ui";
import {
  IconHistory,
  IconLayoutDashboard,
  IconPlus,
  IconSettings,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
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

/** The sidebar links, from md up. */
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActivePath(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 border-l-2 px-3 py-2 text-sm font-medium transition-colors duration-200",
                  focusRing,
                  active
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The bottom tab bar on phones, with the add button in the middle. */
export function BottomNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.icon !== "settings");
  const left = items.slice(0, 2);
  const right = items.slice(2);

  const tab = (item: NavItem) => {
    const Icon = ICONS[item.icon];
    const active = isActivePath(item.href, pathname);
    return (
      <li key={item.href} className="flex-1">
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-200",
            focusRing,
            active ? "text-primary-700 dark:text-primary-400" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon aria-hidden="true" className="size-5" />
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-separator bg-background/95 backdrop-blur-sm md:hidden"
    >
      <ul className="flex items-stretch">
        {left.map(tab)}
        <li className="flex flex-1 items-center justify-center">
          <Link
            href="/expenses/new"
            aria-label="Add an expense"
            className={cn(
              "flex size-11 items-center justify-center bg-primary-700 text-white shadow-sm transition-colors hover:bg-primary-800 active:scale-[0.98] dark:bg-primary-400 dark:text-primary-950 dark:hover:bg-primary-300",
              focusRing,
            )}
          >
            <IconPlus aria-hidden="true" className="size-6" />
          </Link>
        </li>
        {right.map(tab)}
      </ul>
    </nav>
  );
}
