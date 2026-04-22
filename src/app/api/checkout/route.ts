import { NextResponse } from "next/server";
import { sanityClient } from "@/sanity/client";
import { getStripe } from "@/lib/stripe";
import { farmLabel, sizeLabel } from "@/lib/format";
import type { Bouquet, PantryItem } from "@/sanity/types";
import { oneBouquetByIdQuery, onePantryItemByIdQuery } from "@/sanity/queries";

export const runtime = "nodejs";

type CheckoutBody = {
  itemType?: "bouquet" | "pantryItem";
  itemId?: string;
  bouquetId?: string;
  pantryItemId?: string;
  ctaVariant?: "buy" | "checkout";
};

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (
      body.itemType &&
      body.itemType !== "bouquet" &&
      body.itemType !== "pantryItem"
    ) {
      return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
    }
    const itemType =
      body.itemType === "pantryItem"
        ? "pantryItem"
        : body.itemType === "bouquet"
          ? "bouquet"
          : body.pantryItemId
            ? "pantryItem"
            : "bouquet";
    const itemId = body.itemId ?? body.bouquetId ?? body.pantryItemId;

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const item =
      itemType === "pantryItem"
        ? await sanityClient.fetch<PantryItem | null>(onePantryItemByIdQuery, {
            id: itemId,
          })
        : await sanityClient.fetch<Bouquet | null>(oneBouquetByIdQuery, {
            id: itemId,
          });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const isComingSoon = "comingSoon" in item ? Boolean(item.comingSoon) : false;
    if (!item.available || (itemType === "pantryItem" && isComingSoon)) {
      return NextResponse.json(
        { error: "This item is currently unavailable" },
        { status: 409 },
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    const stripe = getStripe();
    const description =
      itemType === "pantryItem"
        ? `Pantry · ${(item as PantryItem).category}`
        : `${farmLabel((item as Bouquet).farm)} · ${sizeLabel((item as Bouquet).size)}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      line_items: [
        item.stripePriceId
          ? { price: item.stripePriceId, quantity: 1 }
          : {
              price_data: {
                currency: "usd",
                unit_amount: item.priceCents,
                product_data: {
                  name: item.name,
                  description,
                  images: item.imageUrl ? [item.imageUrl] : undefined,
                },
              },
              quantity: 1,
            },
      ],
      automatic_tax: { enabled: false },
      payment_method_types: ["card"],
      payment_intent_data: item.vendorStripeAccountId
        ? {
            transfer_data: {
              destination: item.vendorStripeAccountId,
            },
          }
        : undefined,
      metadata: {
        itemType,
        itemId: item._id,
        vendorId: item.vendorId ?? "",
        vendorName: item.vendorName ?? "",
        ctaVariant: body.ctaVariant ?? "",
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] failed", error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
