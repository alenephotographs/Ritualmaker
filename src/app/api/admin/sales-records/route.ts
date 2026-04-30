import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAccess";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

type SalesRecordBody = {
  id?: string;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  itemType?: string;
  itemId?: string;
  customerName?: string;
  customerEmail?: string;
  itemName?: string;
  amountCents?: number;
  saleDate?: string;
  paymentMethod?: "cash" | "venmo" | "card" | "invoice" | "other";
  vendorId?: string;
  notes?: string;
  taxCategory?: string;
  billingType?: string;
  delete?: boolean;
};

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanAmount(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : undefined;
}

function cleanPaymentMethod(value: unknown) {
  return value === "cash" ||
    value === "venmo" ||
    value === "card" ||
    value === "invoice" ||
    value === "other"
    ? value
    : "other";
}

export async function POST(req: Request) {
  const access = await requireAdminAccess();
  if ("error" in access) return access.error;
  if (!access.isOwner) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  if (!hasSanityWriteClient()) {
    return NextResponse.json(
      { error: "Billing records are temporarily unavailable" },
      { status: 500 },
    );
  }

  let body: SalesRecordBody;
  try {
    body = (await req.json()) as SalesRecordBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.delete) {
      if (!body.id) {
        return NextResponse.json({ error: "Missing billing record id" }, { status: 400 });
      }
      await sanityWriteClient.delete(body.id);
      return NextResponse.json({ ok: true });
    }

    const itemName = cleanText(body.itemName);
    const amountCents = cleanAmount(body.amountCents);
    if (!itemName || typeof amountCents !== "number") {
      return NextResponse.json(
        { error: "Item/service name and amount are required" },
        { status: 400 },
      );
    }

    const vendorId = cleanText(body.vendorId);
    const doc = {
      _type: "flowerSalesRecord",
      checkoutSessionId: cleanText(body.checkoutSessionId),
      paymentIntentId: cleanText(body.paymentIntentId),
      itemType: cleanText(body.itemType),
      itemId: cleanText(body.itemId),
      customerName: cleanText(body.customerName),
      customerEmail: cleanText(body.customerEmail),
      itemName,
      amountCents,
      saleDate: cleanText(body.saleDate) || new Date().toISOString().slice(0, 10),
      paymentMethod: cleanPaymentMethod(body.paymentMethod),
      notes: cleanText(body.notes),
      taxCategory: cleanText(body.taxCategory) || "flower service",
      billingType: cleanText(body.billingType) || "flower service",
      ...(vendorId
        ? { vendor: { _type: "reference" as const, _ref: vendorId } }
        : {}),
    };

    if (body.id) {
      await sanityWriteClient.patch(body.id).set(doc).commit();
      return NextResponse.json({ ok: true, id: body.id });
    }

    const created = await sanityWriteClient.create(doc);
    return NextResponse.json({ ok: true, id: created._id });
  } catch (error) {
    console.error("[admin/sales-records] failed", error);
    return NextResponse.json(
      { error: "Could not save billing record" },
      { status: 500 },
    );
  }
}
