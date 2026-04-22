import Link from "next/link";

type CrossPromoStripProps = {
  className?: string;
};

export function CrossPromoStrip({ className = "" }: CrossPromoStripProps) {
  return (
    <section className={`bg-stone/30 py-14 ${className}`} aria-label="Ritualmaker services">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-ink/40">
          Also from Ritualmaker
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/photography"
            className="border border-ink/10 bg-cream p-5 transition-colors hover:border-ink/30"
          >
            <p className="text-[10px] uppercase tracking-widest text-ink/40">
              Photography
            </p>
            <h3 className="mt-2 font-display text-2xl font-light">
              Ritualmaker Photography
            </h3>
            <p className="mt-2 text-sm text-ink/65">
              Farm pop-ups, engagements, elopements, and wedding coverage rooted in
              the flower field.
            </p>
          </Link>
          <Link
            href="/live"
            className="border border-ink/10 bg-cream p-5 transition-colors hover:border-ink/30"
          >
            <p className="text-[10px] uppercase tracking-widest text-ink/40">Live</p>
            <h3 className="mt-2 font-display text-2xl font-light">
              Ritualmaker Live Collage™
            </h3>
            <p className="mt-2 text-sm text-ink/65">
              A floral performance built in real time during your event as guest
              entertainment.
            </p>
          </Link>
          <Link
            href="/weddings"
            className="border border-ink/10 bg-cream p-5 transition-colors hover:border-ink/30"
          >
            <p className="text-[10px] uppercase tracking-widest text-ink/40">
              Weddings + Events
            </p>
            <h3 className="mt-2 font-display text-2xl font-light">Plan your event</h3>
            <p className="mt-2 text-sm text-ink/65">
              Explore event florals and Live Collage™ in one calm, simple inquiry
              flow.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
