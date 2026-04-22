import Link from "next/link";

export const metadata = {
  title: "Ritualmaker Photography",
  description:
    "A quiet photography practice rooted in the Ritualmaker landscape, from farm sessions to weddings.",
};

const offerings = [
  {
    title: "Farm sessions",
    copy: "Short, seasonal portrait sessions held when the field is at its peak.",
  },
  {
    title: "Engagement + elopement",
    copy: "Natural-light coverage shaped around bloom cycles, weather, and place.",
  },
  {
    title: "Weddings",
    copy: "Documentary-forward wedding photography in the same visual language as Ritualmaker florals.",
  },
  {
    title: "Property rental",
    copy: "The Ritualmaker property is available to rent for select photographers.",
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

export default function PhotographyPage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1fr_0.95fr] lg:items-end lg:px-8 lg:py-24">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">Photography</p>
          <h1 className="mt-4 font-display text-5xl font-light lg:text-6xl">
            Ritualmaker Photography
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink/65">
            Photography here stays close to the land: floral, seasonal, and
            intentionally unhurried. Sessions are kept focused so the work feels
            simple and true to place.
          </p>
          <p className="mt-3 text-xs text-ink/45">
            Seasonal session windows are limited and fill quickly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/weddings?service=photography"
              className="bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal"
            >
              Start inquiry
            </Link>
          </div>
        </div>
        <div className="overflow-hidden border border-ink/10 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalPhotographyImageUrls[0]}
            alt="Ritualmaker Photography portfolio sample"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {offerings.map((offering) => (
            <article key={offering.title} className="border border-ink/10 bg-white p-7">
              <h2 className="font-display text-3xl font-light">{offering.title}</h2>
              <p className="mt-3 text-sm text-ink/65">{offering.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 border border-ink/10 bg-white p-7">
          <p className="text-xs uppercase tracking-widest text-ink/40">
            For other photographers
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/65">
            We also host outside photographers for select rentals, depending on
            season, field conditions, and schedule.
          </p>
          <Link
            href="/weddings?service=photography"
            className="mt-5 inline-block border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
          >
            Request rental details
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-24">
        <p className="text-xs uppercase tracking-widest text-ink/40">
          Original Ritualmaker Photography portfolio
        </p>
        <h2 className="mt-3 font-display text-4xl font-light lg:text-5xl">
          Full image collection
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {originalPhotographyImageUrls.map((src) => (
            <figure key={src} className="aspect-square overflow-hidden bg-stone/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Ritualmaker Photography portfolio image"
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
