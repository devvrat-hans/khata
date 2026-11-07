import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./site-chrome";

/** Long-form pages (privacy, terms): a 72ch column of prose. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-[72ch] flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground [&_a]:text-link [&_a:hover]:underline [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
