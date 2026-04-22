import Link from "next/link";
import { ContactOutreachBlock } from "@/components/ContactOutreachBlock";
import { OnLocationInquiryForm } from "@/components/inquiry/OnLocationInquiryForm";
import { LiveCollageSection } from "@/components/LiveCollageSection";
import { sanityClient } from "@/sanity/client";
import { resolveContactLinks } from "@/lib/siteContact";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";

export const metadata = {
  title: "On location",
  description:
    "On-site floristry, pop-up flower bars, standing orders for restaurants and hotels, weddings and private events, and Live Collage™ — Hudson Valley, NY.",
};

type OnLocationPageProps = {
  searchParams?: {
    service?: string;
  };
};

export default async function OnLocationPage({ searchParams }: OnLocationPageProps) {
  const siteSettings = await sanityClient
    .fetch<SiteSettings | null>(siteSettingsQuery)
    .catch(() => null);
  const contact = resolveContactLinks(siteSettings);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Ritualmaker on-location floristry",
    description:
      "Wedding and event flowers, pop-up flower bars, commercial and hospitality accounts, and Live Collage on site.",
    serviceType: "Florist on location; pop-up retail; live floral performance",
    provider: {
      "@type": "Organization",
      name: "Ritualmakerny",
      url: site,
    },
    areaServed: "Hudson Valley, NY",
    url: `${site}/on-location`,
  };

  return (
    <div className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <p className="text-xs uppercase tracking-widest text-ink/40">On location</p>
        <h1 className="mt-4 font-display text-4xl font-light sm:text-5xl lg:text-6xl">
          We bring the flowers to you
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink/65">
          On-site floristry for <strong className="font-medium text-ink/80">weddings and private
          events</strong>, <strong className="font-medium text-ink/80">pop-up flower bars</strong> we
          bring to your market, venue, or street corner, standing or recurring{" "}
          <strong className="font-medium text-ink/80">delivery for commercial accounts</strong>{" "}
          (restaurants, hotels, and similar venues), and{" "}
          <strong className="font-medium text-ink/80">Live Collage™</strong> — the live composition
          built in front of your guests. One inquiry; we will sort scope and schedule together.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-ink/55">
          The Live Collage section is on this same page below — it is not a separate area of
          the site.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#inquiry"
            className="bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal"
          >
            Start inquiry
          </Link>
          <Link
            href="#visit"
            className="border border-ink/20 px-6 py-3 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
          >
            Location &amp; contact
          </Link>
          <Link
            href="#live"
            className="border border-ink/20 px-6 py-3 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
          >
            Live Collage™
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl grid gap-6 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <article className="border border-ink/10 bg-white p-6">
          <p className="text-[10px] uppercase tracking-widest text-ink/40">On location</p>
          <h2 className="mt-2 font-display text-2xl font-light sm:text-3xl">Weddings &amp; events</h2>
          <p className="mt-3 text-sm text-ink/65">
            Personals, ceremony and reception, tablescapes, and installations—styled to
            your date, space, and season.
          </p>
        </article>

        <article className="border border-ink/10 bg-white p-6">
          <p className="text-[10px] uppercase tracking-widest text-ink/40">On location</p>
          <h2 className="mt-2 font-display text-2xl font-light sm:text-3xl">Pop-up flower bars</h2>
          <p className="mt-3 text-sm text-ink/65">
            A temporary flower bar at your market, pop-up, hotel, or block party—we set up, sell
            stems and wraps, and pack down. Tell us the footprint and the crowd; we will plan the
            ice and the stems.
          </p>
        </article>

        <article className="border border-ink/10 bg-white p-6">
          <p className="text-[10px] uppercase tracking-widest text-ink/40">On location</p>
          <h2 className="mt-2 font-display text-2xl font-light sm:text-3xl">Hospitality &amp; commercial</h2>
          <p className="mt-3 text-sm text-ink/65">
            Ongoing and rotating florals for restaurants, hotels, and other accounts. Tell us
            about delivery cadence, volume, and style—we can set up a regular run that fits
            the kitchen or front-of-house.
          </p>
        </article>

        <article className="border border-magenta/20 bg-bloom/10 p-6">
          <p className="text-[10px] uppercase tracking-widest text-magenta/70">On location</p>
          <h2 className="mt-2 font-display text-2xl font-light sm:text-3xl">Live Collage™</h2>
          <p className="mt-3 text-sm text-ink/65">
            A live floral composition in real time at your event. How it works and examples
            are below.
          </p>
          <Link
            href="#live"
            className="mt-4 inline-block text-xs uppercase tracking-widest text-magenta underline decoration-magenta/40 underline-offset-4"
          >
            How it works &amp; examples
          </Link>
        </article>
      </section>

      <LiveCollageSection />

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24">
        <ContactOutreachBlock id="visit" links={contact} />
        <OnLocationInquiryForm
          contact={contact}
          defaultService={searchParams?.service}
          sectionId="inquiry"
        />
      </section>
    </div>
  );
}
