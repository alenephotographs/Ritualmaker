"use client";

import { useEffect, useMemo, useState } from "react";
import type { Bouquet, FlowerProduct } from "@/sanity/types";
import { farmLabel, formatUSD, sizeLabel } from "@/lib/format";

const RITUAL_BUNDLE_DISCOUNT_CENTS = 500;

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
  flowerProducts?: FlowerProduct[];
  /** Shipped US checkout: hide stand-only promos and adjust copy. */
  shopMode?: "stand" | "shipped";
};

type CartLine = {
  item: FlowerProduct;
  quantity: number;
};

export function BouquetGrid({
  bouquets,
  flowerProducts = [],
  shopMode = "stand",
}: BouquetGridProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastBouquetId, setLastBouquetId] = useState<string | null>(null);
  const [ctaVariant, setCtaVariant] = useState<"buy" | "checkout">("buy");
  const [cart, setCart] = useState<CartLine[]>([]);

  const availableBouquets = useMemo(
    () => bouquets.filter((bouquet) => bouquet.available),
    [bouquets],
  );
  const mostBoughtId = availableBouquets[0]?._id;
  const lastBouquet = bouquets.find((bouquet) => bouquet._id === lastBouquetId);
  const cartSubtotal = cart.reduce(
    (total, line) => total + line.item.priceCents * line.quantity,
    0,
  );
  const hasBouquetInCart = cart.some((line) => line.item.category === "bouquet");
  const pantryLines = cart.filter((line) => line.item.category === "pantry");
  const hasPantryInCart = pantryLines.length > 0;
  const lowestPantryPrice = pantryLines.length
    ? Math.min(...pantryLines.map((line) => line.item.priceCents))
    : 0;
  const ritualBundleDiscount =
    hasBouquetInCart && hasPantryInCart
      ? Math.min(RITUAL_BUNDLE_DISCOUNT_CENTS, lowestPantryPrice)
      : 0;
  const cartTotal = Math.max(0, cartSubtotal - ritualBundleDiscount);

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

  function addToCart(item: FlowerProduct) {
    setError(null);
    setCart((current) => {
      const existing = current.find((line) => line.item._id === item._id);
      if (existing) {
        return current.map((line) =>
          line.item._id === item._id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...current, { item, quantity: 1 }];
    });
  }

  function removeFromCart(itemId: string) {
    setCart((current) => current.filter((line) => line.item._id !== itemId));
  }

  async function checkoutCart() {
    if (!cart.length) {
      setError("Add at least one stand item first.");
      return;
    }
    setError(null);
    setLoadingId("cart");
    try {
      try {
        await fetch("/api/analytics/cta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "cta_click",
            variant: ctaVariant,
            itemType: "flowerProduct",
            itemId: cart.map((line) => line.item._id).join(","),
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
          items: cart.map((line) => ({
            itemType: "flowerProduct",
            itemId: line.item._id,
            quantity: line.quantity,
          })),
          ctaVariant,
        }),
      });
      const data = await readJsonSafe(res);
      const errorMessage =
        typeof data.error === "string" ? data.error : "Checkout failed";
      const checkoutUrl = typeof data.url === "string" ? data.url : null;
      if (!res.ok || !checkoutUrl) throw new Error(errorMessage);
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoadingId(null);
    }
  }

  if (!bouquets.length && !flowerProducts.length) {
    return (
      <p className="text-sm text-ink/50">
        {shopMode === "shipped"
          ? "Online shipping is not available yet — check back soon."
          : "Nothing listed yet — check back."}
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
            Last stand favorite
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
                  ? "Starting payment"
                  : `Pay for ${lastBouquet.name} at the stand`
              }
              className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-cream hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/30"
            >
              {loadingId === lastBouquet._id
                ? "Starting..."
                : ctaVariant === "checkout"
                  ? "Pay now"
                  : "Pay for stand item"}
            </button>
          </div>
        </div>
      )}
      {flowerProducts.length > 0 && (
        <div className="mb-8">
          {shopMode === "stand" && (
            <div className="mb-6 border border-moss/25 bg-moss/10 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-moss">
                Make it a Ritual Bundle
              </p>
              <p className="mt-1 text-sm text-ink/70">
                $5 off any pantry item with a bouquet.
              </p>
            </div>
          )}
          {shopMode === "shipped" ? (
            <div className="mb-6 rounded-lg border border-ink/15 bg-cream/60 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-ink/50">Shipping</p>
              <p className="mt-2 max-w-2xl text-sm text-ink/70">
                Checkout collects your US shipping address. Shipping cost and carrier are set at
                fulfillment — we&apos;ll email you if anything changes.
              </p>
            </div>
          ) : null}
          {[
            {
              label:
                shopMode === "shipped"
                  ? "Ships nationwide (US)"
                  : "Seasonal flower offerings",
              items:
                shopMode === "shipped"
                  ? flowerProducts
                  : flowerProducts.filter((item) => item.category !== "pantry"),
            },
            ...(shopMode === "shipped"
              ? []
              : [
                  {
                    label: "Seasonal garden offerings",
                    items: flowerProducts.filter((item) => item.category === "pantry"),
                  },
                ]),
          ].map((group) =>
            group.items.length ? (
              <div key={group.label} className="mb-8 last:mb-0">
                <p className="text-xs uppercase tracking-widest text-ink/40">
                  {group.label}
                </p>
                {group.label === "Seasonal garden offerings" && shopMode === "stand" && (
                  <p className="mt-2 max-w-2xl text-sm text-ink/60">
                    Small-batch pantry items grown here and built to pair with your flowers.
                  </p>
                )}
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {group.items.map((item) => (
                    <FlowerProductCard
                      key={item._id}
                      item={item}
                      onAdd={addToCart}
                      shipped={shopMode === "shipped"}
                    />
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
      {cart.length > 0 && (
        <div className="mb-10 border border-ink/10 bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-ink/40">Cart</p>
          <div className="mt-4 space-y-3">
            {cart.map((line) => (
              <div
                key={line.item._id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3 text-sm"
              >
                <div>
                  <p className="font-medium">{line.item.publicName ?? line.item.name}</p>
                  <p className="text-xs text-ink/50">
                    {formatUSD(line.item.priceCents)} x {line.quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.item._id)}
                  className="text-xs uppercase tracking-widest text-ink/50 underline decoration-ink/20 underline-offset-4"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm text-ink/70">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatUSD(cartSubtotal)}</span>
            </div>
            {ritualBundleDiscount > 0 && (
              <div className="flex justify-between text-moss">
                <span>Ritual Bundle Discount</span>
                <span>-{formatUSD(ritualBundleDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink/10 pt-2 font-medium text-ink">
              <span>Total</span>
              <span>{formatUSD(cartTotal)}</span>
            </div>
          </div>
          <button
            type="button"
            disabled={loadingId === "cart"}
            onClick={checkoutCart}
            className="mt-5 bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/20"
          >
            {loadingId === "cart"
              ? "Starting..."
              : shopMode === "shipped"
                ? "Checkout with shipping"
                : "Pay for stand items"}
          </button>
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
                        ? `Starting payment for ${b.name}`
                        : `Pay for ${b.name} at the stand`
                  }
                  className="bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/20"
                >
                  {!b.available
                    ? "Out today"
                    : loadingId === b._id
                      ? "Starting..."
                      : ctaVariant === "checkout"
                        ? "Pay now"
                        : "Pay for stand item"}
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

function FlowerProductCard({
  item,
  onAdd,
  shipped = false,
}: {
  item: FlowerProduct;
  onAdd: (item: FlowerProduct) => void;
  shipped?: boolean;
}) {
  return (
    <article className="flex flex-col border border-ink/10 bg-cream">
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
            Seasonal flowers
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] uppercase tracking-widest text-ink/40">
          {item.billingLabel ?? "Flower Service"}
        </p>
        <h3 className="mt-2 font-display text-2xl font-light">
          {item.publicName ?? item.name}
        </h3>
        {item.shortDescription && (
          <p className="mt-2 text-sm font-medium text-ink/70">
            {item.shortDescription}
          </p>
        )}
        {(item.displayDescription ?? item.description) && (
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {item.displayDescription ?? item.description}
          </p>
        )}
        {typeof item.quantity === "number" && !shipped && (
          <p className="mt-3 text-xs uppercase tracking-widest text-ink/45">
            {item.quantity} available at the stand
          </p>
        )}
        {shipped && (
          <p className="mt-3 text-xs uppercase tracking-widest text-moss/80">
            Ships within the US · Card checkout
          </p>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-ink/10 pt-4">
          <span className="font-display text-2xl font-light">
            {formatUSD(item.priceCents)}
          </span>
          <button
            type="button"
            onClick={() => onAdd(item)}
            className="bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/20"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
