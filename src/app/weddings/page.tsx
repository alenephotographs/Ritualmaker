import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata = {
  title: "Weddings + Events",
  description:
    "Floral design and live composition for weddings, celebrations, and gatherings in one calm Ritualmaker planning flow.",
};

type WeddingsPageProps = {
  searchParams?: {
    service?: string;
  };
};

export default function WeddingsPage({ searchParams }: WeddingsPageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Ritualmaker Weddings and Events",
    serviceType: "Event florals and live floral performance",
    provider: {
      "@type": "Organization",
      name: "Ritualmaker",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com",
    },
    areaServed: "Hudson Valley, NY",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com"}/weddings`,
  };

  return (
    <div className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <p className="text-xs uppercase tracking-widest text-ink/40">Weddings + Events</p>
        <h1 className="mt-4 font-display text-5xl font-light lg:text-6xl">
          Floral direction for meaningful gatherings
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink/65">
          We keep planning simple and considered. Choose florals, Live Collage™, or
          both for weddings, dinners, brand events, and private celebrations.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#inquiry"
            className="bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal"
          >
            Start inquiry
          </Link>
          <Link
            href="/live"
            className="border border-ink/20 px-6 py-3 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
          >
            See Live Collage™
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-2 lg:px-8">
        <article className="border border-ink/10 bg-white p-7">
          <p className="text-[10px] uppercase tracking-widest text-ink/40">Florals</p>
          <h2 className="mt-3 font-display text-3xl font-light">Florals</h2>
          <p className="mt-3 text-sm text-ink/65">
            Personal flowers, table work, spatial installations, and focal pieces
            shaped to your season, setting, and event format.
          </p>
        </article>

        <article className="border border-magenta/20 bg-bloom/10 p-7">
          <p className="text-[10px] uppercase tracking-widest text-magenta/70">Live</p>
          <h2 className="mt-3 font-display text-3xl font-light">
            Ritualmaker Live Collage™
          </h2>
          <p className="mt-3 text-sm text-ink/65">
            A proprietary live floral composition performed in real time during your
            event.
          </p>
          <Link
            href="/live"
            className="mt-6 inline-block text-xs uppercase tracking-widest text-magenta underline decoration-magenta/40 underline-offset-4"
          >
            Learn more
          </Link>
        </article>

      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24">
        <InquiryForm defaultService={searchParams?.service ?? "florals"} sectionId="inquiry" />
      </section>
    </div>
  );
}
