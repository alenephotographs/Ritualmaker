"use client";

import { useEffect, useMemo, useState } from "react";
import type { Bouquet } from "@/sanity/types";
import { farmLabel, formatUSD, sizeLabel } from "@/lib/format";

async function readJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

type BouquetGridProps = {
  bouquets: Bouquet[];
};

export function BouquetGrid({ bouquets }: BouquetGridProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastBouquetId, setLastBouquetId] = useState<string | null>(null);
  const [ctaVariant, setCtaVariant] = useState<"buy" | "checkout">("buy");

  const availableBouquets = useMemo(
    () => bouquets.filter((bouquet) => bouquet.available),
    [bouquets],
  );
  const mostBoughtId = availableBouquets[0]?._id;
  const lastBouquet = bouquets.find((bouquet) => bouquet._id === lastBouquetId);

  useEffect(() => {
    try {
      const lastId = window.localStorage.getItem("ritualmaker:lastBouquetId");
      if (lastId) setLastBouquetId(lastId);

      const variant = window.localStorage.getItem(
        "ritualmaker:buyCtaVariant",
      ) as "buy" | "checkout" | null;
      if (variant === "buy" || variant === "checkout") {
        setCtaVariant(variant);
      } else {
        const assigned = Math.random() < 0.5 ? "buy" : "checkout";
        window.localStorage.setItem("ritualmaker:buyCtaVariant", assigned);
        setCtaVariant(assigned);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    async function trackView() {
      if (!ctaVariant) return;
      try {
        const key = `ritualmaker:ctaViewed:${ctaVariant}:${window.location.pathname}`;
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "1");
        await fetch("/api/analytics/cta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "cta_view",
            variant: ctaVariant,
            itemType: "bouquet",
            path: window.location.pathname,
          }),
          keepalive: true,
        });
      } catch {
        // ignore analytics errors
      }
    }
    void trackView();
  }, [ctaVariant]);

  async function buy(bouquet: Bouquet) {
    setError(null);
    setLoadingId(bouquet._id);
    try {
      try {
        await fetch("/api/analytics/cta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "cta_click",
            variant: ctaVariant,
            itemType: "bouquet",
            itemId: bouquet._id,
            path: window.location.pathname,
          }),
          keepalive: true,
        });
      } catch {
        // ignore analytics errors
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bouquetId: bouquet._id,
          ctaVariant,
        }),
      });
      const data = await readJsonSafe(res);
      const errorMessage =
        typeof data.error === "string" ? data.error : "Checkout failed";
      const checkoutUrl = typeof data.url === "string" ? data.url : null;
      if (!res.ok || !checkoutUrl) throw new Error(errorMessage);
      try {
        window.localStorage.setItem("ritualmaker:lastBouquetId", bouquet._id);
      } catch {
        // ignore storage errors
      }
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoadingId(null);
    }
  }

  if (!bouquets.length) {
    return (
      <p className="text-sm text-ink/50">
        Nothing listed yet — check back.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 border border-magenta/40 bg-bloom/15 px-4 py-3 text-sm text-magenta">
          {error}
        </div>
      )}
      {lastBouquet && lastBouquet.available && (
        <div className="mb-6 border border-moss/30 bg-moss/10 px-4 py-4">
          <p className="text-xs uppercase tracking-widest text-moss">
            Order again
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-ink/75">
              {lastBouquet.name} · {formatUSD(lastBouquet.priceCents)}
            </p>
            <button
              type="button"
              onClick={() => buy(lastBouquet)}
              disabled={loadingId === lastBouquet._id}
              aria-label={
                loadingId === lastBouquet._id
                  ? "Starting checkout"
                  : `${ctaVariant === "checkout" ? "Checkout" : "Order"} for ${lastBouquet.name}`
              }
              className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-cream hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              {loadingId === lastBouquet._id
                ? "Starting..."
                : ctaVariant === "checkout"
                  ? "Checkout"
                  : "Order"}
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {bouquets.map((b) => (
          <article
            key={b._id}
            className="flex flex-col border border-ink/10 bg-cream"
          >
            <div className="aspect-[3/4] overflow-hidden bg-stone/40">
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.imageUrl}
                  alt={b.name}
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
                {farmLabel(b.farm)} · {sizeLabel(b.size)}
              </p>
              {b._id === mostBoughtId && (
                <p className="mt-2 inline-flex w-fit bg-moss/15 px-2 py-1 text-[10px] uppercase tracking-widest text-moss">
                  Popular
                </p>
              )}
              <h3 className="mt-2 font-display text-2xl font-light">
                {b.name}
              </h3>
              {b.description && (
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {b.description}
                </p>
              )}
              {b.shelfLocation && (
                <p className="mt-3 text-xs italic text-ink/50">
                  At the stand: {b.shelfLocation}
                </p>
              )}
              {b.highlights && b.highlights.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-xs text-ink/60">
                  {b.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-moss">·</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
                <span className="font-display text-2xl font-light">
                  {formatUSD(b.priceCents)}
                </span>
                <button
                  type="button"
                  disabled={!b.available || loadingId === b._id}
                  onClick={() => buy(b)}
                  aria-label={
                    !b.available
                      ? `${b.name} is out today`
                      : loadingId === b._id
                        ? `Starting checkout for ${b.name}`
                        : `${ctaVariant === "checkout" ? "Checkout" : "Order"} for ${b.name}`
                  }
                  className="bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/20"
                >
                  {!b.available
                    ? "Out today"
                    : loadingId === b._id
                      ? "Starting..."
                      : ctaVariant === "checkout"
                        ? "Checkout"
                        : "Order"}
                </button>
              </div>
              {!b.available && availableBouquets.length > 0 && (
                <p className="mt-3 text-xs text-ink/55">
                  Try{" "}
                  {(
                    availableBouquets.find(
                      (choice) => choice._id !== b._id && choice.size === b.size,
                    ) ?? availableBouquets[0]
                  ).name}
                  {" "}instead.
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
