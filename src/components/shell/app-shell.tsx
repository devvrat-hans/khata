import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Viewer } from "@/server/auth/session";
import { Logo } from "../logo";
import { BottomNav, TopNav } from "./nav";
import { UserMenu } from "./user-menu";

/**
 * The signed-in shell, built like the aback.group header: one hairline bar
 * with the lockup, the sections as underlined links and the one main action.
 * Below md the sections move to a bottom tab bar, in reach of a thumb.
 */
export function AppShell({ viewer, children }: { viewer: Viewer; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container-app flex h-16 items-center gap-8">
          <Logo href="/dashboard" />
          <TopNav />
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/expenses/new"
              className="hidden h-9 items-center gap-1.5 border border-separator px-3.5 text-sm font-medium transition-colors duration-200 outline-none hover:border-foreground focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
            >
              <IconPlus aria-hidden="true" className="size-4" />
              Add expense
            </Link>
            <UserMenu user={viewer} />
          </div>
        </div>
      </header>

      <main id="main-content" className="container-app pb-safe-nav flex-1 pt-8 md:pt-14 md:pb-24">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
