const suitedFor = [
  "Celebrations and gatherings",
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
  "/photos/live-composition-03.png",
  "/photos/live-composition-04.png",
  "/photos/live-composition-05.png",
  "/photos/live-composition-06.png",
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com";

/**
 * Live Collage™ — full detail block, embedded on the On location page (not a separate nav item).
 */
export function LiveCollageSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Live Collage™",
    serviceType: "Live floral composition performance",
    provider: {
      "@type": "Organization",
      name: "Ritualmakerny",
      url: siteUrl,
    },
    areaServed: "Hudson Valley, NY",
    url: `${siteUrl}/on-location#live`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div id="live" className="scroll-mt-24">
        <section className="bg-magenta/95 py-20 text-cream lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.2em] text-cream/70">Live Collage™</p>
            <h2 className="mt-4 font-display text-[clamp(1.85rem,5.2vw,3.1rem)] font-light leading-[1.02]">
              Live Collage
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream/90">
              A live floral composition built in real time during your event. Guests watch it
              take shape, then experience the finished piece for the rest of the evening.
            </p>
            <p className="mt-3 text-xs text-cream/75">
              Limited dates each season to keep every build fully custom.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="border border-ink/10 bg-white p-8">
              <p className="text-xs uppercase tracking-widest text-ink/40">How it works</p>
              <h3 className="mt-3 font-display text-4xl font-light">A live moment</h3>
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
            </div>

            <div className="border border-ink/10 bg-white p-8">
              <p className="text-xs uppercase tracking-widest text-ink/40">Suited for</p>
              <h3 className="mt-3 font-display text-4xl font-light">Best for</h3>
              <ul className="mt-6 space-y-3 text-sm text-ink/70">
                {suitedFor.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24">
          <p className="text-xs uppercase tracking-widest text-ink/40">Live composition examples</p>
          <h3 className="mt-3 font-display text-4xl font-light lg:text-5xl">From recent builds</h3>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {liveCompositionImages.map((src) => (
              <figure key={src} className="overflow-hidden border border-ink/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Live floral composition"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </figure>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
