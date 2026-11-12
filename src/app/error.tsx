"use client";

import { Button } from "@aback-ui/ui";
import { IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { ArrowLink, SectionLabel } from "@/components/editorial";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="container-site flex min-h-[60dvh] flex-col justify-center py-16">
      <SectionLabel>Something went wrong</SectionLabel>
      <h1 className="type-title mt-8 max-w-[14ch] text-balance">The page could not load.</h1>
      <p className="type-lede mt-6 max-w-xl text-muted-foreground">
        Your data is safe. Try again, and if it keeps happening, let us know.
      </p>
      {error.digest ? <p className="type-meta mt-4 text-muted-foreground">Reference: {error.digest}</p> : null}
      <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
        <Button onClick={reset} size="lg" className="h-12 px-6">
          <IconRefresh aria-hidden="true" />
          Try again
        </Button>
        <ArrowLink href="/dashboard">Go home</ArrowLink>
      </div>
    </main>
  );
}
