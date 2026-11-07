import { Button } from "@aback-ui/ui";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center border-b border-separator px-4 md:px-6">
        <Logo />
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md border border-primary-200 bg-gradient-to-br from-primary-50 via-background to-primary-100/60 p-8 dark:border-primary-800/60 dark:from-primary-950/40 dark:to-background">
          <p className="inline-block border border-primary-200 bg-background px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:border-primary-800 dark:text-primary-300">
            Error 404
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page does not exist, or you do not have access to it. Private hisabs and groups only open for the people
            in them.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="brand">
              <Link href="/dashboard">Go to your home page</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">About Khata</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
