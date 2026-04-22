import type { Review, SiteSettings } from "@/sanity/types";

export function ReviewsSection({
  reviews,
  settings,
}: {
  reviews: Review[];
  settings: SiteSettings | null;
}) {
  if (!reviews.length) return null;

  return (
    <section
      id="reviews"
      className="bg-cream py-20 lg:py-28"
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-ink/40">
          Real words, real customers
        </p>
        <h2
          id="reviews-heading"
          className="mt-3 font-display text-4xl font-light lg:text-5xl"
        >
          Fresh flowers, happy neighbors.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <blockquote
              key={r._id}
              className="border-l-2 border-moss/40 bg-stone/30 p-6"
            >
              <p className="font-display text-lg font-light italic leading-relaxed text-ink/85">
                “{r.quote}”
              </p>
              <footer className="mt-4 text-sm">
                <span className="font-medium text-ink">{r.name}</span>
                {r.source && (
                  <span className="text-ink/40"> · {r.source}</span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>

        {settings?.googleReviewUrl && (
          <div className="mt-12">
            <a
              href={settings.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-ink/20 px-6 py-3 text-xs uppercase tracking-widest text-ink/70 transition-colors hover:bg-ink hover:text-cream"
            >
              Leave a Google review
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
