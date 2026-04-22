import Link from "next/link";
import { sanityClient } from "@/sanity/client";
import {
  bouquetsQuery,
  faqsQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import type {
  Bouquet,
  FAQ,
  SiteSettings,
} from "@/sanity/types";
import { Hero } from "@/components/Hero";
import { BouquetGrid } from "@/components/BouquetGrid";
import { FAQSection } from "@/components/FAQSection";
import { CrossPromoStrip } from "@/components/CrossPromoStrip";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, bouquets, faqs] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null),
    sanityClient.fetch<Bouquet[]>(bouquetsQuery).catch(() => []),
    sanityClient.fetch<FAQ[]>(faqsQuery).catch(() => []),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings?.title ?? "Ritualmaker",
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
                Ritualmaker Flowers
              </p>
              <h2
                id="shop-heading"
                className="mt-3 font-display text-4xl font-light lg:text-5xl"
              >
                Shop the stand
              </h2>
              <p className="mt-3 max-w-xl text-sm text-ink/60">
                Self-serve cut flowers on Miller Hill Road. Order a bouquet
                for pickup, or pay cash at the site. Bouquets are restocked
                through the day.
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

      <CrossPromoStrip className="py-10" />

      <section
        className="bg-cream pb-20 pt-0 lg:pb-28"
        aria-labelledby="stand-extras-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-widest text-ink/40">
            At the same stand
          </p>
          <h2
            id="stand-extras-heading"
            className="mt-2 font-display text-3xl font-light lg:text-4xl"
          >
            Pantry & what is next
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink/55">
            Everything below is also sold (or will be) from the self-serve stand —
            same stop as the flowers, different shelf.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="border border-ink/10 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-ink/40">
                Ritualmaker Pantry
              </p>
              <h3 className="mt-2 font-display text-3xl font-light">In person now</h3>
              <p className="mt-2 text-sm text-ink/65">
                Oils and pantry items at the stand; more SKUs as they are
                ready.
              </p>
              <Link
                href="/pantry"
                className="mt-4 inline-block border border-ink/20 px-4 py-2 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
              >
                View pantry
              </Link>
            </div>
            <div className="border border-moss/25 bg-moss/10 p-5">
              <p className="text-xs uppercase tracking-widest text-moss">
                Shipping
              </p>
              <h3 className="mt-2 font-display text-3xl font-light">Coming</h3>
              <p className="mt-2 text-sm text-ink/70">
                We will turn on shipping for select pantry items once product
                photos are complete.
              </p>
            </div>
          </div>
        </div>
      </section>
      <FAQSection faqs={faqs} />
    </>
  );
}
