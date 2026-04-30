import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sanityClient } from "@/sanity/client";
import { getStripe } from "@/lib/stripe";
import { farmLabel, sizeLabel } from "@/lib/format";
import type { Bouquet, FlowerProduct, PantryItem } from "@/sanity/types";
import {
  oneBouquetByIdQuery,
  oneFlowerProductByIdQuery,
  onePantryItemByIdQuery,
} from "@/sanity/queries";
import { getCheapestUspsRateCents, isShippoConfigured, type ShippoAddressInput } from "@/lib/shippo";

export const runtime = "nodejs";

type ShippingAddressBody = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
};

type CheckoutBody = {
  itemType?: "bouquet" | "pantryItem" | "flowerProduct";
  itemId?: string;
  bouquetId?: string;
  pantryItemId?: string;
  items?: {
    itemType?: "flowerProduct";
    itemId?: string;
    quantity?: number;
  }[];
  ctaVariant?: "buy" | "checkout";
  /** Required for nationwide shipped flower products: used to quote USPS via Shippo. */
  shippingAddress?: ShippingAddressBody;
};

const US_SHIPPING_COUNTRIES = ["US"] as const;

/** Stripe Connect: only set transfer_data when exactly one destination account applies. */
function transferDestinationForFlowerProducts(products: FlowerProduct[]): string | undefined {
  const ids = [
    ...new Set(
      products
        .map((p) => (typeof p.vendorStripeAccountId === "string" ? p.vendorStripeAccountId.trim() : ""))
        .filter(Boolean),
    ),
  ];
  if (ids.length !== 1) return undefined;
  return ids[0];
}

function assertFlowerProductShips(product: FlowerProduct) {
  if (product.shipsNationwide !== true) {
    return NextResponse.json(
      {
        error:
          "This item is not available for shipped checkout yet. Visit the farm stand or contact us for local pickup.",
      },
      { status: 403 },
    );
  }
  return null;
}

function cleanShippingAddress(body: ShippingAddressBody | undefined): ShippoAddressInput | null {
  if (!body) return null;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const street1 = typeof body.line1 === "string" ? body.line1.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const state = typeof body.state === "string" ? body.state.trim() : "";
  const zip = typeof body.zip === "string" ? body.zip.trim() : "";
  const country = (typeof body.country === "string" ? body.country.trim() : "US") || "US";
  if (!name || !street1 || !city || !state || !zip) return null;
  return {
    name,
    street1,
    street2: typeof body.line2 === "string" ? body.line2.trim() || undefined : undefined,
    city,
    state,
    zip,
    country: country.toUpperCase(),
    phone: typeof body.phone === "string" ? body.phone.trim() || undefined : undefined,
    email: typeof body.email === "string" ? body.email.trim() || undefined : undefined,
  };
}

async function addShippoShippingLineItem(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  address: ShippoAddressInput,
  metadata: Record<string, string>,
) {
  if (!isShippoConfigured()) {
    return NextResponse.json(
      {
        error:
          "Shipping is not configured. Add Shippo and origin address environment variables, then try again.",
      },
      { status: 503 },
    );
  }
  if (address.country !== "US") {
    return NextResponse.json({ error: "We only ship within the United States." }, { status: 400 });
  }
  const rate = await getCheapestUspsRateCents(address);
  if (!rate.ok) {
    return NextResponse.json(
      { error: rate.error || "Could not get a shipping rate for this address." },
      { status: rate.status && rate.status >= 400 ? rate.status : 502 },
    );
  }
  const { quote } = rate;
  lineItems.push({
    price_data: {
      currency: "usd",
      unit_amount: quote.amountCents,
      product_data: {
        name: `Shipping — ${quote.provider} (${quote.serviceName})`,
        description: "Carrier rate from Shippo (USPS). Charged as a separate line item.",
      },
    },
    quantity: 1,
  });
  metadata.shippoRateObjectId = quote.rateObjectId;
  metadata.shippingAmountCents = String(quote.amountCents);
  metadata.shippingProvider = quote.provider;
  metadata.shippingService = quote.serviceName;
  metadata.shippingToZip = address.zip;
  return null;
}

type CheckoutLine =
  | { itemType: "bouquet"; item: Bouquet; quantity: number }
  | { itemType: "pantryItem"; item: PantryItem; quantity: number }
  | { itemType: "flowerProduct"; item: FlowerProduct; quantity: number };

const RITUAL_BUNDLE_DISCOUNT_CENTS = 500;

function isUnavailable(itemType: CheckoutLine["itemType"], item: CheckoutLine["item"]) {
  const isComingSoon = "comingSoon" in item ? Boolean(item.comingSoon) : false;
  if (itemType === "flowerProduct") {
    const product = item as FlowerProduct;
    return product.active === false || product.inStock === false;
  }
  if (itemType === "pantryItem") {
    return (item as PantryItem).available === false || isComingSoon;
  }
  return !(item as Bouquet).available;
}

function itemDescription(itemType: CheckoutLine["itemType"], item: CheckoutLine["item"]) {
  if (itemType === "flowerProduct") {
    return (item as FlowerProduct).billingLabel ?? "Flower Service";
  }
  if (itemType === "pantryItem") {
    return `Seasonal Garden Offering · ${(item as PantryItem).category}`;
  }
  return `Flower Service · ${farmLabel((item as Bouquet).farm)} · ${sizeLabel(
    (item as Bouquet).size,
  )}`;
}

function itemDisplayName(itemType: CheckoutLine["itemType"], item: CheckoutLine["item"]) {
  return itemType === "flowerProduct"
    ? ((item as FlowerProduct).publicName ?? item.name)
    : item.name;
}

function itemBillingLabel(itemType: CheckoutLine["itemType"], item: CheckoutLine["item"]) {
  if (itemType === "flowerProduct") {
    return (item as FlowerProduct).billingLabel ?? "Flower Service";
  }
  if (itemType === "pantryItem") return "Seasonal Garden Offering";
  return "Flower Service";
}

function itemTaxCategory(itemType: CheckoutLine["itemType"], item: CheckoutLine["item"]) {
  return itemType === "flowerProduct"
    ? ((item as FlowerProduct).taxCategory ?? "flower_service")
    : "flower_service";
}

function itemCategory(itemType: CheckoutLine["itemType"], item: CheckoutLine["item"]) {
  if (itemType === "flowerProduct") return (item as FlowerProduct).category ?? "";
  if (itemType === "pantryItem") return (item as PantryItem).category;
  return "bouquet";
}

function itemPriceCents(item: CheckoutLine["item"]) {
  return typeof item.priceCents === "number" ? item.priceCents : undefined;
}

async function fetchLine(itemType: CheckoutLine["itemType"], itemId: string) {
  const item =
    itemType === "flowerProduct"
      ? await sanityClient.fetch<FlowerProduct | null>(oneFlowerProductByIdQuery, {
          id: itemId,
        })
      : itemType === "pantryItem"
        ? await sanityClient.fetch<PantryItem | null>(onePantryItemByIdQuery, {
            id: itemId,
          })
        : await sanityClient.fetch<Bouquet | null>(oneBouquetByIdQuery, {
            id: itemId,
          });
  return item;
}

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
      body.itemType !== "pantryItem" &&
      body.itemType !== "flowerProduct"
    ) {
      return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
    }
    if (Array.isArray(body.items) && body.items.length > 0) {
      const lines: CheckoutLine[] = [];
      for (const rawLine of body.items.slice(0, 20)) {
        if (rawLine.itemType && rawLine.itemType !== "flowerProduct") {
          return NextResponse.json({ error: "Invalid cart item type" }, { status: 400 });
        }
        if (!rawLine.itemId) {
          return NextResponse.json({ error: "Missing cart item id" }, { status: 400 });
        }
        const item = (await fetchLine("flowerProduct", rawLine.itemId)) as FlowerProduct | null;
        if (!item) {
          return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
        }
        if (isUnavailable("flowerProduct", item)) {
          return NextResponse.json(
            { error: `${itemDisplayName("flowerProduct", item)} is currently unavailable` },
            { status: 409 },
          );
        }
        const shipErr = assertFlowerProductShips(item);
        if (shipErr) return shipErr;
        lines.push({
          itemType: "flowerProduct",
          item,
          quantity: Math.max(1, Math.min(99, Math.floor(rawLine.quantity ?? 1))),
        });
      }

      const hasBouquet = lines.some((line) => itemCategory(line.itemType, line.item) === "bouquet");
      const pantryLines = lines.filter(
        (line): line is Extract<CheckoutLine, { itemType: "flowerProduct" }> =>
          line.itemType === "flowerProduct" && line.item.category === "pantry",
      );
      const lowestPantryPrice = pantryLines.length
        ? Math.min(...pantryLines.map((line) => itemPriceCents(line.item) ?? 0))
        : 0;
      const discountCents =
        hasBouquet && pantryLines.length
          ? Math.min(RITUAL_BUNDLE_DISCOUNT_CENTS, lowestPantryPrice)
          : 0;

      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
      const stripe = getStripe();
      const discountTarget =
        discountCents > 0
          ? pantryLines.reduce((lowest, line) =>
              (itemPriceCents(line.item) ?? 0) < (itemPriceCents(lowest.item) ?? 0)
                ? line
                : lowest,
            )
          : null;

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      for (const line of lines) {
        const description = itemDescription(line.itemType, line.item);
        const isDiscountTarget = discountTarget?.item._id === line.item._id;
        const lineItemFor = (
          unitAmount: number,
          quantity: number,
          label?: string,
        ): Stripe.Checkout.SessionCreateParams.LineItem => ({
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: `${itemDisplayName(line.itemType, line.item)}${label ? ` — ${label}` : ""}`,
              description,
              images: line.item.imageUrl ? [line.item.imageUrl] : undefined,
            },
          },
          quantity,
        });

        if (isDiscountTarget) {
          const unitAmount = itemPriceCents(line.item);
          if (unitAmount === undefined) {
            return NextResponse.json({ error: "Cart item is missing a price" }, { status: 400 });
          }
          const discountedAmount = Math.max(0, unitAmount - discountCents);
          lineItems.push(lineItemFor(discountedAmount, 1, "Ritual Bundle Discount"));
          if (line.quantity > 1) {
            lineItems.push(lineItemFor(unitAmount, line.quantity - 1));
          }
          continue;
        }

        if (line.item.stripePriceId) {
          lineItems.push({ price: line.item.stripePriceId, quantity: line.quantity });
          continue;
        }

        const unitAmount = itemPriceCents(line.item);
        if (unitAmount === undefined) {
          return NextResponse.json({ error: "Cart item is missing a price" }, { status: 400 });
        }
        lineItems.push(lineItemFor(unitAmount, line.quantity));
      }

      const firstLine = lines[0];
      const allShippedNationwide = lines.every(
        (line) =>
          line.itemType === "flowerProduct" &&
          (line.item as FlowerProduct).shipsNationwide === true,
      );

      const sessionMetadata: Record<string, string> = {
        itemType: "cart",
        itemId: lines.map((line) => line.item._id).join(","),
        itemName: lines.map((line) => itemDisplayName(line.itemType, line.item)).join(" + "),
        productCategory: lines.map((line) => itemCategory(line.itemType, line.item)).join(","),
        billingLabel: itemBillingLabel(firstLine.itemType, firstLine.item),
        taxCategory: itemTaxCategory(firstLine.itemType, firstLine.item),
        ritualBundleDiscountCents: String(discountCents),
        ctaVariant: body.ctaVariant ?? "",
      };

      const transferDestination = transferDestinationForFlowerProducts(
        lines.map((line) => line.item as FlowerProduct),
      );

      const sessionCreate: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel`,
        line_items: lineItems,
        automatic_tax: { enabled: false },
        metadata: sessionMetadata,
        payment_method_types: ["card"],
        payment_intent_data: transferDestination
          ? { transfer_data: { destination: transferDestination } }
          : undefined,
      };

      if (allShippedNationwide) {
        const shipTo = cleanShippingAddress(body.shippingAddress);
        if (!shipTo) {
          return NextResponse.json(
            {
              error:
                "Enter your full US shipping address (name, street, city, state, ZIP) to calculate USPS shipping.",
            },
            { status: 400 },
          );
        }
        const shipLineErr = await addShippoShippingLineItem(lineItems, shipTo, sessionMetadata);
        if (shipLineErr) return shipLineErr;
        sessionCreate.line_items = lineItems;
        sessionCreate.metadata = sessionMetadata;
        sessionCreate.shipping_address_collection = undefined;
      } else {
        sessionCreate.shipping_address_collection = {
          allowed_countries: [...US_SHIPPING_COUNTRIES],
        };
      }

      const session = await stripe.checkout.sessions.create(sessionCreate);

      if (!session.url) {
        return NextResponse.json(
          { error: "Stripe did not return a checkout URL" },
          { status: 500 },
        );
      }
      return NextResponse.json({ url: session.url });
    }

    const itemType =
      body.itemType === "flowerProduct"
        ? "flowerProduct"
        : body.itemType === "pantryItem"
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

    const item = await fetchLine(itemType, itemId);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (isUnavailable(itemType, item)) {
      return NextResponse.json(
        { error: "This flower service is currently unavailable" },
        { status: 409 },
      );
    }

    if (itemType === "flowerProduct") {
      const shipErr = assertFlowerProductShips(item as FlowerProduct);
      if (shipErr) return shipErr;
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    const stripe = getStripe();
    const description = itemDescription(itemType, item);
    const itemName = itemDisplayName(itemType, item);
    const billingLabel = itemBillingLabel(itemType, item);
    const taxCategory = itemTaxCategory(itemType, item);
    const productCategory = itemCategory(itemType, item);

    const lineItemsSingle: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      item.stripePriceId
        ? { price: item.stripePriceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              unit_amount: item.priceCents,
              product_data: {
                name:
                  itemType === "flowerProduct"
                    ? `${itemName} — ${description}`
                    : item.name,
                description,
                images: item.imageUrl ? [item.imageUrl] : undefined,
              },
            },
            quantity: 1,
          },
    ];

    const sessionMetadataSingle: Record<string, string> = {
      itemType,
      itemId: item._id,
      itemName,
      productCategory,
      billingLabel,
      taxCategory,
      vendorId: item.vendorId ?? "",
      vendorName: item.vendorName ?? "",
      ctaVariant: body.ctaVariant ?? "",
    };

    const transferDestinationSingle =
      itemType === "flowerProduct"
        ? transferDestinationForFlowerProducts([item as FlowerProduct])
        : (() => {
            const dest = (item as Bouquet | PantryItem).vendorStripeAccountId?.trim();
            return dest || undefined;
          })();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      line_items: lineItemsSingle,
      automatic_tax: { enabled: false },
      payment_method_types: ["card"],
      payment_intent_data: transferDestinationSingle
        ? { transfer_data: { destination: transferDestinationSingle } }
        : undefined,
      metadata: sessionMetadataSingle,
    };

    if (itemType === "flowerProduct" && (item as FlowerProduct).shipsNationwide === true) {
      const shipTo = cleanShippingAddress(body.shippingAddress);
      if (!shipTo) {
        return NextResponse.json(
          {
            error:
              "Enter your full US shipping address (name, street, city, state, ZIP) to calculate USPS shipping.",
          },
          { status: 400 },
        );
      }
      const shipLineErr = await addShippoShippingLineItem(
        lineItemsSingle,
        shipTo,
        sessionMetadataSingle,
      );
      if (shipLineErr) return shipLineErr;
      sessionParams.line_items = lineItemsSingle;
      sessionParams.metadata = sessionMetadataSingle;
    } else if (itemType === "flowerProduct") {
      sessionParams.shipping_address_collection = {
        allowed_countries: [...US_SHIPPING_COUNTRIES],
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] failed", error);
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "Could not start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
