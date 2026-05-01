import { sanityClient } from "@/sanity/client";
import { resolveContactLinks } from "@/lib/siteContact";
import { publicFlowerProductsQuery, siteSettingsQuery } from "@/sanity/queries";
import type { FlowerProduct, SiteSettings } from "@/sanity/types";
import { ContactOutreachBlock } from "@/components/ContactOutreachBlock";
import { BouquetGrid } from "@/components/BouquetGrid";
import { StandStatus } from "@/components/StandStatus";

export const revalidate = 60;

export const metadata = {
  title: "Ritualmaker — Shop & garden pantry",
  description:
    "Seasonal bouquets and small-batch pantry items from Ritualmaker — shipped nationwide where marked, or visit the stand.",
};

export default async function FarmStandPage() {
  const settled = await Promise.allSettled([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery),
    sanityClient.fetch<FlowerProduct[]>(publicFlowerProductsQuery),
  ]);
  let settings: SiteSettings | null = null;
  if (settled[0].status === "fulfilled") settings = settled[0].value;
  else console.error("[farm-stand] settings fetch failed", settled[0].reason);

  let flowerProducts: FlowerProduct[] = [];
  if (settled[1].status === "fulfilled") flowerProducts = settled[1].value;
  else console.error("[farm-stand] products fetch failed", settled[1].reason);

  const flowersCount = flowerProducts.filter((p) => p.category !== "pantry").length;
  const pantryCount = flowerProducts.filter((p) => p.category === "pantry").length;
  const c = resolveContactLinks(settings);

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-16 pb-20 lg:px-8 lg:py-24">
      <StandStatus settings={settings} />
      <p className="mt-6 max-w-xl text-sm text-ink/60">
        Browse bouquets and garden pantry items. Items marked for nationwide shipping can check out with
        USPS rates; everything else is for local pickup or the stand.{" "}
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

      <div id="shop" className="mt-12 scroll-mt-[calc(5.5rem+env(safe-area-inset-top))]">
        <p className="text-xs uppercase tracking-widest text-ink/40">Shop</p>
        {flowersCount === 0 && pantryCount > 0 ? (
          <div
            className="mt-4 border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-ink/80"
            role="status"
          >
            <p className="font-medium text-ink">No flower or bouquet SKUs are live in the shop right now.</p>
            <p className="mt-1 text-ink/70">
              In Sanity, add or turn on{" "}
              <strong className="font-medium">active</strong> and{" "}
              <strong className="font-medium">in stock</strong> for flower products with category{" "}
              <strong className="font-medium">Bouquet</strong> (or bundle), not only Pantry.
            </p>
          </div>
        ) : null}
        <BouquetGrid bouquets={[]} flowerProducts={flowerProducts} shopMode="shipped" />
      </div>

      <section
        className="mt-16 scroll-mt-[calc(5.5rem+env(safe-area-inset-top))] border-t border-ink/10 pt-12 lg:mt-20 lg:pt-16"
        aria-label="Visit the stand"
      >
        <ContactOutreachBlock id="visit" links={c} />
      </section>
    </div>
  );
}
