import Link from "next/link";

export const metadata = {
  title: "Ritualmaker Live Collage™",
  description:
    "A live floral performance for weddings, dinners, and gatherings that want a visual focal point.",
};

const suitedFor = [
  "Weddings and celebrations",
  "Gallery evenings",
  "Brand gatherings",
  "Private dinners",
];

const processSteps = [
  "We align on tone, placement, and palette before the event.",
  "During your event window, the work is built live in front of guests.",
  "The finished piece remains as part of the room for the rest of the evening.",
];

const liveCompositionImages = [
  "/photos/live-composition-01.png",
  "/photos/live-composition-02.png",
  "/photos/live-composition-03.png",
  "/photos/live-composition-04.png",
  "/photos/live-composition-05.png",
  "/photos/live-composition-06.png",
];

export default function LivePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Ritualmaker Live Collage™",
    serviceType: "Live floral composition performance",
    provider: {
      "@type": "Organization",
      name: "Ritualmaker",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com",
    },
    areaServed: "Hudson Valley, NY",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com"}/live`,
  };

  return (
    <div className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bg-magenta/95 py-20 text-cream lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cream/70">Live</p>
            <h1 className="mt-4 font-display text-[clamp(1.85rem,5.2vw,3.1rem)] font-light leading-[1.02]">
              Live Collage
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/90">
              A live floral composition built in real time during your event. Guests
              watch it take shape, then experience the finished piece for the rest of
              the evening.
            </p>
            <p className="mt-3 text-xs text-cream/75">
              Limited dates each season to keep every build fully custom.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/weddings?service=live"
                className="bg-cream px-6 py-3 text-xs uppercase tracking-widest text-magenta transition-colors hover:bg-blush"
              >
                Start inquiry
              </Link>
              <Link
                href="/weddings"
                className="border border-cream/40 px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-cream/10"
              >
                Weddings + events
              </Link>
            </div>
          </div>
          <div className="overflow-hidden border border-cream/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={liveCompositionImages[0]}
              alt="Ritualmaker Live Collage composition example"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <article className="border border-ink/10 bg-white p-8">
            <p className="text-xs uppercase tracking-widest text-ink/40">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-light">A live moment</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              Most builds run 60-90 minutes. We coordinate with your planner or host so
              the performance feels effortless in the flow of the event.
            </p>
            <ol className="mt-6 space-y-3 text-sm text-ink/70">
              {processSteps.map((step) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="border border-ink/10 bg-white p-8">
            <p className="text-xs uppercase tracking-widest text-ink/40">Suited for</p>
            <h2 className="mt-3 font-display text-4xl font-light">Best for</h2>
            <ul className="mt-6 space-y-3 text-sm text-ink/70">
              {suitedFor.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24">
        <p className="text-xs uppercase tracking-widest text-ink/40">
          Live composition examples
        </p>
        <h2 className="mt-3 font-display text-4xl font-light lg:text-5xl">
          From recent builds
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {liveCompositionImages.map((src) => (
            <figure key={src} className="overflow-hidden border border-ink/10 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Live floral composition by Ritualmaker"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
