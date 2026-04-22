import Link from "next/link";
import type { SiteSettings } from "@/sanity/types";
import { StandStatus } from "./StandStatus";

export function Hero({ settings }: { settings: SiteSettings | null }) {
  const heroUrl = "/photos/field-mixed-tulips-cluster.jpg";

  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden">
      {heroUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroUrl}
          alt="Seasonal flower arrangement"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blush via-coral/40 to-magenta/30" />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-magenta/10 via-ink/15 to-ink/75" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
        <StandStatus settings={settings} />

        <p className="text-xs uppercase tracking-widest text-cream/75">
          Ritualmaker Flowers · flower stand
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl font-light text-cream md:text-7xl lg:text-8xl">
          {settings?.tagline ?? "Fresh flowers in the neighborhood, 24/7"}
        </h1>

        <p className="mt-5 max-w-xl text-lg font-light text-cream/85">
          The Ritualmaker flower stand: a seasonal, self-serve cut flower stop on
          38 Miller Hill Road. Grab a bouquet at the stand — pay cash or pay online
          below. Always fresh, always homegrown. Ready when you are.
        </p>

        <div className="mt-8">
          <Link
            href="/farm-stand#flowers"
            className="inline-block bg-cream px-6 py-3 text-xs uppercase tracking-widest text-ink transition-colors hover:bg-stone"
          >
            Shop bouquets now
          </Link>
        </div>
      </div>
    </section>
  );
}
