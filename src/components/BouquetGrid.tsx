"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Bouquet, FlowerProduct } from "@/sanity/types";
import { farmLabel, formatUSD, sizeLabel } from "@/lib/format";
import {
  computeRitualBundleDiscountCents,
  RITUAL_BUNDLE_CUSTOMER_NOTE,
} from "@/lib/ritualBundle";
import {
  isShopFlowerCategory,
  isShopPublicCardComplete,
  shopProductDisplayTitle,
  shopProductHeroImageUrl,
} from "@/lib/shopProduct";
import { useShopCart } from "@/components/shop/ShopCartContext";

async function readJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

type ShopCategoryFilter = "all" | "flowers" | "pantry";

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
  const pathname = usePathname();
  const { setItemCount, consumeScrollToCart, requestScrollToCart } = useShopCart();
  const [shopFilter, setShopFilter] = useState<ShopCategoryFilter>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastBouquetId, setLastBouquetId] = useState<string | null>(null);
  const [ctaVariant, setCtaVariant] = useState<"buy" | "checkout">("buy");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [shipName, setShipName] = useState("");
  const [shipLine1, setShipLine1] = useState("");
  const [shipLine2, setShipLine2] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipZip, setShipZip] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipEmail, setShipEmail] = useState("");

  const filteredFlowerProducts = useMemo(() => {
    if (shopFilter === "flowers") {
      return flowerProducts.filter((item) => isShopFlowerCategory(item.category));
    }
    if (shopFilter === "pantry") {
      return flowerProducts.filter((item) => item.category === "pantry");
    }
    return flowerProducts;
  }, [flowerProducts, shopFilter]);

  const publicShopProducts = useMemo(
    () => filteredFlowerProducts.filter((item) => isShopPublicCardComplete(item)),
    [filteredFlowerProducts],
  );

  const publicFlowersShopProducts = useMemo(
    () =>
      filteredFlowerProducts.filter(
        (item) => isShopPublicCardComplete(item) && isShopFlowerCategory(item.category),
      ),
    [filteredFlowerProducts],
  );

  const publicPantryShopProducts = useMemo(
    () =>
      filteredFlowerProducts.filter(
        (item) => isShopPublicCardComplete(item) && item.category === "pantry",
      ),
    [filteredFlowerProducts],
  );

  const splitShippedFlowerPantrySections =
    shopMode === "shipped" && shopFilter === "all";

  const shopProductDebug =
    process.env.NEXT_PUBLIC_SHOP_PRODUCT_DEBUG === "1" ||
    process.env.NEXT_PUBLIC_SHOP_PRODUCT_DEBUG === "true";

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
  const ritualBundleDiscount = computeRitualBundleDiscountCents(
    cart.map((line) => ({
      category: line.item.category,
      quantity: line.quantity,
      unitPriceCents: line.item.priceCents,
    })),
  );
  const cartTotal = Math.max(0, cartSubtotal - ritualBundleDiscount);

  const cartItemCount = useMemo(
    () => cart.reduce((n, line) => n + line.quantity, 0),
    [cart],
  );

  useEffect(() => {
    setItemCount(cartItemCount);
  }, [cartItemCount, setItemCount]);

  useEffect(() => {
    if (pathname !== "/farm-stand") return;
    if (!consumeScrollToCart()) return;
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById("cart");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname, consumeScrollToCart, cartItemCount]);

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
    if (pathname === "/farm-stand") {
      requestScrollToCart();
    }
  }

  function removeFromCart(itemId: string) {
    setCart((current) => current.filter((line) => line.item._id !== itemId));
  }

  async function checkoutCart() {
    if (!cart.length) {
      setError("Add at least one stand item first.");
      return;
    }
    if (shopMode === "shipped") {
      const needsShipForm = cart.some((line) => line.item.shipsNationwide === true);
      if (
        needsShipForm &&
        (!shipName.trim() ||
          !shipLine1.trim() ||
          !shipCity.trim() ||
          !shipState.trim() ||
          !shipZip.trim())
      ) {
        setError(
          "Enter your full shipping address (name, street, city, state, ZIP) for items that ship nationwide.",
        );
        return;
      }
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
          ...(shopMode === "shipped"
            ? {
                shippingAddress: {
                  name: shipName.trim(),
                  line1: shipLine1.trim(),
                  line2: shipLine2.trim() || undefined,
                  city: shipCity.trim(),
                  state: shipState.trim(),
                  zip: shipZip.trim(),
                  country: "US",
                  phone: shipPhone.trim() || undefined,
                  email: shipEmail.trim() || undefined,
                },
              }
            : {}),
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

  const incompleteInFilter =
    shopMode === "shipped" &&
    filteredFlowerProducts.length > 0 &&
    publicShopProducts.length === 0;

  return (
    <div>
      {error && (
        <div className="mb-6 border border-magenta/40 bg-bloom/15 px-4 py-3 text-sm text-magenta">
          {error}
        </div>
      )}
      {shopMode === "shipped" && flowerProducts.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-ink/65">{RITUAL_BUNDLE_CUSTOMER_NOTE}</p>
          <div
            className="mb-6 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Shop category"
          >
          {(
            [
              { id: "all" as const, label: "All" },
              { id: "flowers" as const, label: "Flowers" },
              { id: "pantry" as const, label: "Pantry" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={shopFilter === id}
              onClick={() => setShopFilter(id)}
              className={`border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                shopFilter === id
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/20 bg-white text-ink/70 hover:border-ink/40 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        </>
      ) : null}
      {shopMode === "shipped" &&
      flowerProducts.length > 0 &&
      filteredFlowerProducts.length === 0 ? (
        <p className="mb-6 text-sm text-ink/60">
          No products in this category. Try <strong>All</strong> or another filter.
        </p>
      ) : null}
      {incompleteInFilter ? (
        <p className="mb-6 border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-ink/80" role="status">
          {filteredFlowerProducts.length} product(s) in this view are hidden until each has a{" "}
          <strong className="font-medium">public name</strong> and a valid <strong className="font-medium">price</strong>.
          Fix them in <strong className="font-medium">Admin → Products</strong>.
        </p>
      ) : null}
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
      {publicShopProducts.length > 0 && (
        <div className="mb-8">
          {shopMode === "stand" && (
            <div className="mb-6 border border-moss/25 bg-moss/10 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-moss">
                Make it a Ritual Bundle
              </p>
              <p className="mt-1 text-sm text-ink/70">{RITUAL_BUNDLE_CUSTOMER_NOTE}</p>
            </div>
          )}
          {splitShippedFlowerPantrySections ? (
            <>
              {publicFlowersShopProducts.length > 0 ? (
                <section className="mb-12" aria-labelledby="shop-flowers-heading">
                  <h2
                    id="shop-flowers-heading"
                    className="font-display text-2xl font-light text-ink sm:text-3xl"
                  >
                    Flowers
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-ink/60">
                    Bouquets and seasonal flower offerings.
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {publicFlowersShopProducts.map((item) => (
                      <FlowerProductCard
                        key={item._id}
                        item={item}
                        onAdd={addToCart}
                        shipped={shopMode === "shipped" && item.shipsNationwide === true}
                        showProductDebug={shopProductDebug}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {publicPantryShopProducts.length > 0 ? (
                <section
                  className={`${publicFlowersShopProducts.length > 0 ? "border-t border-ink/10 pt-12" : ""}`}
                  aria-labelledby="shop-pantry-heading"
                >
                  <h2
                    id="shop-pantry-heading"
                    className="font-display text-2xl font-light text-ink sm:text-3xl"
                  >
                    Garden pantry
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-ink/60">
                    Small-batch pantry items grown here and built to pair with your flowers.
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {publicPantryShopProducts.map((item) => (
                      <FlowerProductCard
                        key={item._id}
                        item={item}
                        onAdd={addToCart}
                        shipped={shopMode === "shipped" && item.shipsNationwide === true}
                        showProductDebug={shopProductDebug}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            [
              {
                label:
                  shopMode === "shipped"
                    ? "Flowers & pantry"
                    : "Seasonal flower offerings",
                items:
                  shopMode === "shipped"
                    ? publicShopProducts
                    : publicShopProducts.filter((item) => isShopFlowerCategory(item.category)),
              },
              ...(shopMode === "shipped"
                ? []
                : [
                    {
                      label: "Seasonal garden offerings",
                      items: publicShopProducts.filter((item) => item.category === "pantry"),
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
                        shipped={shopMode === "shipped" && item.shipsNationwide === true}
                        showProductDebug={shopProductDebug}
                      />
                    ))}
                  </div>
                </div>
              ) : null,
            )
          )}
        </div>
      )}
      {(flowerProducts.length > 0 || bouquets.length > 0) && (
        <div
          id="cart"
          className="mb-10 scroll-mt-[calc(5.5rem+env(safe-area-inset-top)+1rem)] border border-ink/10 bg-white p-5 shadow-sm"
        >
          <h2 className="font-display text-2xl font-light text-ink">Cart</h2>
          {cart.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">Your cart is empty.</p>
          ) : (
            <>
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
                    <span>Bundle discount applied</span>
                    <span>-{formatUSD(ritualBundleDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-ink/10 pt-2 font-medium text-ink">
                  <span>Total</span>
                  <span>{formatUSD(cartTotal)}</span>
                </div>
                {shopMode === "shipped" &&
                  cart.some((line) => line.item.shipsNationwide === true) && (
                    <p className="text-xs text-ink/55">
                      Product subtotal above. USPS shipping is calculated next and shown on the payment
                      page.
                    </p>
                  )}
              </div>
              {shopMode === "shipped" &&
                cart.some((line) => line.item.shipsNationwide === true) && (
                  <div className="mt-6 space-y-3 border-t border-ink/10 pt-6">
                    <p className="text-xs uppercase tracking-widest text-ink/40">Ship to (US)</p>
                    <label className="block text-sm text-ink/70">
                      Full name
                      <input
                        value={shipName}
                        onChange={(e) => setShipName(e.target.value)}
                        autoComplete="shipping name"
                        className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm text-ink/70">
                      Street address
                      <input
                        value={shipLine1}
                        onChange={(e) => setShipLine1(e.target.value)}
                        autoComplete="shipping address-line1"
                        className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm text-ink/70">
                      Apt / suite (optional)
                      <input
                        value={shipLine2}
                        onChange={(e) => setShipLine2(e.target.value)}
                        autoComplete="shipping address-line2"
                        className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm text-ink/70">
                        City
                        <input
                          value={shipCity}
                          onChange={(e) => setShipCity(e.target.value)}
                          autoComplete="shipping address-level2"
                          className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm text-ink/70">
                        State
                        <input
                          value={shipState}
                          onChange={(e) => setShipState(e.target.value)}
                          autoComplete="shipping address-level1"
                          className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    <label className="block text-sm text-ink/70">
                      ZIP code
                      <input
                        value={shipZip}
                        onChange={(e) => setShipZip(e.target.value)}
                        autoComplete="shipping postal-code"
                        className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm text-ink/70">
                        Phone (optional)
                        <input
                          value={shipPhone}
                          onChange={(e) => setShipPhone(e.target.value)}
                          autoComplete="shipping tel"
                          className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-sm text-ink/70">
                        Email (optional)
                        <input
                          type="email"
                          value={shipEmail}
                          onChange={(e) => setShipEmail(e.target.value)}
                          autoComplete="shipping email"
                          className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                  </div>
                )}
              <button
                type="button"
                disabled={loadingId === "cart"}
                onClick={checkoutCart}
                className="mt-5 bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:bg-ink/20"
              >
                {loadingId === "cart"
                  ? "Starting..."
                  : shopMode === "shipped"
                    ? cart.some((line) => line.item.shipsNationwide === true)
                      ? "Checkout with shipping"
                      : "Checkout"
                    : "Pay for stand items"}
              </button>
            </>
          )}
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
  showProductDebug = false,
}: {
  item: FlowerProduct;
  onAdd: (item: FlowerProduct) => void;
  shipped?: boolean;
  showProductDebug?: boolean;
}) {
  const slug = item.slug?.trim();
  const detailHref = slug ? `/farm-stand/product/${encodeURIComponent(slug)}` : null;
  const displayTitle = shopProductDisplayTitle(item);
  const heroUrl = shopProductHeroImageUrl(item);

  return (
    <article className="flex flex-col border border-ink/10 bg-cream">
      {detailHref ? (
        <Link href={detailHref} className="block aspect-[3/4] overflow-hidden bg-stone/40">
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-b from-stone/50 to-stone/25"
              aria-hidden
            />
          )}
        </Link>
      ) : (
        <div className="aspect-[3/4] overflow-hidden bg-stone/40">
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-b from-stone/50 to-stone/25"
              aria-hidden
            />
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {showProductDebug ? (
          <p className="text-[10px] font-mono text-ink/45">
            id={item._id} · cat={item.category ?? "—"} · active={String(item.active !== false)} · img=
            {heroUrl ? "yes" : "no"}
          </p>
        ) : null}
        <p className="text-[10px] uppercase tracking-widest text-ink/40">
          {item.billingLabel ?? "Flower Service"}
        </p>
        {detailHref ? (
          <h3 className="mt-2 font-display text-2xl font-light">
            <Link href={detailHref} className="hover:text-ink/80">
              {displayTitle}
            </Link>
          </h3>
        ) : (
          <h3 className="mt-2 font-display text-2xl font-light">{displayTitle}</h3>
        )}
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
        {shipped ? (
          <p className="mt-3 text-xs uppercase tracking-widest text-moss/80">
            Ships within the US · Card checkout
          </p>
        ) : (
          <p className="mt-3 text-xs uppercase tracking-widest text-ink/50">
            Local / stand · Contact us for pickup or visit the stand
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
