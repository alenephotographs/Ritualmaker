import { sanityClient } from "@/sanity/client";
import { resolveContactLinks } from "@/lib/siteContact";
import { bouquetsQuery, pantryItemsQuery, siteSettingsQuery } from "@/sanity/queries";
import type { Bouquet, PantryItem, SiteSettings } from "@/sanity/types";
import { ContactOutreachBlock } from "@/components/ContactOutreachBlock";
import { BouquetGrid } from "@/components/BouquetGrid";
import { PantryGrid } from "@/components/PantryGrid";
import { StandStatus } from "@/components/StandStatus";

export const revalidate = 60;

export const metadata = {
  title: "Ritualmaker — Flowers & pantry",
  description:
    "Bouquets and pantry at 38 Miller Hill Road — self-serve, restocked often.",
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
      <p className="mt-6 max-w-xl text-sm text-ink/60">
        Flowers and pantry, same stop.{" "}
        <a
          href="#visit"
          className="text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          Location &amp; hours
        </a>
        {" · "}
        <a
          href="/on-location#inquiry"
          className="text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          We come to you
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

      <section className="mt-16 border-t border-ink/10 pt-12 lg:mt-20 lg:pt-16" aria-label="Visit the stand">
        <ContactOutreachBlock id="visit" links={c} />
      </section>
    </div>
  );
}
