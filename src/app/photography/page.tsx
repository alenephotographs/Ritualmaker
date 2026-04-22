import Link from "next/link";
import { PhotographyInquiryForm } from "@/components/inquiry/PhotographyInquiryForm";
import {
  photographyPortfolioFeaturedSrc,
  photographyPortfolioImages,
} from "@/lib/photographyPortfolio";

export const metadata = {
  title: "Ritualmaker — Photography",
  description:
    "Photography on the farm, rent the field for portrait sessions, and book seasonal sessions in the Hudson Valley.",
};

const FARM_RENTAL_HERO = "/photos/field-mixed-tulips-cluster.jpg";

type PhotographyPageProps = {
  searchParams?: { kind?: string };
};

export default async function PhotographyPage({ searchParams }: PhotographyPageProps) {
  return (
    <div className="bg-cream">
      <h1 className="sr-only">Photography</h1>

      {/* Top: Ritualmaker farm — rentable */}
      <section
        id="farm"
        className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[1fr_0.95fr] lg:items-end lg:px-8 lg:py-20"
        aria-labelledby="farm-heading"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">
            On the farm
          </p>
          <h2
            id="farm-heading"
            className="mt-2 font-display text-3xl font-light sm:text-4xl lg:text-5xl"
          >
            Rent the field for portrait sessions
          </h2>
          <p className="mt-4 max-w-xl text-sm text-ink/60">
            Photo portrait use of the field when we can make it work with the stand and
            the season. One inquiry; we will confirm dates with you.
          </p>
          <div className="mt-8">
            <Link
              href="/photography?kind=field#inquiry-photography"
              className="inline-block bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal"
            >
              Inquire — field rental
            </Link>
          </div>
        </div>
        <div className="overflow-hidden border border-ink/10 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FARM_RENTAL_HERO}
            alt="Ritualmaker farm and flower field"
            className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-auto lg:min-h-[22rem] lg:max-h-[32rem]"
          />
        </div>
      </section>

      {/* Bottom: Ritualmaker Photography — sessions & coverage */}
      <section
        id="photography-services"
        className="border-t border-ink/10 bg-stone/20"
        aria-labelledby="photo-services-heading"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/40">
                Photography
              </p>
              <h2
                id="photo-services-heading"
                className="mt-2 font-display text-4xl font-light lg:text-5xl"
              >
                Sessions with me
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink/65">
                Short seasonal portrait and portfolio sessions on the farm when the field is
                at its best; engagement and elopement in natural light, following bloom,
                weather, and place; and on location for weddings, venues, and anywhere
                else—documentary coverage in the same language as the flower work.
              </p>
              <div className="mt-8">
                <Link
                  href="/photography#inquiry-photography"
                  className="inline-block border border-ink/20 bg-cream px-6 py-3 text-xs uppercase tracking-widest text-ink/80 hover:bg-ink hover:text-cream"
                >
                  Start photography inquiry
                </Link>
              </div>
            </div>
            <div className="overflow-hidden border border-ink/10 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photographyPortfolioFeaturedSrc}
                alt="Portrait — children in a meadow with summer wildflowers"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-ink/10 bg-cream"
        aria-labelledby="photo-inquiry-heading"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <h2
            id="photo-inquiry-heading"
            className="sr-only"
          >
            Photography inquiry
          </h2>
          <PhotographyInquiryForm
            defaultKind={searchParams?.kind}
            sectionId="inquiry-photography"
          />
        </div>
      </section>

      <section
        className="border-t border-ink/10 bg-gradient-to-b from-cream via-cream to-stone/25"
        aria-labelledby="gallery-heading"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <p
            id="gallery-heading"
            className="text-xs uppercase tracking-[0.2em] text-ink/40"
          >
            Selected work
          </p>
          <p className="mt-3 max-w-2xl font-display text-3xl font-light leading-snug text-ink/90 sm:text-4xl">
            Weddings, portraits, family, and the field—natural light, color, and place.
          </p>
          <div className="mt-12 columns-2 gap-4 sm:gap-5 md:columns-3 lg:columns-4 [&>figure]:mb-4 sm:[&>figure]:mb-5">
            {photographyPortfolioImages
              .filter((src) => src !== photographyPortfolioFeaturedSrc)
              .map((src, index) => (
              <figure
                key={src}
                className="break-inside-avoid overflow-hidden border border-ink/10 bg-stone/20 shadow-sm shadow-ink/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Ritualmaker photography portfolio, image ${index + 1}`}
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full object-cover transition duration-500 hover:opacity-95"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
