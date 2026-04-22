import Link from "next/link";
import { sanityClient } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";
import { Wordmark } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { RitualmakerCategoryNav } from "@/components/RitualmakerCategoryNav";

export async function Header() {
  const settings = await sanityClient
    .fetch<SiteSettings | null>(siteSettingsQuery)
    .catch(() => null);
  const standClosed = settings?.standStatus === "closed";

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-ink/10 px-6 py-3.5 lg:px-8 lg:py-4">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Ritualmaker, home"
        >
          <Wordmark className="text-[1.6rem] leading-none text-ink sm:text-3xl lg:text-[1.9rem]" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/shop#flowers"
            className="hidden bg-ink px-4 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal md:inline-block"
          >
            {standClosed ? "Stand closed" : "Buy flowers"}
          </Link>
          <MobileNav standClosed={standClosed} />
        </div>
      </div>
      <RitualmakerCategoryNav variant="mobile-scroll" />
      <RitualmakerCategoryNav />
    </header>
  );
}
