import { sanityClient } from "@/sanity/client";
import {
  faqsQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import type {
  FAQ,
  SiteSettings,
} from "@/sanity/types";
import { Hero } from "@/components/Hero";
import { InstagramFeedSection } from "@/components/InstagramFeedSection";
import { FAQSection } from "@/components/FAQSection";
import { getRecentInstagramMedia } from "@/lib/instagram";
import { resolveContactLinks } from "@/lib/siteContact";
import { isStandClosed, resolveHomeDescription } from "@/lib/standAvailability";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, faqs, instagramPosts] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null),
    sanityClient.fetch<FAQ[]>(faqsQuery).catch(() => []),
    getRecentInstagramMedia(3).catch(() => null),
  ]);

  const contact = resolveContactLinks(settings);
  const standClosed = isStandClosed(settings?.standStatus);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings?.title ?? "Ritualmaker",
    description: resolveHomeDescription(settings?.description, settings?.standStatus),
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "38 Miller Hill Road",
      addressRegion: "NY",
      addressCountry: "US",
    },
    sameAs: [contact.instagramUrl, contact.facebookUrl, contact.googleProfileUrl].filter(
      Boolean,
    ) as string[],
    ...(standClosed
      ? {}
      : {
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          },
        }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero settings={settings} />

      <InstagramFeedSection settings={settings} posts={instagramPosts} />

      <FAQSection faqs={faqs} />
    </>
  );
}
