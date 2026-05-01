import type { FlowerProduct, ShopProduct } from "@/sanity/types";
import { shopProductDisplayTitle, shopProductHeroImageUrl } from "@/lib/shopProduct";

/** Map CMS `flowerProduct` into the shared `ShopProduct` shape for shop/cart/checkout. */
export function flowerProductToShopProduct(p: FlowerProduct): ShopProduct {
  const httpsImages =
    p.imageUrls?.filter((u) => typeof u === "string" && /^https?:\/\//i.test(u)) ?? [];
  const hero = shopProductHeroImageUrl(p);
  const images =
    httpsImages.length > 0
      ? httpsImages.slice(0, 8)
      : hero && /^https?:\/\//i.test(hero)
        ? [hero]
        : undefined;
  return {
    id: p._id,
    title: shopProductDisplayTitle(p),
    slug: p.slug,
    description: p.shortDescription ?? p.displayDescription ?? p.description,
    priceCents: p.priceCents,
    category: p.category,
    images,
    image_url: hero,
    active: p.active !== false,
  };
}
