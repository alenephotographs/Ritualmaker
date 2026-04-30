import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAccess";
import { getEventOrderById } from "@/lib/eventOrders";
import { getStripe } from "@/lib/stripe";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

export const runtime = "nodejs";

function asUnixTimestampFromDateInput(date?: string) {
  if (!date) return undefined;
  const parsed = new Date(`${date}T23:59:59.000Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return Math.floor(parsed.getTime() / 1000);
}

export async function POST(_req: Request, context: { params: { id: string } }) {
  const access = await requireAdminAccess();
  if ("error" in access) return access.error;
  if (!access.isOwner) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  if (!hasSanityWriteClient()) {
    return NextResponse.json({ error: "Admin updates are temporarily unavailable" }, { status: 500 });
  }

  const order = await getEventOrderById(context.params.id);
  if (!order) {
    return NextResponse.json({ error: "Event order not found" }, { status: 404 });
  }
  if (!order.email) {
    return NextResponse.json({ error: "Client email is required to create invoice" }, { status: 400 });
  }
  if (!order.proposalTotalCents || order.proposalTotalCents <= 0) {
    return NextResponse.json({ error: "Proposal total must be greater than 0" }, { status: 400 });
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: order.email,
    name: order.name || undefined,
    metadata: {
      event_order_id: order._id,
    },
  });

  const dueDate = asUnixTimestampFromDateInput(order.balanceDueDate || order.eventDate);
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    due_date: dueDate,
    metadata: {
      event_order_id: order._id,
      payment_type: "invoice",
    },
    description: `Event order ${order._id}: ${order.proposalScope || order.notes || order.eventType}`,
  });

  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    amount: order.proposalTotalCents,
    currency: "usd",
    description: order.proposalScope || `Event order ${order._id} (${order.eventType})`,
  });

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id, {
    auto_advance: true,
  });

  await sanityWriteClient
    .patch(order._id)
    .set({
      stripeInvoiceId: finalized.id,
      stripeInvoiceUrl: finalized.hosted_invoice_url ?? "",
      stripeInvoicePdfUrl: finalized.invoice_pdf ?? "",
      stripeInvoiceStatus: finalized.status ?? "draft",
      stripeInvoiceCreatedAt: new Date().toISOString(),
      paymentStatusUpdatedAt: new Date().toISOString(),
    })
    .commit();

  return NextResponse.json({
    ok: true,
    invoiceId: finalized.id,
    hostedInvoiceUrl: finalized.hosted_invoice_url,
    invoicePdfUrl: finalized.invoice_pdf,
    status: finalized.status,
  });
}
