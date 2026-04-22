import Link from "next/link";

type CrossPromoStripProps = {
  className?: string;
};

const SERVICE_CARDS = [
  {
    href: "/on-location",
    eyebrow: "On location",
    title: "On site",
    description:
      "Weddings, pop-up flower bars, restaurants, hotels, standing orders, and Live Collage™—we come to you.",
  },
  {
    href: "/photography",
    eyebrow: "Ritualmaker Photography",
    title: "Photography & farm",
    description:
      "Sessions with me, or rent the field for a portrait session with your own photographer—two parts, one page.",
  },
  {
    href: "/pantry",
    eyebrow: "Ritualmaker Pantry",
    title: "Pantry",
    description: "Oils and small-batch goods sold at the stand; shipping when we are ready.",
  },
] as const;

export function CrossPromoStrip({ className = "" }: CrossPromoStripProps) {
  return (
    <section
      id="services"
      className={`scroll-mt-20 bg-stone/30 py-10 ${className}`}
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2
          id="services-heading"
          className="font-display text-3xl font-light sm:text-4xl"
        >
          Not just the stand
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          The flower stand is the home base (shop above). On location is floristry off the
          stand: weddings, pop-up bars, venues, and Live Collage™. The photography page is
          sessions with me and field rental for portrait sessions; pantry is its own page.
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-ink/35">
          On site (weddings, pop-ups, Live) → Photography &amp; farm → Pantry
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CARDS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group border border-ink/10 bg-cream px-5 py-4 transition-colors hover:border-ink/25"
            >
              <p className="text-[10px] uppercase tracking-widest text-ink/40 group-hover:text-ink/55">
                {item.eyebrow}
              </p>
              <h3 className="mt-1 font-display text-2xl font-light">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-snug text-ink/60">{item.description}</p>
            </Link>
          ))}
        </div>
        <p className="mt-5 text-sm text-ink/50">
          Looking for day-to-day bouquets?{" "}
          <a
            href="/#shop"
            className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            Jump to shop the stand
          </a>
        </p>
      </div>
    </section>
  );
}
