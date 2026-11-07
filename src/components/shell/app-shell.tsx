import { Button } from "@aback-ui/ui";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Viewer } from "@/server/auth/session";
import { Logo } from "../logo";
import { BottomNav, SidebarNav } from "./nav";
import { UserMenu } from "./user-menu";

/**
 * The signed-in shell. From md up: a fixed sidebar with the logo, the main
 * action, navigation and the account menu. Below md: a slim top bar and a
 * bottom tab bar, so everything is in reach of a thumb.
 */
export function AppShell({ viewer, children }: { viewer: Viewer; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-separator bg-background md:flex">
        <div className="flex h-16 items-center border-b border-separator bg-gradient-to-r from-primary-50 to-transparent px-4 dark:from-primary-900/30">
          <Logo href="/dashboard" />
        </div>
        <div className="border-b border-separator p-3">
          <Button asChild variant="brand" className="w-full">
            <Link href="/expenses/new">
              <IconPlus aria-hidden="true" />
              Add expense
            </Link>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav />
        </div>
        <div className="border-t border-separator p-2">
          <UserMenu user={viewer} />
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-separator bg-background/95 px-4 backdrop-blur-sm md:hidden">
        <Logo href="/dashboard" />
        <UserMenu user={viewer} compact />
      </header>

      <div className="md:pl-64">
        <main id="main-content" className="pb-safe-nav mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8 md:pb-12">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
