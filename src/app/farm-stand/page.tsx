import { sanityClient } from "@/sanity/client";
import { resolveContactLinks } from "@/lib/siteContact";
import { publicFlowerProductsQuery, siteSettingsQuery } from "@/sanity/queries";
import type { FlowerProduct, SiteSettings } from "@/sanity/types";
import { ContactOutreachBlock } from "@/components/ContactOutreachBlock";
import { BouquetGrid } from "@/components/BouquetGrid";
import { StandStatus } from "@/components/StandStatus";

export const revalidate = 60;

export const metadata = {
  title: "Ritualmaker — Shop pantry & infused olive oil",
  description:
    "Garden Oil, botanical sugar, herbal tea, and more from Ritualmaker — shipped within the US.",
};

export default async function FarmStandPage() {
  const [settings, flowerProducts] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null),
    sanityClient.fetch<FlowerProduct[]>(publicFlowerProductsQuery).catch(() => []),
  ]);
  const shippedProducts = flowerProducts.filter((p) => p.shipsNationwide === true);
  const c = resolveContactLinks(settings);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 pb-20 lg:px-8 lg:py-24">
      <StandStatus settings={settings} />
      <p className="mt-6 max-w-xl text-sm text-ink/60">
        Order pantry items and infused olive oil for shipping within the US. More at the stand soon.{" "}
        <a
          href="#visit"
          className="text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          Location &amp; hours
        </a>
        {" · "}
        <a
          href="/on-location"
          className="text-ink/75 underline decoration-ink/20 underline-offset-2 hover:text-ink"
        >
          We come to you
        </a>
      </p>

      <div id="shop" className="mt-12 scroll-mt-24">
        <p className="text-xs uppercase tracking-widest text-ink/40">Shop</p>
        <BouquetGrid
          bouquets={[]}
          flowerProducts={shippedProducts}
          shopMode="shipped"
        />
      </div>

      <section className="mt-16 border-t border-ink/10 pt-12 lg:mt-20 lg:pt-16" aria-label="Visit the stand">
        <ContactOutreachBlock id="visit" links={c} />
      </section>
    </div>
  );
}
