import { sanityClient } from "@/sanity/client";
import { resolveContactLinks } from "@/lib/siteContact";
import { bouquetsQuery, pantryItemsQuery, siteSettingsQuery } from "@/sanity/queries";
import type { Bouquet, PantryItem, SiteSettings } from "@/sanity/types";
import { BouquetGrid } from "@/components/BouquetGrid";
import { PantryGrid } from "@/components/PantryGrid";
import { StandStatus } from "@/components/StandStatus";

export const revalidate = 60;

export const metadata = {
  title: "Ritualmaker — Farm stand",
  description:
    "Flowers and pantry at the self-serve stand: cut bouquets and small-batch goods. 38 Miller Hill Road.",
};

export default async function FarmStandPage() {
  const [settings, bouquets, pantryItems] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null),
    sanityClient.fetch<Bouquet[]>(bouquetsQuery).catch(() => []),
    sanityClient.fetch<PantryItem[]>(pantryItemsQuery).catch(() => []),
  ]);
  const c = resolveContactLinks(settings);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 pb-20 lg:px-8 lg:py-24">
      <StandStatus settings={settings} />
      <p className="mt-4 text-xs uppercase tracking-widest text-ink/40">
        Ritualmaker Farm stand
      </p>
      <h1 className="mt-2 font-display text-5xl font-light lg:text-6xl">
        Farm stand
      </h1>
      <p className="mt-3 max-w-xl text-sm text-ink/60">
        Same self-serve stop for flowers and pantry (below). Bouquets: pay online for
        pickup or cash on site. Pantry details on each item. 38 Miller Hill Road;
        restocked through the day.
      </p>
      <p className="mt-3 flex max-w-2xl flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-ink/55">
        <a
          href={c.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          Google Maps
        </a>
        {c.googleProfileUrl ? (
          <a
            href={c.googleProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
          >
            Business profile
          </a>
        ) : null}
        {c.googleReviewUrl ? (
          <a
            href={c.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
          >
            Leave a review
          </a>
        ) : null}
        {c.email ? (
          <a
            href={`mailto:${c.email}`}
            className="whitespace-nowrap text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
          >
            Email
          </a>
        ) : null}
        <a
          href="/on-location#visit"
          className="whitespace-nowrap text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          On-location florals
        </a>
      </p>

      <div id="flowers" className="mt-12 scroll-mt-24">
        <p className="text-xs uppercase tracking-widest text-ink/40">Flowers</p>
        <BouquetGrid bouquets={bouquets} />
      </div>

      <div id="pantry" className="mt-16 scroll-mt-24 border-t border-ink/10 pt-10">
        <p className="text-xs uppercase tracking-widest text-ink/40">Pantry</p>
        <h2 className="mt-3 font-display text-4xl font-light">In stock</h2>
        <div className="mt-10">
          <PantryGrid items={pantryItems} />
        </div>
      </div>
    </div>
  );
}
