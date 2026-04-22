import Link from "next/link";

export const metadata = {
  title: "Ritualmaker Photography",
  description:
    "Photography on the farm, rent the field for portrait sessions, and book seasonal sessions in the Hudson Valley.",
};

const serviceOfferings = [
  {
    title: "Sessions on the farm",
    copy: "Short, seasonal portrait and portfolio sessions with me when the field is at its peak.",
  },
  {
    title: "Engagement + elopement",
    copy: "Natural-light coverage shaped around bloom cycles, weather, and place.",
  },
  {
    title: "On location",
    copy: "Weddings, venues, and elsewhere—documentary coverage in the same language as the flower work.",
  },
];

const originalPhotographyImageUrls = [
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f3694acc4396cc7d660d_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_448.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f38aadd662916a13ae6f_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_184.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f3b578a0112e717079d3_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_373.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f3b57f9e117dc1277fa3_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_118.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f3f744f1ba43a7250a0d__MG_2683.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f3f8add662916a13f984__MG_2692.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f42c6303b030d3b34aa2__MG_2948.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6685f4f9a61fbd641da2d78d_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_727.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6686bd2d8c90811cd053e8b4_606371e4-c0b7-4d1a-aa59-17f83538e764_rw_1200.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/6686bea1eec410ea11b29919__MG_4007.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668711935f0b1c50791f3c61_d57c9a80-7b2b-4730-a0a6-3aca297a1e45_rw_1200.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668718faeea1a5fe7e13e076_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_1079sm.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b41e5dcccb66675f882e2_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_386.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b425f510bdea9ea52514c_202406%20Alene%20-%20G%20-%20Colleen%20and%20Ross_918.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b440935a37bf83f09c097_1048063%20copy.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b45121f29d0dfd5921f1d_ALBUM058.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b45db7900bc74909d3f65__MG_4306.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b46bec39b281a243c01cb__MG_3160.JPG",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668b47d9134dc172d6887b03_ff0dd3ab-f34f-4f29-86f8-2fe7d874a8e8_rw_1920.jpg",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668f3ee91748f61a7e301fbf_Screenshot%202024-07-10%20at%209.55.05%E2%80%AFPM.png",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/668f3ef6bfb7614a729694eb_Screenshot%202024-07-10%20at%209.55.05%E2%80%AFPM.png",
  "https://cdn.prod.website-files.com/668355e7019629426d2886a7/66959f3b68253de35642c742_644c92ae-0e72-4118-bcb7-93841e67f217_rw_1920.jpg",
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

export default function PhotographyPage() {
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
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/65">
            This page is split in two: <strong className="font-medium text-ink/80">field
            rental for photo portrait sessions only</strong> (when the land and the stand
            can support a shoot), and <strong className="font-medium text-ink/80">sessions
            and coverage with me</strong> in part two. You can do one, the other, or both.
          </p>
          <nav
            className="mt-6 flex flex-wrap gap-2"
            aria-label="On this page"
          >
            <a
              href="#farm"
              className="inline-flex items-center border border-ink/15 bg-white px-4 py-2 text-xs uppercase tracking-widest text-ink/75 hover:border-ink/30"
            >
              1 · On the farm
            </a>
            <a
              href="#photography-services"
              className="inline-flex items-center border border-ink/15 bg-white px-4 py-2 text-xs uppercase tracking-widest text-ink/75 hover:border-ink/30"
            >
              2 · Sessions with me
            </a>
          </nav>
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
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink/65">
            Farm rental is for <strong className="font-medium text-ink/80">photo portrait
            sessions only</strong>—a photo day, a small shoot, or a portrait block you are
            bringing your own photographer to. It is not a public park, only a working
            field, so we line up a time, a rough headcount, and the scope of the session,
            then go from there. Saying hi here does not hold a date; we will confirm with you
            if we can make it work.{" "}
            <span className="text-ink/50">
              Want me behind the camera? That is part two—sessions with me—below.
            </span>
          </p>
          <div className="mt-6 max-w-2xl border border-ink/10 bg-white/60 p-5">
            <p className="text-xs uppercase tracking-widest text-ink/40">
              A few gentle notes
            </p>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink/70">
              <li className="flex gap-2">
                <span className="text-ink/35" aria-hidden>
                  ·
                </span>
                <span>
                  We will pick a window that keeps the day calm for the land,
                  the flowers, and anyone at the stand.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-ink/35" aria-hidden>
                  ·
                </span>
                <span>
                  Weather and bloom change week to week. If we need to shift for
                  safety or a soggy field, we will be in touch and figure it out
                  together.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-ink/35" aria-hidden>
                  ·
                </span>
                <span>
                  Please treat the farm kindly—stay on agreed paths, leave the
                  beds for picking another day, and be mindful when customers
                  are at the self-serve stand.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-ink/35" aria-hidden>
                  ·
                </span>
                <span>
                  Drones, extra gear, or a bigger crew? Just ask first so we can
                  say yes or find another plan that still feels good.
                </span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-ink/60">
              When you reach out, we can talk through timing, a simple
              hold-and-confirm, and any paperwork. Nothing scary—just what we
              need so everyone is comfortable.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/on-location?service=photography"
              className="bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal"
            >
              Inquire — field rental
            </Link>
            <a
              href="#photography-services"
              className="border border-ink/20 px-6 py-3 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
            >
              Skip to sessions with me
            </a>
          </div>
          <p className="mt-3 max-w-2xl text-xs text-ink/45">
            The inquiry form opens with photography selected; note it is a portrait session
            on the farm, your timing, and whether it is you plus your photographer.
          </p>
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
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/65">
                Seasonal, place-first sessions and coverage. Separate from renting the
                field on its own, but we can combine both if the timeline and season allow.
              </p>
              <p className="mt-3 text-xs text-ink/45">
                Peak weeks book up; a note early always helps.
              </p>
              <div className="mt-8">
                <Link
                  href="/on-location?service=photography"
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

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {serviceOfferings.map((offering) => (
              <article
                key={offering.title}
                className="border border-ink/10 bg-white p-7"
              >
                <h3 className="font-display text-2xl font-light lg:text-3xl">
                  {offering.title}
                </h3>
                <p className="mt-3 text-sm text-ink/65">{offering.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24"
        aria-labelledby="gallery-heading"
      >
        <p className="text-xs uppercase tracking-widest text-ink/40">
          See the work
        </p>
        <h2
          id="gallery-heading"
          className="mt-3 font-display text-4xl font-light lg:text-5xl"
        >
          More images
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
