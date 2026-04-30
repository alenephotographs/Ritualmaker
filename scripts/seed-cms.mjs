/**
 * Pushes preproduction / canonical copy into the Sanity dataset:
 * site settings, FAQs, example bouquets (Ritualmaker vendor), optional sample pantry.
 *
 * Requires: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
 *
 *   pnpm run sanity:seed
 *
 * Re-running overwrites preprod-tagged site settings, bouquets, and pantry; it replaces
 * the entire FAQ set (all `faq` documents are deleted, then the canonical five are written).
 * Other non-seed bouquets and pantry rows are left in place.
 */

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_WRITE_TOKEN",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const defaultMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("38 Miller Hill Road, Hudson Valley, NY")}`;

/** Single-block portable text (plain paragraph). */
function oneLine(text) {
  const key = `b${Math.random().toString(36).slice(2, 9)}`;
  return [
    {
      _type: "block",
      _key: key,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `${key}s`,
          text,
          marks: [],
        },
      ],
    },
  ];
}

const CANON = {
  site: {
    title: "Ritualmaker",
    tagline: "Fresh flowers in the neighborhood, 24/7",
    description:
      "Self-serve flowers at 38 Miller Hill Road, Hudson Valley. Stop by and buy what is fresh at the stand.",
    standStatus: "open",
    standMessage: "Restocked through the day",
    address: "38 Miller Hill Road, Hudson Valley, NY",
    mapUrl: defaultMapsUrl,
  },
  faqs: [
    {
      _id: "preprod.faq.01",
      displayOrder: 10,
      question: "How do I buy flowers?",
      answer: oneLine(
        "We offer self-serve flowers at our roadside stand. Bouquets and pantry items are refreshed regularly — stop by and take what you need.",
      ),
    },
    {
      _id: "preprod.faq.02",
      displayOrder: 20,
      question: "What’s available today?",
      answer: oneLine(
        "Availability changes daily based on what’s in bloom and what has been harvested. If the stand is open, there are fresh flowers, pantry items, and seasonal offerings out. Popular sizes may sell out — check back often.",
      ),
    },
    {
      _id: "preprod.faq.03",
      displayOrder: 30,
      question: "Which payments can I use?",
      answer: oneLine(
        "Cash and Venmo are accepted at the stand.",
      ),
    },
    {
      _id: "preprod.faq.04",
      displayOrder: 40,
      question: "Can I reserve a bouquet?",
      answer: oneLine(
        "We do not hold bouquets at the stand, but you can reach out for custom or event orders.",
      ),
    },
    {
      _id: "preprod.faq.05",
      displayOrder: 50,
      question: "Are your flowers grown with pesticides?",
      answer: oneLine(
        "No. Our flowers are not grown with pesticides.",
      ),
    },
    {
      _id: "preprod.faq.06",
      displayOrder: 60,
      question: "Do you sell anything besides flowers?",
      answer: oneLine(
        "Yes. Our garden pantry includes seasonal items like Garden Oil, Botanical Sugar, and Herbal Tea. In summer, we also sell seasonal organic heirloom vegetables when available.",
      ),
    },
    {
      _id: "preprod.faq.07",
      displayOrder: 70,
      question: "Do you offer weddings and events?",
      answer: oneLine(
        "Yes. We design florals for weddings, gatherings, and installations — everything from personal flowers to full event styling. Use the inquiry form on the On Location page to get in touch.",
      ),
    },
    {
      _id: "preprod.faq.08",
      displayOrder: 80,
      question: "What types of event work do you do?",
      answer: oneLine(
        "We offer weddings, personal flowers, ceremony flowers, reception flowers, pop-up flower bars, restaurants and hotels, custom installs, and seasonal floral work.",
      ),
    },
    {
      _id: "preprod.faq.09",
      displayOrder: 90,
      question: "Can I order custom flowers?",
      answer: oneLine(
        "Yes. We take custom orders for events and special requests depending on availability.",
      ),
    },
    {
      _id: "preprod.faq.10",
      displayOrder: 100,
      question: "Can I purchase flowers in bulk?",
      answer: oneLine(
        "Yes — reach out for bulk stems, event prep, or large orders.",
      ),
    },
    {
      _id: "preprod.faq.11",
      displayOrder: 110,
      question: "Can we take photos in the flower field?",
      answer: oneLine(
        "Yes, when the season and schedule allow. See the Photography section or reach out to confirm availability.",
      ),
    },
    {
      _id: "preprod.faq.12",
      displayOrder: 120,
      question: "How can we get in touch?",
      answer: oneLine(
        "Use the contact form or email ritualmakerny@gmail.com.",
      ),
    },
  ],
};

async function ensureVendors() {
  const vendors = [
    {
      _id: "vendor.ritualmaker",
      _type: "vendor",
      name: "Ritualmaker",
      slug: { _type: "slug", current: "ritualmaker" },
      active: true,
    },
    {
      _id: "vendor.wonderland-ridge",
      _type: "vendor",
      name: "Wonderland Ridge Flower Farm",
      slug: { _type: "slug", current: "wonderland-ridge-flower-farm" },
      active: true,
    },
  ];
  for (const v of vendors) {
    await client.createIfNotExists(v);
  }
}

async function seedSiteSettings() {
  const existing = await client.fetch(
    `*[_type == "siteSettings"] | order(_updatedAt desc)[0]{_id}`,
  );
  const doc = {
    _type: "siteSettings",
    ...CANON.site,
  };
  if (existing?._id) {
    await client.patch(existing._id).set(CANON.site).commit();
    console.log(`Site settings updated (${existing._id})`);
  } else {
    const created = await client.create(doc);
    console.log(`Site settings created (${created._id})`);
  }
}

async function seedFaqs() {
  /** Published and draft (drafts.*) so Studio drafts do not come back. */
  const published = await client.fetch(
    `*[_type == "faq" && !string::startsWith(_id, "drafts.")]._id`,
  );
  const draftPages = await client.fetch(`*[_id in path("drafts.*") && _type == "faq"]._id`);
  const existingIds = [...new Set([...published, ...draftPages])];
  for (const id of existingIds) {
    await client.delete(id);
  }
  if (existingIds.length) {
    console.log(`Removed ${existingIds.length} existing FAQ(s) (including drafts)`);
  }
  for (const row of CANON.faqs) {
    const { _id, ...rest } = row;
    await client.createOrReplace({ _id, _type: "faq", ...rest });
  }
  console.log(`FAQs written: ${CANON.faqs.length}`);
}

async function seedBouquets() {
  const heroPath = "/photos/field-mixed-tulips-cluster.jpg";
  const base = (suffix, name, size, priceCents, shelf, displayOrder) => ({
    _id: `preprod.bouquet.${suffix}`,
    _type: "bouquet",
    name,
    slug: { _type: "slug", current: `seasonal-mix-${size}-preprod` },
    farm: "ritualmaker",
    vendor: { _type: "reference", _ref: "vendor.ritualmaker" },
    size,
    priceCents,
    shelfLocation: shelf,
    available: true,
    displayOrder,
    description:
      "Grown and bundled for the self-serve stand. Stop by and buy what is available.",
    highlights: ["Cut on the farm", "At the stand 24/7 when open", "Hudson Valley–grown"],
    externalImageUrl: heroPath,
  });

  const bouquets = [
    base("large", "Seasonal mix — large", "large", 3000, "Top shelf, left", 10),
    base("small", "Seasonal mix — small", "small", 2000, "Lower shelf", 20),
  ];
  for (const b of bouquets) {
    await client.createOrReplace(b);
  }
  console.log(`Example bouquets upserted: ${bouquets.length} (id preprod.bouquet.*)`);
}

async function seedPantry() {
  const item = {
    _id: "preprod.pantry.sample",
    _type: "pantryItem",
    name: "Pantry sample (replace with your product)",
    slug: { _type: "slug", current: "pantry-sample" },
    category: "other",
    vendor: { _type: "reference", _ref: "vendor.ritualmaker" },
    description:
      "Replace this card with a real seasonal garden offering. Use shelf notes for stand details.",
    priceCents: 1200,
    shelfLocation: "Pantry shelf (sample)",
    available: true,
    comingSoon: true,
    shipsAvailable: false,
    displayOrder: 5,
  };
  await client.createOrReplace(item);
  console.log("Sample pantry item upserted: preprod.pantry.sample (Coming soon = on; edit in Studio)");
}

async function seedFlowerProducts() {
  const { requiredOfferings } = await import("../src/lib/requiredOfferings.ts");
  const products = requiredOfferings;

  for (const product of products) {
    const { _id, slug, legacySlugs = [], ...rest } = product;
    const existing = await client.fetch(
      `*[
        _type == "flowerProduct" &&
        (
          slug.current == $slug ||
          slug.current in $legacySlugs ||
          _id == $id
        )
      ][0]{_id}`,
      { id: _id, slug, legacySlugs },
    );
    const doc = {
      ...rest,
      _type: "flowerProduct",
      slug: { _type: "slug", current: slug },
      vendor: { _type: "reference", _ref: "vendor.ritualmaker" },
    };
    if (existing?._id) {
      await client.patch(existing._id).set(doc).commit();
    } else {
      await client.create({ _id, ...doc });
    }
  }
  console.log(`Flower service products upserted: ${products.length}`);
}

async function run() {
  await ensureVendors();
  await seedSiteSettings();
  await seedFaqs();
  await seedBouquets();
  await seedFlowerProducts();
  await seedPantry();
  console.log("Done. Deploy schema if needed: pnpm run sanity:deploy-schema");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
