import { NextResponse } from "next/server";
import { requireAdminAccess, requireOwner, requireWritableAdmin } from "@/lib/adminAccess";
import { sanityWriteClient } from "@/sanity/writeClient";
import type { EventOrder } from "@/sanity/types";

export const runtime = "nodejs";

type EventOrderPatchBody = {
  id?: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  eventLocation?: string;
  proposalScope?: string;
  proposalTotalCents?: number;
  depositAmountCents?: number;
  balanceAmountCents?: number;
  balanceDueDate?: string;
  internalNotes?: string;
  clientFacingNotes?: string;
  status?: string;
  depositPaid?: boolean;
  balancePaid?: boolean;
  paidInFull?: boolean;
  proposalPdfSentManuallyAt?: string | null;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanDate(value: unknown) {
  const text = cleanText(value);
  return text || undefined;
}

function cleanCents(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : undefined;
}

async function fetchEventOrder(id: string) {
  return sanityWriteClient.fetch<EventOrder | null>(
    `*[_type == "weddingInquiry" && _id == $id][0]{
      _id,
      _createdAt,
      _updatedAt,
      name,
      email,
      phone,
      formType,
      services,
      photoInquiryKind,
      eventType,
      eventDate,
      venue,
      guestCount,
      budgetBand,
      notes,
      status,
      proposalScope,
      proposalTotalCents,
      depositAmountCents,
      balanceAmountCents,
      balanceDueDate,
      proposalPdfGeneratedAt,
      proposalPdfFileName,
      proposalPdfSentManuallyAt,
      depositPaymentLinkId,
      depositPaymentLinkUrl,
      balancePaymentLinkId,
      balancePaymentLinkUrl,
      stripeInvoiceId,
      stripeInvoiceUrl,
      stripeInvoicePdfUrl,
      stripeInvoiceStatus,
      stripeInvoiceCreatedAt,
      depositPaid,
      balancePaid,
      paidInFull,
      paymentStatusUpdatedAt,
      internalNotes,
      clientFacingNotes
    }`,
    { id },
  );
}

export async function PATCH(req: Request) {
  const access = await requireAdminAccess();
  if ("error" in access) return access.error;
  const ownerError = requireOwner(access);
  if (ownerError) return ownerError;
  const writableError = requireWritableAdmin(access);
  if (writableError) return writableError;

  let body: EventOrderPatchBody;
  try {
    body = (await req.json()) as EventOrderPatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Missing event order id" }, { status: 400 });
  }

  const existing = await fetchEventOrder(body.id);
  if (!existing) {
    return NextResponse.json({ error: "Event order not found" }, { status: 404 });
  }

  try {
    const proposalTotalCents = cleanCents(body.proposalTotalCents);
    const depositAmountCents = cleanCents(body.depositAmountCents);
    const explicitBalanceAmount = cleanCents(body.balanceAmountCents);
    const balanceAmountCents =
      explicitBalanceAmount ??
      (typeof proposalTotalCents === "number" && typeof depositAmountCents === "number"
        ? Math.max(0, proposalTotalCents - depositAmountCents)
        : undefined);

    const patch: Record<string, unknown> = {
      ...(typeof body.phone === "string" ? { phone: cleanText(body.phone) } : {}),
      eventType: cleanText(body.eventType) || existing.eventType || "Wedding",
      eventDate: cleanDate(body.eventDate) ?? existing.eventDate ?? "",
      venue: cleanText(body.eventLocation) || existing.venue || "",
      proposalScope: cleanText(body.proposalScope),
      proposalTotalCents,
      depositAmountCents,
      balanceAmountCents,
      balanceDueDate: cleanDate(body.balanceDueDate),
      internalNotes: cleanText(body.internalNotes),
      clientFacingNotes: cleanText(body.clientFacingNotes),
      status: cleanText(body.status) || existing.status || "replied",
    };

    if (typeof body.depositPaid === "boolean") patch.depositPaid = body.depositPaid;
    if (typeof body.balancePaid === "boolean") patch.balancePaid = body.balancePaid;
    if (typeof body.paidInFull === "boolean") patch.paidInFull = body.paidInFull;
    if (body.proposalPdfSentManuallyAt === null) {
      patch.proposalPdfSentManuallyAt = null;
    } else if (typeof body.proposalPdfSentManuallyAt === "string" && body.proposalPdfSentManuallyAt) {
      patch.proposalPdfSentManuallyAt = body.proposalPdfSentManuallyAt;
    }

    await sanityWriteClient.patch(body.id).set(patch).commit();
    const updated = await fetchEventOrder(body.id);
    return NextResponse.json({
      ok: true,
      order: updated,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[admin/event-orders] patch failed", error);
    return NextResponse.json({ error: "Could not update event order" }, { status: 500 });
  }
}
