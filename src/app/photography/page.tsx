import Link from "next/link";
import { PhotographyInquiryForm } from "@/components/inquiry/PhotographyInquiryForm";
import { sanityClient } from "@/sanity/client";
import { resolveContactLinks } from "@/lib/siteContact";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";

export const metadata = {
  title: "Ritualmaker Photography",
  description:
    "Photography on the farm, rent the field for portrait sessions, and book seasonal sessions in the Hudson Valley.",
};

const originalPhotographyImageUrls = [
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f3f744f1ba43a7250a0d__MG_2683.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f3f8add662916a13f984__MG_2692.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f42c6303b030d3b34aa2__MG_2948.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f4f9a61fbd641da2d78d_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_727.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6686bea1eec410ea11b29919__MG_4007.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668718faeea1a5fe7e13e076_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_1079sm.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b41e5dcccb66675f882e2_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_386.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b425f510bdea9ea52514c_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_918.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b440935a37bf83f09c097_1048063%20copy.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b45121f29d0dfd5921f1d_ALBUM058.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b45db7900bc74909d3f65__MG_4306.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b46bec39b281a243c01cb__MG_3160.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b47d9134dc172d6887b03_ff0dd3ab-f34f-4f29-86f8-2fe7d874a8e8_rw_1920.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/682e1500a5f5b08c49bcf0d9__MG_5278.jpg",
  "https://cdn.prod.website-files.com/66be4e84949884104a5e61c8/66be514dc001d577364153cc_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_1105-1.jpg",
  "https://cdn.prod.website-files.com/66be4e84949884104a5e61c8/66be5e709f72c1653dbb15e3_Alene%20-%20202406%20Jennas%20Bridal%20Shower%20-7.jpg",
  "https://cdn.prod.website-files.com/66be4e84949884104a5e61c8/66bfa3366b8fef22f0e5f915_ALBUM077.JPG",
  "https://cdn.prod.website-files.com/66be4e84949884104a5e61c8/66bfa9fc6925c7d8dba1092a__MG_3527.JPG",
  "https://cdn.prod.website-files.com/66be4e84949884104a5e61c8/6712b303f045700b989403d1__MG_0911.jpg",
  "https://cdn.prod.website-files.com/66be4e84949884104a5e61c8/686309232deb8c4280279b4d_PierroLiamEngagement_71.jpg",
  "https://cdn.prod.website-files.com/66be4e84949884104a5e61c8/6993e43f01f48514ab615b7d__0240128.jpg",
  "https://cdn.prod.website-files.com/66be4e84949884104a5e61c8/6993e658e1bc23a8fe389ea6__0240567.jpg",
];

const FARM_RENTAL_HERO = "/photos/field-mixed-tulips-cluster.jpg";

type PhotographyPageProps = {
  searchParams?: { kind?: string };
};

export default async function PhotographyPage({ searchParams }: PhotographyPageProps) {
  const siteSettings = await sanityClient
    .fetch<SiteSettings | null>(siteSettingsQuery)
    .catch(() => null);
  const contact = resolveContactLinks(siteSettings);

  return (
    <div className="bg-cream">
      <header className="border-b border-ink/10 bg-cream px-6 pt-12 lg:px-8 lg:pt-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-widest text-ink/40">
            Ritualmaker Photography
          </p>
          <h1 className="mt-3 font-display text-4xl font-light sm:text-5xl lg:text-6xl">
            Photography &amp; the farm
          </h1>
        </div>
      </header>

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
                src={originalPhotographyImageUrls[0]}
                alt="Ritualmaker Photography — portfolio sample"
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
            contact={contact}
            defaultKind={searchParams?.kind}
            sectionId="inquiry-photography"
          />
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24"
        aria-labelledby="gallery-heading"
      >
        <h2
          id="gallery-heading"
          className="max-w-4xl font-display text-4xl font-light leading-tight lg:text-5xl"
        >
          See Ritualmaker Photography&rsquo;s work
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {originalPhotographyImageUrls.map((src) => (
            <figure key={src} className="aspect-square overflow-hidden bg-stone/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Ritualmaker Photography portfolio"
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
