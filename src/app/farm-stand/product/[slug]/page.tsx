import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityClient } from "@/sanity/client";
import { oneFlowerProductBySlugQuery, siteSettingsQuery } from "@/sanity/queries";
import type { FlowerProduct, SiteSettings } from "@/sanity/types";
import { formatUSD } from "@/lib/format";
import { RITUAL_BUNDLE_CUSTOMER_NOTE } from "@/lib/ritualBundle";
import { shopProductDisplayTitle, shopProductHeroImageUrl } from "@/lib/shopProduct";
import {
  canPurchaseProductWhenStandClosed,
  isStandClosed,
  isStandOnlyProduct,
} from "@/lib/standAvailability";
import { resolveContactLinks } from "@/lib/siteContact";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const product = await sanityClient
    .fetch<FlowerProduct | null>(oneFlowerProductBySlugQuery, { slug: params.slug })
    .catch(() => null);
  if (!product) return { title: "Product — Ritualmaker" };
  return {
    title: `${product.publicName ?? product.name} — Ritualmaker`,
    description: product.shortDescription ?? product.displayDescription ?? undefined,
  };
}

export default async function FlowerProductPage({ params }: Props) {
  const [product, settings] = await Promise.all([
    sanityClient
      .fetch<FlowerProduct | null>(oneFlowerProductBySlugQuery, { slug: params.slug })
      .catch(() => null),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null),
  ]);

  if (!product || product.active === false || product.inStock === false) {
    notFound();
  }

  const standClosed = isStandClosed(settings?.standStatus);
  const standOnly = isStandOnlyProduct(product);
  const purchaseBlocked = standClosed && !canPurchaseProductWhenStandClosed(product);
  const contact = resolveContactLinks(settings);

  const isPantry = product.category === "pantry";
  const heroUrl = shopProductHeroImageUrl(product);
  const title = shopProductDisplayTitle(product);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 pb-24 lg:px-8 lg:py-24">
      <Link
        href="/farm-stand#shop"
        className="text-xs uppercase tracking-widest text-ink/50 underline decoration-ink/20 underline-offset-4 hover:text-ink"
      >
        ← Shop
      </Link>

      {purchaseBlocked ? (
        <div
          className="mt-6 border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-ink/80"
          role="status"
        >
          <p className="font-medium text-ink">Stand closed — not available online</p>
          <p className="mt-1 text-ink/70">
            This is a stand pickup item and the farm stand is closed for the season. Browse shipped
            items on the{" "}
            <Link href="/farm-stand#shop" className="underline underline-offset-2">
              shop page
            </Link>{" "}
            or{" "}
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              message on Instagram
            </a>
            .
          </p>
        </div>
      ) : null}

      <p className="mt-6 text-xs uppercase tracking-widest text-ink/40">
        {isPantry ? "Pantry" : "Flowers"}
        {standOnly && !purchaseBlocked ? " · Stand or shipped per listing" : null}
        {product.shipsNationwide ? " · Ships within the US" : null}
      </p>
      <h1 className="mt-2 font-display text-4xl font-light text-ink md:text-5xl">{title}</h1>
      <p className="mt-4 font-display text-2xl font-light text-ink/90">
        {formatUSD(product.priceCents)}
      </p>

      {!purchaseBlocked ? (
        <p className="mt-6 text-sm text-ink/65">{RITUAL_BUNDLE_CUSTOMER_NOTE}</p>
      ) : null}

      <div className="mt-8 aspect-[4/5] overflow-hidden border border-ink/10 bg-stone/30">
        {heroUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-stone/50 to-stone/25" aria-hidden />
        )}
      </div>

      {product.shortDescription ? (
        <p className="mt-8 text-sm font-medium text-ink/80">{product.shortDescription}</p>
      ) : null}
      {product.displayDescription ? (
        <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.displayDescription}</p>
      ) : null}

      <div className="mt-10">
        {purchaseBlocked ? (
          <Link
            href="/farm-stand#shop"
            className="inline-block border border-ink/20 px-6 py-3 text-xs uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Back to shop
          </Link>
        ) : (
          <Link
            href="/farm-stand#shop"
            className="inline-block bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal"
          >
            Add from shop
          </Link>
        )}
      </div>
    </div>
  );
}
