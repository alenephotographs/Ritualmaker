"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ON_SITE_ARIA =
  "Ritualmaker on location — weddings, pop-up flower bars, venues, commercial accounts, and Live Collage";

const TABS: {
  href: string;
  label: string;
  ariaLabel?: string;
  isActive: (path: string) => boolean;
}[] = [
  {
    href: "/farm-stand",
    label: "Farm stand",
    isActive: (path: string) => path.startsWith("/farm-stand"),
  },
  {
    href: "/photography",
    label: "Photographs",
    isActive: (path: string) => path.startsWith("/photography"),
  },
  {
    href: "/on-location",
    label: "On site",
    ariaLabel: ON_SITE_ARIA,
    isActive: (path: string) => path.startsWith("/on-location"),
  },
];

type RitualmakerCategoryNavProps = {
  /** Smaller type on the horizontal-scroll mobile strip */
  variant?: "default" | "mobile-scroll";
};

export function RitualmakerCategoryNav({
  variant = "default",
}: RitualmakerCategoryNavProps) {
  const pathname = usePathname() ?? "";

  const font = "font-display tracking-tight";

  const baseTab =
    variant === "mobile-scroll"
      ? `${font} shrink-0 border-b-2 py-2.5 text-[0.95rem] transition-colors sm:text-base`
      : `${font} border-b-2 py-2.5 text-base transition-colors sm:text-[1.05rem] lg:text-[1.1rem]`;

  return (
    <nav
      className={
        variant === "mobile-scroll"
          ? "flex w-full items-stretch justify-start gap-0 overflow-x-auto border-b border-ink/10 bg-cream/90 px-0 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          : "hidden w-full border-b border-ink/10 bg-cream/80 md:flex md:items-stretch md:justify-center"
      }
      aria-label="Ritualmaker categories"
    >
      {TABS.map((tab) => {
        const active = tab.isActive(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.ariaLabel}
            className={[
              baseTab,
              active
                ? "border-ink text-ink"
                : "border-transparent text-ink/60 hover:text-ink/90",
              variant === "mobile-scroll"
                ? "min-w-[4.5rem] flex-1 text-center"
                : "px-5 lg:px-7",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
