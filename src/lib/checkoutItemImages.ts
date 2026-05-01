import type { Bouquet, FlowerProduct, PantryItem } from "@/sanity/types";

export type CheckoutPricedItem = Bouquet | PantryItem | FlowerProduct;

function isHttpsUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

function pushHttpsUnique(out: string[], url: string | undefined | null) {
  if (typeof url !== "string") return;
  const t = url.trim();
  if (!t || !isHttpsUrl(t)) return;
  if (!out.includes(t)) out.push(t);
}

function stringsFromUnknownArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((u): u is string => typeof u === "string");
}

function appendGalleryUrls(out: string[], r: Record<string, unknown>) {
  const gallery = r.gallery;
  if (!Array.isArray(gallery)) return;
  for (const entry of gallery) {
    if (!entry || typeof entry !== "object") continue;
    const url = (entry as { url?: unknown }).url;
    if (typeof url === "string") pushHttpsUnique(out, url);
  }
}

/**
 * Stripe Checkout `product_data.images`: up to 8 HTTPS URLs.
 * Order: generic arrays (`images`, `image_urls`, `imageUrls`), then gallery URLs,
 * then single fallbacks (`imageUrl`, `image_url`, string `image`).
 */
export function getCheckoutStripeImages(item: CheckoutPricedItem): string[] {
  const out: string[] = [];
  const r = item as unknown as Record<string, unknown>;

  for (const u of stringsFromUnknownArray(r.images)) pushHttpsUnique(out, u);
  for (const u of stringsFromUnknownArray(r.image_urls)) pushHttpsUnique(out, u);
  for (const u of stringsFromUnknownArray(r.imageUrls)) pushHttpsUnique(out, u);

  appendGalleryUrls(out, r);

  if (typeof r.imageUrl === "string") pushHttpsUnique(out, r.imageUrl);
  if (typeof r.image_url === "string") pushHttpsUnique(out, r.image_url);
  if (typeof r.image === "string") pushHttpsUnique(out, r.image);

  return out.slice(0, 8);
}
