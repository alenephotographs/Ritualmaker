import Link from "next/link";
import { OnLocationInquiryForm } from "@/components/inquiry/OnLocationInquiryForm";
import { LiveCollageSection } from "@/components/LiveCollageSection";

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

export default function OnLocationPage({ searchParams }: OnLocationPageProps) {
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
      <h1 className="sr-only">On location</h1>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:grid-cols-2 sm:py-16 lg:grid-cols-4 lg:px-8 lg:py-20">
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
        <OnLocationInquiryForm
          defaultService={searchParams?.service}
          sectionId="inquiry"
        />
      </section>
    </div>
  );
}
