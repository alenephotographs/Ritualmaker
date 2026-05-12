import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

export type RequiredOffering = {
  _id: string;
  name: string;
  slug: string;
  publicName: string;
  category: "flowers" | "pantry";
  tier: "small" | "standard" | "premium" | "";
  priceCents: number;
  shortDescription: string;
  displayDescription: string;
  active: boolean;
  inStock: boolean;
  recurringItem: boolean;
  shipsNationwide?: boolean;
  billingLabel: "Flower Service";
  taxCategory: "flower_service";
  sortOrder: number;
};

export const requiredOfferings: RequiredOffering[] = [
  {
    _id: "flower-product.glimmer",
    name: "Glimmer",
    slug: "glimmer",
    publicName: "Glimmer",
    category: "flowers",
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
    category: "flowers",
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
    category: "flowers",
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
    shipsNationwide: true,
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: 70,
  },
  {
    _id: "flower-product.herbal-tea",
    name: "Herbal Tea",
    slug: "herbal-tea",
    publicName: "Herbal Tea",
    category: "pantry",
    tier: "",
    priceCents: 1000,
    shortDescription: "Seasonal herbal tea blend.",
    displayDescription:
      "A small-batch herbal tea blend made with garden-grown and seasonal botanicals.",
    active: true,
    inStock: true,
    recurringItem: true,
    shipsNationwide: true,
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: 80,
  },
  {
    _id: "flower-product.garden-oil",
    name: "Garden Oil",
    slug: "garden-oil",
    publicName: "Garden Oil",
    category: "pantry",
    tier: "",
    priceCents: 1400,
    shortDescription: "Seasonal botanical-infused extra virgin olive oil.",
    displayDescription:
      "An 8 oz extra virgin olive oil infused with seasonal herbs and botanicals, made as a simple kitchen ritual.",
    active: true,
    inStock: true,
    recurringItem: true,
    shipsNationwide: true,
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: 90,
  },
] ;

/**
 * Creates missing canonical SKUs only. Does **not** overwrite existing documents —
 * otherwise every owner admin load would reset price, quantity, inStock, etc. to presets.
 */
export async function ensureRequiredOfferings() {
  if (!hasSanityWriteClient()) return;

  for (const offering of requiredOfferings) {
    const { _id, slug, ...fields } = offering;
    const existing = await sanityWriteClient.fetch<{ _id: string } | null>(
      `*[_type == "flowerProduct" && (slug.current == $slug || _id == $id)][0]{_id}`,
      { id: _id, slug },
    );
    if (existing?._id) continue;

    const doc = {
      ...fields,
      _type: "flowerProduct",
      slug: { _type: "slug", current: slug },
      vendor: { _type: "reference", _ref: "vendor.ritualmaker" },
    };
    await sanityWriteClient.create({ _id, ...doc });
  }

  /** Turn on nationwide shipping for canonical pantry SKUs already in CMS (does not touch price/stock). */
  for (const offering of requiredOfferings) {
    if (!offering.shipsNationwide) continue;
    const existing = await sanityWriteClient.fetch<{ _id: string; shipsNationwide?: boolean } | null>(
      `*[_type == "flowerProduct" && (slug.current == $slug || _id == $id)][0]{_id, shipsNationwide}`,
      { id: offering._id, slug: offering.slug },
    );
    if (existing?.shipsNationwide === true) continue;
    if (existing?._id) {
      await sanityWriteClient.patch(existing._id).set({ shipsNationwide: true }).commit();
    }
  }
}
