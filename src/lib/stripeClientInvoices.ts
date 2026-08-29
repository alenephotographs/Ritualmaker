import "server-only";

import type Stripe from "stripe";

import { setClientDocumentStripeInvoice } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type { ClientDocumentRecord } from "@/lib/types/clientDocument";

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

export function isClientInvoiceEnabled(doc: ClientDocumentRecord): boolean {
  return doc.documentType === "invoice";
}

export function validateStripeInvoiceCreation(doc: ClientDocumentRecord):
  | { ok: true }
  | { ok: false; error: string; code?: string; status: number } {
  if (doc.stripeInvoiceStatus === "paid" && doc.stripeInvoiceId?.trim()) {
    return {
      ok: false,
      error:
        "Paid invoices cannot be changed. Create an adjustment invoice or new event order.",
      code: "invoice_paid",
      status: 409,
    };
  }

  const invStatus = doc.stripeInvoiceStatus?.trim();
  if (
    doc.stripeInvoiceId?.trim() &&
    invStatus &&
    invStatus !== "paid" &&
    invStatus !== "void"
  ) {
    return {
      ok: false,
      error:
        "An invoice is already on file. Use the existing invoice or void it before creating another.",
      code: "invoice_exists",
      status: 409,
    };
  }

  const totalCents = doc.proposalTotalCents ?? 0;
  if (totalCents < MIN_USD_CENTS) {
    return {
      ok: false,
      error: `Set a proposal total of at least $${MIN_USD_CENTS / 100} before creating a Stripe invoice.`,
      status: 400,
    };
  }

  return { ok: true };
}

export async function createStripeInvoiceForClientDocument(
  doc: ClientDocumentRecord,
) {
  const validation = validateStripeInvoiceCreation(doc);
  if (!validation.ok) {
    return validation;
  }

  const stripe = getStripe();
  const eventType = doc.eventType?.trim() || "Event";
  const eventDate = doc.eventDate?.trim() || "TBD";
  const clientName = doc.clientName?.trim() || "Client";
  const totalCents = doc.proposalTotalCents ?? 0;
  const lineDescription = `Ritualmaker Event Florals - ${eventType}, ${eventDate}`;
  const memoParts = [
    `Client: ${clientName}`,
    doc.eventDate?.trim() ? `Event date: ${doc.eventDate.trim()}` : null,
    doc.location?.trim() ? `Location: ${doc.location.trim()}` : null,
    `Scope: ${scopeSummary(doc)}`,
  ].filter(Boolean);
  const invoiceDescription = [
    "Ritualmaker floral proposal - event order",
    memoParts.join(" - "),
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
          metadata: { event_order_id: doc.id, clientDocumentId: doc.id },
        })
      ).id;
  } else {
    const c = await stripe.customers.create({
      name: clientName,
      metadata: { event_order_id: doc.id, clientDocumentId: doc.id },
    });
    customerId = c.id;
  }

  const inv = (await stripe.invoices.create({
    customer: customerId,
    collection_method: "send_invoice",
    days_until_due: daysUntilDue(doc.paymentDueDate),
    description: invoiceDescription,
    footer:
      "Questions? Reply to this invoice or contact Ritualmaker using the site details on your proposal.",
    metadata: {
      event_order_id: doc.id,
      clientDocumentId: doc.id,
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
      event_order_id: doc.id,
      clientDocumentId: doc.id,
    },
  } as Stripe.InvoiceItemCreateParams);

  const finalized = await stripe.invoices.finalizeInvoice(inv.id, {
    auto_advance: true,
  });

  const updated = await setClientDocumentStripeInvoice(doc.id, {
    stripeInvoiceId: finalized.id,
    stripeInvoiceUrl: finalized.hosted_invoice_url ?? "",
    stripeInvoicePdfUrl: finalized.invoice_pdf ?? null,
    stripeInvoiceStatus: finalized.status ?? "open",
    stripeInvoiceAmountCents: totalCents,
  });

  if (!updated) {
    return {
      ok: false as const,
      error: "Invoice created in Stripe but could not save to database",
      status: 500,
    };
  }

  return {
    ok: true as const,
    document: updated,
    invoiceId: finalized.id,
    hostedInvoiceUrl: finalized.hosted_invoice_url ?? "",
    invoicePdfUrl: finalized.invoice_pdf ?? null,
  };
}
