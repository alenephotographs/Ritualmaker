"use client";

import type { PantryItem } from "@/sanity/types";
import { categoryLabel, formatUSD } from "@/lib/format";

export function PantryGrid({ items }: { items: PantryItem[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-ink/50">
        Pantry items are coming soon. Check back soon for new stand offerings.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const comingSoon = Boolean(item.comingSoon);
        const isAvailable = item.available !== false && !comingSoon;
        const label = comingSoon
          ? "Coming soon"
          : isAvailable
            ? "Available now"
            : "Out today";

        return (
          <article
            key={item._id}
            className="flex flex-col border border-ink/10 bg-cream"
          >
            <div className="aspect-[3/4] overflow-hidden bg-stone/40">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-ink/30">
                  No image yet
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[10px] uppercase tracking-widest text-ink/40">
                Pantry · {categoryLabel(item.category)}
              </p>
              <h3 className="mt-2 font-display text-2xl font-light">{item.name}</h3>
              <p className="mt-2 text-[11px] uppercase tracking-widest text-ink/45">
                {item.shipsAvailable
                  ? "At the stand · shipping available on this item"
                  : "At the self-serve stand"}
              </p>
              {item.description && (
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {item.description}
                </p>
              )}
              {item.shelfLocation && (
                <p className="mt-3 text-xs italic text-ink/50">
                  At the stand: {item.shelfLocation}
                </p>
              )}
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
                <span className="font-display text-2xl font-light">
                  {comingSoon || !item.priceCents ? "TBD" : formatUSD(item.priceCents)}
                </span>
                <span
                  className={`px-3 py-1 text-[10px] uppercase tracking-widest ${
                    comingSoon
                      ? "bg-bloom/20 text-magenta"
                      : isAvailable
                        ? "bg-moss/15 text-moss"
                        : "bg-ink/10 text-ink/60"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
