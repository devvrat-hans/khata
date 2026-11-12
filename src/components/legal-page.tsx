import type { ReactNode } from "react";
import { SectionLabel } from "./editorial";
import { SiteFooter, SiteHeader } from "./site-chrome";

/** Long-form pages (privacy, terms): the title on the page grid, prose in a 68ch column. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <div className="container-site pt-14 pb-12 sm:pt-20 md:pt-24">
          <SectionLabel>Legal</SectionLabel>
          <h1 className="type-title mt-8 md:mt-10">{title}</h1>
          <p className="type-meta mt-6 text-muted-foreground">Last updated {updated}</p>
        </div>
        <div className="border-t border-border">
          <div className="container-site grid py-14 md:py-20 lg:grid-cols-12 lg:gap-x-10">
            <div className="flex max-w-[68ch] flex-col gap-6 text-[0.9375rem] leading-relaxed text-muted-foreground lg:col-span-8 lg:col-start-4 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-separator [&_a]:underline-offset-4 [&_a:hover]:decoration-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
              {children}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
