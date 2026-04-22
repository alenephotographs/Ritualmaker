import { PantryGrid } from "@/components/PantryGrid";
import { sanityClient } from "@/sanity/client";
import { pantryItemsQuery } from "@/sanity/queries";
import type { PantryItem } from "@/sanity/types";

export const metadata = {
  title: "Ritualmaker Pantry",
  description:
    "Small-batch pantry goods from the stand including oils, salts, flower sugar, and upcoming farm eggs.",
};

export default async function PantryPage() {
  const items = await sanityClient.fetch<PantryItem[]>(pantryItemsQuery).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
      <p className="text-xs uppercase tracking-widest text-ink/40">Pantry</p>
      <h1 className="mt-4 font-display text-5xl font-light lg:text-6xl">
        Ritualmaker Pantry
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/65">
        Pantry goods are stocked at the stand as they are finished and ready. Oils are
        currently available, with seasoned salts, flower sugar, and farm eggs arriving
        seasonally.
      </p>
      <div className="mt-10">
        <PantryGrid items={items} />
      </div>
    </div>
  );
}
