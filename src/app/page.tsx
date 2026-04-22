import Link from "next/link";
import { sanityClient } from "@/sanity/client";
import {
  bouquetsQuery,
  faqsQuery,
  featuredGalleryQuery,
  featuredReviewsQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import type {
  ArchivePhoto,
  Bouquet,
  FAQ,
  Review,
  SiteSettings,
} from "@/sanity/types";
import { Hero } from "@/components/Hero";
import { BouquetGrid } from "@/components/BouquetGrid";
import { ReviewsSection } from "@/components/ReviewsSection";
import { FAQSection } from "@/components/FAQSection";
import { GalleryPreview } from "@/components/GalleryPreview";
import { CrossPromoStrip } from "@/components/CrossPromoStrip";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, bouquets, reviews, faqs, gallery] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null),
    sanityClient.fetch<Bouquet[]>(bouquetsQuery).catch(() => []),
    sanityClient.fetch<Review[]>(featuredReviewsQuery).catch(() => []),
    sanityClient.fetch<FAQ[]>(faqsQuery).catch(() => []),
    sanityClient.fetch<ArchivePhoto[]>(featuredGalleryQuery).catch(() => []),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings?.title ?? "Ritualmaker Flowers",
    description:
      settings?.description ??
      "A 24/7 self-serve cut flower stand in the Hudson Valley.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Miller Hill Road",
      addressRegion: "NY",
      addressCountry: "US",
    },
    sameAs: [settings?.instagramUrl].filter(Boolean),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero settings={settings} />

      <section
        id="shop"
        className="bg-cream py-20 lg:py-28"
        aria-labelledby="shop-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/40">
                Bouquet pricing
              </p>
              <h2
                id="shop-heading"
                className="mt-3 font-display text-4xl font-light lg:text-5xl"
              >
                Pick your bouquet up anytime.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-ink/60">
                Pay online below or with cash at the stand. Bouquets restock
                throughout the day.
              </p>
            </div>
            <Link
              href="/shop#flowers"
              className="border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
            >
              Fast checkout
            </Link>
          </div>

          <div className="mt-12">
            <BouquetGrid bouquets={bouquets} />
          </div>
        </div>
      </section>

      <CrossPromoStrip />
      <GalleryPreview photos={gallery} />
      <ReviewsSection reviews={reviews} settings={settings} />
      <FAQSection faqs={faqs} />
    </>
  );
}
