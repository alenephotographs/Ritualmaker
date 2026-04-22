import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-01";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;

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

async function ensureVendors() {
  for (const vendor of vendors) {
    await client.createIfNotExists(vendor);
  }
}

async function migrateBouquets() {
  const bouquets = await client.fetch(
    `*[_type == "bouquet" && !defined(vendor)]{_id, farm}`,
  );
  for (const bouquet of bouquets) {
    const vendorId =
      bouquet.farm === "wonderland-ridge"
        ? "vendor.wonderland-ridge"
        : "vendor.ritualmaker";
    await client.patch(bouquet._id).set({ vendor: { _type: "reference", _ref: vendorId } }).commit();
  }
  return bouquets.length;
}

async function migratePantry() {
  const pantryItems = await client.fetch(
    `*[_type == "pantryItem" && !defined(vendor)]{_id}`,
  );
  for (const item of pantryItems) {
    await client
      .patch(item._id)
      .set({ vendor: { _type: "reference", _ref: "vendor.ritualmaker" } })
      .commit();
  }
  return pantryItems.length;
}

async function run() {
  await ensureVendors();
  const bouquetCount = await migrateBouquets();
  const pantryCount = await migratePantry();
  console.log(`Vendors ensured. Bouquets migrated: ${bouquetCount}. Pantry migrated: ${pantryCount}.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
