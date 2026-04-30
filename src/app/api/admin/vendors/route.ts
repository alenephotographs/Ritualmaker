import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAccess";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

type VendorBody = {
  id?: string;
  action?: "create" | "update" | "delete";
  name?: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  payoutMethodNotes?: string;
  commissionOrWholesaleNotes?: string;
  active?: boolean;
  internalNotes?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const vendorProjection = `{
  _id,
  name,
  "slug": slug.current,
  contactName,
  contactEmail,
  phone,
  accessCode,
  active,
  payoutMethodNotes,
  commissionOrWholesaleNotes,
  internalNotes,
  stripeAccountId,
  stripeOnboardingComplete,
  stripeDetailsSubmitted,
  stripeChargesEnabled,
  stripePayoutsEnabled,
  stripeRequirementsCurrentlyDue,
  stripeRequirementsPastDue,
  stripeRequirementsDisabledReason,
  stripeComplianceLastSyncedAt
}`;

async function fetchVendor(id: string) {
  return sanityWriteClient.fetch(`*[_type == "vendor" && _id == $id][0]${vendorProjection}`, {
    id,
  });
}

function success(vendor: unknown) {
  return NextResponse.json({
    ok: true,
    vendor,
    savedAt: new Date().toISOString(),
  });
}

export const runtime = "nodejs";

async function saveVendor(req: Request) {
  const access = await requireAdminAccess();
  if ("error" in access) return access.error;
  if (!access.isOwner) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  if (!hasSanityWriteClient()) {
    return NextResponse.json(
      { error: "Vendor updates are temporarily unavailable" },
      { status: 500 },
    );
  }

  let body: VendorBody;
  try {
    body = (await req.json()) as VendorBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const action = body.action ?? (body.id ? "update" : "create");
    if (action === "delete") {
      if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await sanityWriteClient.patch(body.id).set({ active: false }).commit();
      return success(await fetchVendor(body.id));
    }

    const name = clean(body.name);
    if (!name) return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });

    const doc = {
      name,
      slug: { _type: "slug", current: slugify(name) || `vendor-${Date.now()}` },
      contactName: clean(body.contactName),
      contactEmail: clean(body.contactEmail).toLowerCase(),
      phone: clean(body.phone),
      payoutMethodNotes: clean(body.payoutMethodNotes),
      commissionOrWholesaleNotes: clean(body.commissionOrWholesaleNotes),
      active: body.active !== false,
      internalNotes: clean(body.internalNotes),
    };

    if (action === "create") {
      const created = await sanityWriteClient.create({
        _type: "vendor",
        ...doc,
      });
      return success(await fetchVendor(created._id));
    }

    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await sanityWriteClient.patch(body.id).set(doc).commit();
    return success(await fetchVendor(body.id));
  } catch (error) {
    console.error("[admin/vendors] failed", error);
    return NextResponse.json({ error: "Could not save vendor" }, { status: 500 });
  }
}

export const POST = saveVendor;
export const PATCH = saveVendor;
