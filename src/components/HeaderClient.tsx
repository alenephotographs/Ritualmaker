"use client";

import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { RitualmakerCategoryNav } from "@/components/RitualmakerCategoryNav";
import { HeaderFarmStandCart, HeaderFarmStandCartMobile } from "@/components/HeaderFarmStandCart";

export function HeaderClient({ standClosed }: { standClosed: boolean }) {
  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between border-b border-ink/10 px-6 py-3.5 lg:px-8 lg:py-4">
        <Link href="/" className="flex min-w-0 flex-1 items-center pr-2" aria-label="Ritualmaker, home">
          <Wordmark className="h-9 w-[18rem] max-w-[58vw] sm:h-10 sm:w-[22rem] lg:h-11 lg:w-[28rem]" />
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <HeaderFarmStandCart className="hidden md:inline-flex" />
          <Link
            href="/farm-stand#shop"
            className="hidden bg-ink px-4 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal md:inline-block"
          >
            {standClosed ? "Stand closed" : "Shop"}
          </Link>
          <HeaderFarmStandCartMobile className="md:hidden" />
          <MobileNav standClosed={standClosed} />
        </div>
      </div>
      <RitualmakerCategoryNav variant="mobile-scroll" />
      <RitualmakerCategoryNav />
    </header>
  );
}
