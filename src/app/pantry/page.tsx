import { PantryGrid } from "@/components/PantryGrid";
import { sanityClient } from "@/sanity/client";
import { pantryItemsQuery } from "@/sanity/queries";
import type { PantryItem } from "@/sanity/types";

export const metadata = {
  title: "Ritualmaker Pantry",
  description:
    "Ritualmaker Pantry — small-batch goods from the stand: oils, salts, flower sugar, and farm eggs as they are ready.",
};

export default async function PantryPage() {
  const items = await sanityClient.fetch<PantryItem[]>(pantryItemsQuery).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
      <p className="text-xs uppercase tracking-widest text-ink/40">Ritualmaker Pantry</p>
      <h1 className="mt-4 font-display text-5xl font-light lg:text-6xl">
        Ritualmaker Pantry
      </h1>
      <p className="mt-3 text-sm text-ink/50">
        Same self-serve stop as the flowers — a different set of shelves.
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/65">
        Stock shows up as batches are ready. Oils are available now; seasoned salts,
        flower sugar, and farm eggs are added as we go. Buy at the stand in person
        (not the bouquet checkout).
      </p>
      <div className="mt-10">
        <PantryGrid items={items} />
      </div>
    </div>
  );
}
