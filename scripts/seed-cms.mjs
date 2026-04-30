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
      "Self-serve flowers at 38 Miller Hill Road, Hudson Valley. Order online for pickup or pay cash at the stand.",
    standStatus: "open",
    standMessage: "Restocked through the day",
    address: "38 Miller Hill Road, Hudson Valley, NY",
    mapUrl: defaultMapsUrl,
  },
  faqs: [
    {
      _id: "preprod.faq.01",
      displayOrder: 10,
      question: "How do I pay for flowers?",
      answer: oneLine(
        "Order online on this site for pickup at the stand, or pay cash at the self-serve stand. Pantry item cards say if an item is stand-only or can also ship.",
      ),
    },
    {
      _id: "preprod.faq.02",
      displayOrder: 20,
      question: "Where is the farm stand?",
      answer: oneLine(
        "38 Miller Hill Road, Hudson Valley, NY. Use Maps or the Google link in the footer for hours and photos.",
      ),
    },
    {
      _id: "preprod.faq.03",
      displayOrder: 30,
      question: "What if the shelf I ordered is empty?",
      answer: oneLine(
        "Take the closest same-size bundle and message us on Instagram so we can make it right.",
      ),
    },
    {
      _id: "preprod.faq.04",
      displayOrder: 40,
      question: "Do you do weddings or on-location work?",
      answer: oneLine(
        "Yes — see On location for event florals, pop-up bars, hospitality, and Live Collage™.",
      ),
    },
    {
      _id: "preprod.faq.05",
      displayOrder: 50,
      question: "When are you open?",
      answer: oneLine(
        "The self-serve stand is available around the clock when the season and stand status are open. Check the status pill on the home page; Google has hours and updates.",
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
      "Grown and bundled for the self-serve stand. Order for pickup, or pay cash at the stand.",
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
      "Replace this card with a real seasonal garden offering. Use shelf notes for local pickup details.",
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
  const products = [
    {
      _id: "flower-product.glimmer",
      name: "Glimmer",
      slug: "glimmer",
      publicName: "Glimmer",
      category: "bouquet",
      tier: "small",
      priceCents: 1200,
      shortDescription: "Small seasonal grab bouquet.",
      displayDescription:
        "A simple daily flower offering, freshly cut and easy to take home.",
      active: true,
      inStock: true,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 10,
    },
    {
      _id: "flower-product.blessing",
      name: "Blessing",
      slug: "blessing",
      publicName: "Blessing",
      category: "bouquet",
      tier: "standard",
      priceCents: 1800,
      shortDescription: "Signature Ritualmaker seasonal bouquet.",
      displayDescription:
        "A fuller bouquet for the table, the week, or a thoughtful gift.",
      active: true,
      inStock: true,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 20,
    },
    {
      _id: "flower-product.abundance",
      name: "Abundance",
      slug: "abundance",
      publicName: "Abundance",
      category: "bouquet",
      tier: "premium",
      priceCents: 2600,
      shortDescription: "Larger gift-ready seasonal bouquet.",
      displayDescription:
        "An abundant seasonal arrangement for sharing, gifting, or anchoring a space.",
      active: true,
      inStock: true,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 30,
    },
    {
      _id: "flower-product.table-ritual-set",
      name: "Glimmer + Pantry add-on",
      slug: "glimmer-pantry-add-on",
      legacySlugs: ["table-ritual-set"],
      publicName: "Glimmer + Pantry add-on",
      category: "bundle",
      tier: "",
      priceCents: 2200,
      shortDescription: "Glimmer bouquet + seasonal pantry add-on.",
      displayDescription: "Glimmer bouquet + seasonal pantry add-on.",
      active: false,
      inStock: false,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 40,
    },
    {
      _id: "flower-product.kitchen-ritual-set",
      name: "Blessing + Pantry add-on",
      slug: "blessing-pantry-add-on",
      legacySlugs: ["kitchen-ritual-set"],
      publicName: "Blessing + Pantry add-on",
      category: "bundle",
      tier: "",
      priceCents: 3200,
      shortDescription: "Blessing bouquet + seasonal pantry add-on.",
      displayDescription: "Blessing bouquet + seasonal pantry add-on.",
      active: false,
      inStock: false,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 50,
    },
    {
      _id: "flower-product.gift-ritual",
      name: "Abundance + Pantry add-on",
      slug: "abundance-pantry-add-on",
      legacySlugs: ["gift-ritual"],
      publicName: "Abundance + Pantry add-on",
      category: "bundle",
      tier: "",
      priceCents: 4200,
      shortDescription: "Abundance bouquet + seasonal pantry add-on.",
      displayDescription: "Abundance bouquet + seasonal pantry add-on.",
      active: false,
      inStock: false,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 60,
    },
    {
      _id: "flower-product.garden-oil",
      name: "Garden Oil",
      slug: "garden-oil",
      publicName: "Garden Oil",
      category: "pantry",
      tier: "",
      priceCents: 1400,
      shortDescription: "Seasonal botanical-infused garden oil.",
      displayDescription:
        "A small-batch garden oil infused with seasonal herbs and botanicals, made as a simple kitchen ritual.",
      active: true,
      inStock: true,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 70,
    },
    {
      _id: "flower-product.botanical-sugar",
      name: "Botanical Sugar",
      slug: "botanical-sugar",
      publicName: "Botanical Sugar",
      category: "pantry",
      tier: "",
      priceCents: 1000,
      shortDescription: "Seasonal flower and herb sugar.",
      displayDescription:
        "A fragrant botanical sugar for tea, baking, fruit, cocktails, and small daily rituals.",
      active: true,
      inStock: true,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 80,
    },
    {
      _id: "flower-product.herbal-tea",
      name: "Herbal Tea",
      slug: "herbal-tea",
      publicName: "Herbal Tea",
      category: "pantry",
      tier: "",
      priceCents: 1200,
      shortDescription: "Seasonal herbal tea blend.",
      displayDescription:
        "A small-batch herbal tea blend made with garden-grown and seasonal botanicals.",
      active: true,
      inStock: true,
      recurringItem: true,
      billingLabel: "Flower Service",
      taxCategory: "flower_service",
      sortOrder: 90,
    },
  ];

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
