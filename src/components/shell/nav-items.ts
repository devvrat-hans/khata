export interface NavItem {
  label: string;
  href: string;
  icon: "home" | "groups" | "people" | "activity" | "settings";
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Groups", href: "/groups", icon: "groups" },
  { label: "People", href: "/people", icon: "people" },
  { label: "Activity", href: "/activity", icon: "activity" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export function isActivePath(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
