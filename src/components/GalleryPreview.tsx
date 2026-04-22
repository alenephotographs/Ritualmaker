import type { ArchivePhoto } from "@/sanity/types";

function srcOf(p: ArchivePhoto): string | null {
  return p.externalUrl ?? p.imageUrl ?? null;
}

export function GalleryPreview({ photos }: { photos: ArchivePhoto[] }) {
  if (!photos.length) return null;

  return (
    <section
      id="gallery"
      className="bg-magenta py-20 lg:py-28"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-cream/40">
              From the field
            </p>
            <h2
              id="gallery-heading"
              className="mt-3 font-display text-4xl font-light text-cream lg:text-5xl"
            >
              What's blooming this week.
            </h2>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.slice(0, 8).map((p) => {
            const src = srcOf(p);
            if (!src) return null;
            return (
              <figure
                key={p._id}
                className="group aspect-square overflow-hidden bg-cream/5"
              >
                {p.kind === "video" ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    src={src}
                    muted
                    loop
                    playsInline
                    autoPlay
                    aria-label={p.caption ?? "Video from Ritualmaker field"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={p.alt ?? p.caption ?? "Photo from Ritualmaker field"}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
