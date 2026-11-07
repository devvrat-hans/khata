"use client";

import { Button } from "@aback-ui/ui";
import { IconRefresh } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="flex min-h-[60dvh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page could not load. Your data is safe. Try again, and if it keeps happening, let us know.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={reset}>
            <IconRefresh aria-hidden="true" />
            Try again
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Go home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
