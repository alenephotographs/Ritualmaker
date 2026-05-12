import { getBouquets, getFaqs, getSiteSettings } from "@/lib/db";
import type {
  Bouquet,
  FAQ,
  SiteSettings,
} from "@/lib/types/content";
import { Hero } from "@/components/Hero";
import { BouquetGrid } from "@/components/BouquetGrid";
import { InstagramFeedSection } from "@/components/InstagramFeedSection";
import { FAQSection } from "@/components/FAQSection";
import { getRecentInstagramMedia } from "@/lib/instagram";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, bouquets, faqs, instagramPosts] = await Promise.all([
    getSiteSettings().catch(() => null),
    getBouquets().catch(() => []),
    getFaqs().catch(() => []),
    getRecentInstagramMedia(9).catch(() => null),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings?.title ?? "Ritualmaker",
    description:
      settings?.description ??
      "Flowers for daily life. Hudson Valley self-serve stand.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "38 Miller Hill Road",
      addressRegion: "NY",
      addressCountry: "US",
    },
    sameAs: [settings?.instagramUrl, settings?.googleProfileUrl].filter(Boolean) as string[],
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
        id="farm-stand"
        className="bg-cream py-20 lg:py-28"
        aria-labelledby="farm-stand-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/40">
              Farm stand
            </p>
            <h2
              id="farm-stand-heading"
              className="mt-3 font-display text-4xl font-light lg:text-5xl"
            >
              What&apos;s on the shelf
            </h2>
            <p className="mt-3 max-w-xl text-sm text-ink/60">
              Seasonal flowers, arranged simply or built into larger offerings.
            </p>
          </div>

          <div className="mt-12">
            <BouquetGrid bouquets={bouquets} />
          </div>
        </div>
      </section>

      <InstagramFeedSection settings={settings} posts={instagramPosts} />

      <FAQSection faqs={faqs} />
    </>
  );
}
