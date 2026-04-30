import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityClient } from "@/sanity/client";
import { oneFlowerProductBySlugQuery } from "@/sanity/queries";
import type { FlowerProduct } from "@/sanity/types";
import { formatUSD } from "@/lib/format";
import { RITUAL_BUNDLE_CUSTOMER_NOTE } from "@/lib/ritualBundle";

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
  const product = await sanityClient
    .fetch<FlowerProduct | null>(oneFlowerProductBySlugQuery, { slug: params.slug })
    .catch(() => null);

  if (!product || product.active === false || product.inStock === false) {
    notFound();
  }

  const isPantry = product.category === "pantry";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 pb-24 lg:px-8 lg:py-24">
      <Link
        href="/farm-stand#shop"
        className="text-xs uppercase tracking-widest text-ink/50 underline decoration-ink/20 underline-offset-4 hover:text-ink"
      >
        ← Shop
      </Link>

      <p className="mt-6 text-xs uppercase tracking-widest text-ink/40">
        {isPantry ? "Pantry" : "Flowers"}
      </p>
      <h1 className="mt-2 font-display text-4xl font-light text-ink md:text-5xl">
        {product.publicName ?? product.name}
      </h1>
      <p className="mt-4 font-display text-2xl font-light text-ink/90">
        {formatUSD(product.priceCents)}
      </p>

      <p className="mt-6 text-sm text-ink/65">{RITUAL_BUNDLE_CUSTOMER_NOTE}</p>

      {product.imageUrl ? (
        <div className="mt-8 aspect-[4/5] overflow-hidden border border-ink/10 bg-stone/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.publicName ?? product.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      {product.shortDescription ? (
        <p className="mt-8 text-sm font-medium text-ink/80">{product.shortDescription}</p>
      ) : null}
      {product.displayDescription ? (
        <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.displayDescription}</p>
      ) : null}

      <div className="mt-10">
        <Link
          href="/farm-stand#shop"
          className="inline-block bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream transition-colors hover:bg-charcoal"
        >
          Add from shop
        </Link>
      </div>
    </div>
  );
}
