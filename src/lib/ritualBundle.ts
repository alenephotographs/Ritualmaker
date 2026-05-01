/** Per pantry line unit when cart includes ≥1 bouquet and ≥1 pantry (no coupon). */
export const RITUAL_BUNDLE_DISCOUNT_PER_UNIT_CENTS = 300;

export const RITUAL_BUNDLE_CUSTOMER_NOTE =
  "$3 off any pantry item when purchased with a bouquet.";

/** Bouquet / flower SKUs that qualify for the pantry bundle discount (not pantry-only). */
export function isBouquetCategory(category: string | undefined) {
  return category === "flowers" || category === "bouquet" || category === "bundle";
}

export function isPantryCategory(category: string | undefined) {
  return category === "pantry";
}

export type BundlePricedLine = {
  category?: string;
  quantity: number;
  unitPriceCents: number;
};

/** Total discount in cents (sum of min($3, unit price) × qty for each pantry line). */
export function computeRitualBundleDiscountCents(lines: BundlePricedLine[]): number {
  const hasBouquet = lines.some((l) => isBouquetCategory(l.category) && l.quantity > 0);
  const hasPantry = lines.some((l) => isPantryCategory(l.category) && l.quantity > 0);
  if (!hasBouquet || !hasPantry) return 0;
  return lines
    .filter((l) => isPantryCategory(l.category))
    .reduce(
      (sum, l) =>
        sum + l.quantity * Math.min(RITUAL_BUNDLE_DISCOUNT_PER_UNIT_CENTS, Math.max(0, l.unitPriceCents)),
      0,
    );
}
