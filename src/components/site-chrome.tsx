import { Button, ThemeToggle } from "@aback-ui/ui";
import { IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo } from "./logo";

/** The header of public pages. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-separator bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Site" className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Khata on GitHub" className="hidden sm:inline-flex">
            <a href={SITE.repository} target="_blank" rel="noopener noreferrer">
              <IconBrandGithub aria-hidden="true" />
            </a>
          </Button>
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="brand">
            <Link href="/sign-in">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

/** The footer of public pages. */
export function SiteFooter() {
  return (
    <footer className="border-t border-separator bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-[34ch] text-xs leading-relaxed text-muted-foreground">
            Split shared expenses, keep private hisabs between two people, and settle up. Free and open source.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Product</h2>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <a href={SITE.repository} className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">
                Source code
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</h2>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <a href={SITE.maker.url} className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">
                Aback Group
              </a>
            </li>
            <li>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Aback Group. Code under the MIT license.</span>
          <span>Made in India for people everywhere.</span>
        </div>
      </div>
    </footer>
  );
}
