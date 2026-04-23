import Link from "next/link";
import { OnLocationInquiryForm } from "@/components/inquiry/OnLocationInquiryForm";
import { LiveCollageSection } from "@/components/LiveCollageSection";

export const metadata = {
  title: "On location",
  description:
    "Weddings, pop-up bars, hospitality, and Live Collage™ — Hudson Valley.",
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
      "Wedding and event flowers, pop-up bars, commercial and hospitality accounts, and Live Collage™ for events.",
    serviceType: "Florist on location; pop-up retail; live floral performance",
    provider: {
      "@type": "Organization",
      name: "Ritualmaker",
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

      <section className="w-full border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-28">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/40">On location</p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-light leading-tight sm:text-4xl lg:text-5xl">
            Weddings &amp; events
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Personals, ceremony, reception, tables, installs — tuned to your date and space.
          </p>
        </div>
      </section>

      <section className="w-full border-b border-ink/10 bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-28">
          <h2 className="max-w-3xl font-display text-3xl font-light leading-tight sm:text-4xl lg:text-5xl">
            Pop-up flower bars
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Stems and wraps for markets, hotels, and block parties — we bring setup and pack-down.
          </p>
        </div>
      </section>

      <section className="w-full border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-28">
          <h2 className="max-w-3xl font-display text-3xl font-light leading-tight sm:text-4xl lg:text-5xl">
            Restaurants &amp; hotels
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Rotating installs on a delivery rhythm that fits the house.
          </p>
        </div>
      </section>

      <section className="w-full border-b border-ink/10 bg-bloom/15">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-28">
          <p className="text-xs uppercase tracking-[0.2em] text-magenta/80">Signature</p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-light leading-tight text-ink sm:text-4xl lg:text-5xl">
            Live Collage™
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Florals built live at your event — details below.
          </p>
          <Link
            href="#live"
            className="mt-8 inline-block text-xs uppercase tracking-[0.2em] text-magenta underline decoration-magenta/40 underline-offset-4 hover:decoration-magenta"
          >
            See how it works
          </Link>
        </div>
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
