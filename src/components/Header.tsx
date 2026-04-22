import Link from "next/link";
import { sanityClient } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";
import { Logo } from "@/components/Logo";

export async function Header() {
  const settings = await sanityClient
    .fetch<SiteSettings | null>(siteSettingsQuery)
    .catch(() => null);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Ritualmaker, home"
        >
          <Logo
            className="h-6 w-auto sm:h-7 lg:h-8"
            title="Ritualmaker Flowers"
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-ink/70 hover:text-ink"
          >
            Flowers
          </Link>
          <Link
            href="/live"
            className="text-xs uppercase tracking-widest text-ink/70 hover:text-ink"
          >
            Live
          </Link>
          <Link
            href="/weddings"
            className="text-xs uppercase tracking-widest text-ink/70 hover:text-ink"
          >
            Weddings
          </Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/shop#flowers"
            className="bg-ink px-4 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal"
          >
            {settings?.standStatus === "closed" ? "Stand closed" : "Buy flowers"}
          </Link>
        </div>
        <Link
          href="/shop#flowers"
          className="bg-ink px-4 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal md:hidden"
        >
          {settings?.standStatus === "closed" ? "Stand closed" : "Buy flowers"}
        </Link>
      </div>
    </header>
  );
}
