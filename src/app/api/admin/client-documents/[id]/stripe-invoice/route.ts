import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getOwnerSession } from "@/lib/adminAuth";
import { getClientDocumentById, setClientDocumentStripeInvoice } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { hasSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

const MIN_USD_CENTS = 50;

function daysUntilDue(isoDate: string | undefined): number {
  if (!isoDate?.trim()) return 30;
  const due = new Date(`${isoDate.trim()}T12:00:00`);
  if (Number.isNaN(due.getTime())) return 30;
  const now = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  return Math.max(1, Math.min(diff, 89));
}

function scopeSummary(doc: {
  packageTitle: string;
  floralScopeText?: string;
  notes?: string;
}): string {
  const t = doc.packageTitle?.trim();
  if (t) return t.slice(0, 200);
  const scope = doc.floralScopeText?.trim();
  if (scope) return scope.split("\n")[0]?.trim().slice(0, 200) ?? "Event florals";
  return "Event florals";
}

export async function POST(_req: Request, ctx: RouteParams) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasSupabaseService()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  const id = ctx.params.id;
  const doc = await getClientDocumentById(id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (doc.stripeInvoiceStatus === "paid" && doc.stripeInvoiceId?.trim()) {
    return NextResponse.json(
      {
        error:
          "Paid invoices cannot be changed. Create an adjustment invoice or new event order.",
        code: "invoice_paid",
      },
      { status: 409 },
    );
  }

  const invStatus = doc.stripeInvoiceStatus?.trim();
  if (
    doc.stripeInvoiceId?.trim() &&
    invStatus &&
    invStatus !== "paid" &&
    invStatus !== "void"
  ) {
    return NextResponse.json(
      {
        error:
          "An invoice is already on file. Use “Void old invoice + create updated invoice” to replace it.",
        code: "invoice_exists",
      },
      { status: 409 },
    );
  }

  const totalCents = doc.proposalTotalCents ?? 0;
  if (totalCents < MIN_USD_CENTS) {
    return NextResponse.json(
      {
        error: `Set a proposal total of at least $${MIN_USD_CENTS / 100} before creating a Stripe invoice.`,
      },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const eventType = doc.eventType?.trim() || "Event";
  const eventDate = doc.eventDate?.trim() || "TBD";
  const clientName = doc.clientName?.trim() || "Client";
  const lineDescription = `Ritualmaker Event Florals — ${eventType}, ${eventDate}`;
  const memoParts = [
    `Client: ${clientName}`,
    doc.eventDate?.trim() ? `Event date: ${doc.eventDate.trim()}` : null,
    doc.location?.trim() ? `Location: ${doc.location.trim()}` : null,
    `Scope: ${scopeSummary(doc)}`,
  ].filter(Boolean);
  const invoiceDescription = [
    "Ritualmaker floral proposal — event order",
    memoParts.join(" · "),
  ].join("\n");

  let customerId: string;
  const email = doc.clientEmail?.trim();
  if (email) {
    const found = await stripe.customers.list({ email, limit: 3 });
    customerId =
      found.data[0]?.id ??
      (
        await stripe.customers.create({
          email,
          name: clientName,
          metadata: { event_order_id: id, clientDocumentId: id },
        })
      ).id;
  } else {
    const c = await stripe.customers.create({
      name: clientName,
      metadata: { event_order_id: id, clientDocumentId: id },
    });
    customerId = c.id;
  }

  const days = daysUntilDue(doc.paymentDueDate);
  const inv = (await stripe.invoices.create({
    customer: customerId,
    collection_method: "send_invoice",
    days_until_due: days,
    description: invoiceDescription,
    footer:
      "Questions? Reply to this invoice or contact Ritualmaker using the site details on your proposal.",
    metadata: {
      event_order_id: id,
      clientDocumentId: id,
    },
    auto_advance: false,
  } as Stripe.InvoiceCreateParams)) as Stripe.Invoice;

  await stripe.invoiceItems.create({
    customer: customerId,
    invoice: inv.id,
    amount: totalCents,
    currency: "usd",
    description: lineDescription,
    metadata: {
      event_order_id: id,
      clientDocumentId: id,
    },
  } as Stripe.InvoiceItemCreateParams);

  const finalized = await stripe.invoices.finalizeInvoice(inv.id, {
    auto_advance: true,
  });

  const hosted = finalized.hosted_invoice_url ?? "";
  const pdf = finalized.invoice_pdf ?? null;
  const status = finalized.status ?? "open";

  const updated = await setClientDocumentStripeInvoice(id, {
    stripeInvoiceId: finalized.id,
    stripeInvoiceUrl: hosted,
    stripeInvoicePdfUrl: pdf,
    stripeInvoiceStatus: status,
    stripeInvoiceAmountCents: totalCents,
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Invoice created in Stripe but could not save to database" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    document: updated,
    invoiceId: finalized.id,
    hostedInvoiceUrl: hosted,
  });
}
