import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAccess";
import { getStripe } from "@/lib/stripe";
import { getEventOrderById, inferEventType } from "@/lib/eventOrders";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

export const runtime = "nodejs";

type Body = { paymentType?: "deposit" | "balance" };

function amountForType(order: Awaited<ReturnType<typeof getEventOrderById>>, paymentType: "deposit" | "balance") {
  if (!order) return 0;
  return paymentType === "deposit" ? order.depositAmountCents ?? 0 : order.balanceAmountCents ?? 0;
}

export async function POST(req: Request, context: { params: { id: string } }) {
  const access = await requireAdminAccess();
  if ("error" in access) return access.error;
  if (!access.isOwner) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  if (!hasSanityWriteClient()) {
    return NextResponse.json({ error: "Admin updates are temporarily unavailable" }, { status: 500 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const paymentType = body.paymentType === "balance" ? "balance" : "deposit";
  const order = await getEventOrderById(context.params.id);
  if (!order) {
    return NextResponse.json({ error: "Event order not found" }, { status: 404 });
  }
  if (!order.email) {
    return NextResponse.json({ error: "Client email is required before creating payment links" }, { status: 400 });
  }

  const amountCents = amountForType(order, paymentType);
  if (!amountCents || amountCents <= 0) {
    return NextResponse.json({ error: `Set a ${paymentType} amount before creating the link` }, { status: 400 });
  }

  const stripe = getStripe();
  const lineLabel =
    paymentType === "deposit"
      ? `Deposit — ${order.name || "Event order"}`
      : `Balance — ${order.name || "Event order"}`;

  const product = await stripe.products.create({
    name: lineLabel,
    description: order.proposalScope || order.notes || inferEventType(order),
    metadata: {
      event_order_id: order._id,
      payment_type: paymentType,
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: amountCents,
  });

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: {
      event_order_id: order._id,
      payment_type: paymentType,
      event_type: inferEventType(order),
      customer_email: order.email || "",
    },
  });

  const now = new Date().toISOString();
  const patch =
    paymentType === "deposit"
      ? {
          depositPaymentLinkId: link.id,
          depositPaymentLinkUrl: link.url,
          paymentStatusUpdatedAt: now,
        }
      : {
          balancePaymentLinkId: link.id,
          balancePaymentLinkUrl: link.url,
          paymentStatusUpdatedAt: now,
        };

  await sanityWriteClient.patch(order._id).set(patch).commit();

  return NextResponse.json({
    ok: true,
    paymentType,
    paymentLinkId: link.id,
    paymentLinkUrl: link.url,
    savedAt: now,
  });
}
