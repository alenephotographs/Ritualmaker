import { sanityClient } from "@/sanity/client";
import { bouquetsQuery, pantryItemsQuery, siteSettingsQuery } from "@/sanity/queries";
import type { Bouquet, PantryItem, SiteSettings } from "@/sanity/types";
import { BouquetGrid } from "@/components/BouquetGrid";
import { PantryGrid } from "@/components/PantryGrid";
import { StandStatus } from "@/components/StandStatus";

export const revalidate = 60;

export const metadata = {
  title: "Shop flowers and pantry",
  description:
    "Cut flower bouquets and Ritualmaker Pantry goods from Ritualmaker Farm. Pay online for bouquets or shop pantry goods at the stand.",
};

export default async function ShopPage() {
  const [settings, bouquets, pantryItems] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null),
    sanityClient.fetch<Bouquet[]>(bouquetsQuery).catch(() => []),
    sanityClient.fetch<PantryItem[]>(pantryItemsQuery).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 pb-28 lg:px-8 lg:py-24">
      <StandStatus settings={settings} />
      <h1 className="mt-6 font-display text-5xl font-light lg:text-6xl">Shop</h1>
      <p className="mt-3 max-w-xl text-sm text-ink/60">
        Pay here, then pick up at the stand on Miller Hill Road. Or pay cash at the
        site — bouquets are first come, first served and restocked throughout
        the day.
      </p>

      <div className="mt-6 border border-moss/25 bg-moss/10 px-5 py-4">
        <p className="text-xs uppercase tracking-widest text-moss">
          Fast checkout for stand buyers
        </p>
        <p className="mt-2 text-sm text-ink/70">
          Step 1: pick your bouquet below. Step 2: tap the checkout button. Step 3:
          grab your flowers at the stand.
        </p>
      </div>

      <div id="flowers" className="mt-12 scroll-mt-24">
        <p className="text-xs uppercase tracking-widest text-ink/40">Flowers</p>
        <BouquetGrid bouquets={bouquets} />
      </div>

      <div className="mt-8 border border-ink/10 bg-white p-5">
        <p className="text-xs uppercase tracking-widest text-ink/40">Quick buyer notes</p>
        <ul className="mt-3 space-y-2 text-sm text-ink/70">
          <li>Checkout is one tap per bouquet.</li>
          <li>You can also pay cash at the stand.</li>
          <li>If a shelf is empty, take an equivalent bouquet and message us.</li>
        </ul>
      </div>

      <div className="mt-16 border-t border-ink/10 pt-10">
        <p className="text-xs uppercase tracking-widest text-ink/40">
          Ritualmaker Pantry
        </p>
        <h2 className="mt-3 font-display text-4xl font-light">At the stand now</h2>
        <p className="mt-3 max-w-2xl text-sm text-ink/60">
          Pantry items are stand-only (not online checkout). Oils can be purchased
          now, and seasonal goods like seasoned salts, flower sugar, and farm eggs are
          posted as they come online.
        </p>
        <div className="mt-10">
          <PantryGrid items={pantryItems} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-3 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 border border-ink/15 bg-cream/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="text-[11px] uppercase tracking-widest text-ink/60">
            Fast checkout
          </p>
          <a
            href="#flowers"
            className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-cream"
          >
            Jump to bouquets
          </a>
        </div>
      </div>
    </div>
  );
}
