import { ThemeToggle } from "@aback-ui/ui";
import { IconArrowUpRight, IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo } from "./logo";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#private", label: "Private hisab" },
  { href: "/#faq", label: "Questions" },
];

const boxLink =
  "group inline-flex h-9 items-center gap-1 border border-separator px-3.5 text-sm font-medium transition-colors duration-200 outline-none hover:border-foreground focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** The header of public pages: the aback.group bar, with Khata's sections. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container-site flex h-16 items-center">
        <Logo />

        <nav aria-label="Site" className="ml-auto hidden h-full items-stretch gap-8 md:flex">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="-mb-px inline-flex items-center border-b border-transparent text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-8 md:border-l md:border-border md:pl-4">
          <a
            href={SITE.repository}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Khata on GitHub"
            title="Khata on GitHub"
            className="hidden size-9 items-center justify-center text-muted-foreground transition-colors duration-200 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus-ring sm:inline-flex"
          >
            <IconBrandGithub aria-hidden="true" className="size-[1.125rem]" />
          </a>
          <ThemeToggle />
          <Link href="/sign-in" className={`${boxLink} ml-2`}>
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Khata",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "How it works", href: "/#how" },
      { label: "Questions", href: "/#faq" },
    ],
  },
  {
    title: "Open source",
    links: [
      { label: "Source code", href: SITE.repository, external: true },
      { label: "Run your own", href: `${SITE.repository}/blob/main/docs/deployment.md`, external: true },
    ],
  },
  {
    title: "Aback",
    links: [
      { label: "Aback Group", href: SITE.maker.url, external: true },
      { label: "All products", href: `${SITE.maker.url}/products/`, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const footerLink =
  "inline-flex min-h-7 items-center gap-1 text-sm text-inverse-foreground/90 transition-colors duration-200 hover:text-inverse-foreground hover:underline hover:decoration-inverse-border hover:underline-offset-4";

/** The sign-off of public pages: the inverted band that closes every page. */
export function SiteFooter() {
  return (
    <footer className="bg-inverse text-inverse-foreground">
      <div className="container-site grid gap-14 py-16 md:py-20 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-start gap-6 lg:col-span-5">
          <Logo tone="inverse" />
          <p className="type-subhead max-w-[22ch] text-inverse-foreground">Shared money, kept straight.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-7">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-4">
              <h2 className="type-meta text-inverse-muted">{column.title}</h2>
              <ul className="flex flex-col gap-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={footerLink}>
                        {link.label}
                        <IconArrowUpRight aria-hidden="true" className="size-3 text-inverse-muted" />
                      </a>
                    ) : (
                      <Link href={link.href} className={footerLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-inverse-border">
        <div className="container-site flex flex-col gap-3 py-6 text-sm text-inverse-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Aback Group. Code under the MIT license.</p>
          <p>Made in India, for people everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

/** A slim bar for standalone pages (sign in, welcome, join): the lockup and the theme switch. */
export function BareHeader({ href = "/" }: { href?: string }) {
  return (
    <header className="w-full border-b border-border">
      <div className="container-site flex h-16 items-center justify-between">
        <Logo href={href} />
        <ThemeToggle />
      </div>
    </header>
  );
}
