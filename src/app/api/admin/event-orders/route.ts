import { NextResponse } from "next/server";
import { requireAdminAccess, requireOwner, requireWritableAdmin } from "@/lib/adminAccess";
import { sanityWriteClient } from "@/sanity/writeClient";
import type { EventOrder } from "@/sanity/types";

export const runtime = "nodejs";

type EventOrderPatchBody = {
  id?: string;
  eventType?: string;
  eventDate?: string;
  eventLocation?: string;
  proposalScope?: string;
  proposalTotalCents?: number;
  depositAmountCents?: number;
  balanceAmountCents?: number;
  balanceDueDate?: string;
  internalNotes?: string;
  status?: string;
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
      eventType,
      eventDate,
      venue,
      proposalScope,
      proposalTotalCents,
      depositAmountCents,
      balanceAmountCents,
      balanceDueDate,
      internalNotes,
      status
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
      eventType: cleanText(body.eventType) || existing.eventType || "Wedding",
      eventDate: cleanDate(body.eventDate) ?? existing.eventDate ?? "",
      venue: cleanText(body.eventLocation) || existing.eventLocation || existing.venue || "",
      proposalScope: cleanText(body.proposalScope),
      proposalTotalCents,
      depositAmountCents,
      balanceAmountCents,
      balanceDueDate: cleanDate(body.balanceDueDate),
      internalNotes: cleanText(body.internalNotes),
      status: cleanText(body.status) || existing.status || "replied",
      eventOrderUpdatedAt: new Date().toISOString(),
    };

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
