import { Button } from "@aback-ui/ui";
import Link from "next/link";
import { ArrowLink, SectionLabel } from "@/components/editorial";
import { BareHeader } from "@/components/site-chrome";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <BareHeader />
      <main id="main-content" className="flex flex-1 flex-col">
        <div className="container-site flex flex-1 flex-col justify-center py-16 md:py-24">
          <SectionLabel>Error 404</SectionLabel>
          <h1 className="type-display mt-8 max-w-[12ch] text-balance md:mt-12">Nothing on this page.</h1>
          <div className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-12 lg:items-end lg:gap-x-10">
            <p className="type-lede max-w-xl text-muted-foreground lg:col-span-7">
              This page does not exist, or you do not have access to it. Private hisabs and groups only open for the
              people in them.
            </p>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:col-span-5 lg:justify-end">
              <Button asChild variant="brand" size="lg" className="h-12 px-6">
                <Link href="/dashboard">Go to your home page</Link>
              </Button>
              <ArrowLink href="/">About Khata</ArrowLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
