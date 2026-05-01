import type { FlowerProduct } from "@/sanity/types";

/** Map any legacy CMS category to the two shop values we persist today. */
export function normalizeShopProductCategory(
  category: string | undefined,
): "flowers" | "pantry" {
  if (category === "pantry") return "pantry";
  return "flowers";
}
export function isShopFlowerCategory(category: string | undefined) {
  return category !== "pantry" && Boolean(category);
}

function isUsableImageUrl(u: string | undefined | null): u is string {
  if (!u || typeof u !== "string") return false;
  const t = u.trim();
  if (!t) return false;
  return /^https?:\/\//i.test(t) || t.startsWith("/");
}

/** First image URL for cards (HTTPS or same-site path). */
export function shopProductHeroImageUrl(product: FlowerProduct): string | undefined {
  const fromGallery = product.imageUrls?.find((u) => isUsableImageUrl(u));
  if (fromGallery) return fromGallery.trim();
  const fallback = product.imageUrl?.trim();
  if (isUsableImageUrl(fallback)) return fallback;
  return undefined;
}

export function shopProductDisplayTitle(product: FlowerProduct): string {
  const t = (product.publicName ?? product.name ?? "").trim();
  return t;
}

/** Public shop: require title + valid price to render a card. */
export function isShopPublicCardComplete(product: FlowerProduct): boolean {
  const title = shopProductDisplayTitle(product);
  const priceOk =
    typeof product.priceCents === "number" && Number.isFinite(product.priceCents) && product.priceCents >= 0;
  return Boolean(title && priceOk);
}

export type ProductAdminIssue =
  | "missing_title"
  | "missing_price"
  | "missing_image"
  | "inactive"
  | "out_of_stock"
  | "category_legacy";

const LEGACY_SHOP_CATEGORIES = new Set(["bouquet", "bundle", "wedding_event", "vendor_item", "other"]);

export function productAdminIssues(product: FlowerProduct): ProductAdminIssue[] {
  const issues: ProductAdminIssue[] = [];
  if (!shopProductDisplayTitle(product)) issues.push("missing_title");
  if (
    typeof product.priceCents !== "number" ||
    !Number.isFinite(product.priceCents) ||
    product.priceCents < 0
  ) {
    issues.push("missing_price");
  }
  if (!shopProductHeroImageUrl(product)) issues.push("missing_image");
  if (product.active === false) issues.push("inactive");
  if (product.inStock === false) issues.push("out_of_stock");
  if (product.category && LEGACY_SHOP_CATEGORIES.has(product.category)) {
    issues.push("category_legacy");
  }
  return issues;
}

export function productAdminIssueLabel(issue: ProductAdminIssue): string {
  switch (issue) {
    case "missing_title":
      return "Missing title";
    case "missing_price":
      return "Missing price";
    case "missing_image":
      return "No image";
    case "inactive":
      return "Inactive";
    case "out_of_stock":
      return "Out of stock";
    case "category_legacy":
      return "Legacy category — open Save to use Flowers";
    default:
      return issue;
  }
}
