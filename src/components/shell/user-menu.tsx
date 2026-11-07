"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast,
  useTheme,
} from "@aback-ui/ui";
import { IconChevronDown, IconLogout, IconMoon, IconSettings, IconSun } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PersonAvatar } from "../person-avatar";

export function UserMenu({
  user,
  compact = false,
}: {
  user: { name: string; email: string; image: string | null };
  compact?: boolean;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  async function signOut() {
    const result = await authClient.signOut();
    if (result.error) {
      toast.error("Could not sign out. Try again.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${user.name}`}
          className={
            compact
              ? "flex items-center p-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-focus-ring"
              : "flex w-full items-center gap-2.5 p-1.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-focus-ring"
          }
        >
          <PersonAvatar person={user} size="sm" />
          {compact ? null : (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </span>
              <IconChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-medium">{user.name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <IconSettings aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          {resolvedTheme === "dark" ? <IconSun aria-hidden="true" /> : <IconMoon aria-hidden="true" />}
          {resolvedTheme === "dark" ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={signOut}>
          <IconLogout aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
