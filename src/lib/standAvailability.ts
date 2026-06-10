/** Stand season + product purchase boundaries (Pass 04C). */

export type StandStatus = "open" | "restocking" | "closed";

export type ShippableProduct = { shipsNationwide?: boolean };

export function isStandClosed(standStatus?: StandStatus | null): boolean {
  return standStatus === "closed";
}

export function isShippableNationwide(product: ShippableProduct): boolean {
  return product.shipsNationwide === true;
}

export function isStandOnlyProduct(product: ShippableProduct): boolean {
  return !isShippableNationwide(product);
}

/** Shop listing when the physical stand is season-closed. */
export function filterProductsForStandStatus<T extends ShippableProduct>(
  products: T[],
  standStatus?: StandStatus | null,
): T[] {
  if (!isStandClosed(standStatus)) return products;
  return products.filter(isShippableNationwide);
}

export function canPurchaseProductWhenStandClosed(product: ShippableProduct): boolean {
  return isShippableNationwide(product);
}

export function cartHasStandOnlyItems(items: ShippableProduct[]): boolean {
  return items.some(isStandOnlyProduct);
}

export const STAND_CLOSED_CHECKOUT_ERROR =
  "The farm stand is closed for the season. Stand pickup items cannot be checked out online right now. Shipped items marked for nationwide delivery may still be available.";

export function validateCartForStandClosed(
  items: ShippableProduct[],
  standStatus?: StandStatus | null,
): { ok: true } | { ok: false; error: string } {
  if (!isStandClosed(standStatus)) return { ok: true };
  if (cartHasStandOnlyItems(items)) {
    return { ok: false, error: STAND_CLOSED_CHECKOUT_ERROR };
  }
  return { ok: true };
}

export function resolvePublicTagline(
  tagline: string | undefined | null,
  standStatus?: StandStatus | null,
): string {
  const defaultOpen = "Fresh flowers in the neighborhood, 24/7";
  const closedDefault = "Seasonal flowers & pantry — online when listed";
  if (isStandClosed(standStatus)) {
    if (!tagline || /24\s*\/\s*7/i.test(tagline)) return closedDefault;
    return tagline;
  }
  return tagline ?? defaultOpen;
}

export function resolveHeroSubline(standStatus?: StandStatus | null): string {
  if (isStandClosed(standStatus)) {
    return "The self-serve stand is closed for the season. Nationwide shipping items remain in the shop when listed.";
  }
  return "38 Miller Hill Road — stop by the stand and buy what is fresh in inventory.";
}

export function resolveHomeDescription(
  description: string | undefined | null,
  standStatus?: StandStatus | null,
): string {
  const defaultOpen =
    "Self-serve flowers at 38 Miller Hill Road, Hudson Valley. Stop by and buy what is fresh at the stand.";
  const closedDefault =
    "Seasonal flowers and garden pantry from Ritualmaker. The stand may be closed — shipped items appear in the shop when listed.";
  if (isStandClosed(standStatus)) {
    if (!description || /24\s*\/\s*7/i.test(description)) return closedDefault;
    return description;
  }
  return description ?? defaultOpen;
}

export type FulfillmentMode = "shipped" | "pickup" | "mixed" | "unknown";

export function resolveFulfillmentMode(products: ShippableProduct[]): FulfillmentMode {
  if (!products.length) return "unknown";
  const shippedCount = products.filter(isShippableNationwide).length;
  if (shippedCount === products.length) return "shipped";
  if (shippedCount === 0) return "pickup";
  return "mixed";
}

export const STAND_CLOSED_SHOP_NOTICE =
  "The farm stand at 38 Miller Hill Road is closed for the season. Stand pickup bouquets are not available online right now. Items marked for nationwide shipping may still be purchased when listed.";
