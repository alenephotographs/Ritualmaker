/**
 * One-time / occasional repair: map legacy flowerProduct categories to shop values.
 * - pantry → unchanged
 * - bouquet, bundle, wedding_event, vendor_item, other → flowers
 *
 * Requires: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
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

async function run() {
  const ids = await client.fetch(
    `*[_type == "flowerProduct" && category != "pantry" && category != "flowers"]._id`,
  );
  if (!ids?.length) {
    console.log("No documents to update.");
    return;
  }
  console.log(`Patching ${ids.length} flowerProduct document(s) to category "flowers"...`);
  for (const id of ids) {
    await client.patch(id).set({ category: "flowers" }).commit();
  }
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
