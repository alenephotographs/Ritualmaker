import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import {
  getAdminAccess,
  requireOwner,
  requireWritableAdmin,
} from "@/lib/adminAccess";
import { sanityWriteClient } from "@/sanity/writeClient";
import type { FlowerProduct, InventoryAuditHistoryEntry } from "@/sanity/types";

export const runtime = "nodejs";

type ProductCategory = FlowerProduct["category"];

type RequestBody = {
  id?: string;
  duplicateId?: string;
  name?: string;
  publicName?: string;
  shortDescription?: string;
  displayDescription?: string;
  category?: ProductCategory;
  tier?: FlowerProduct["tier"];
  priceCents?: number;
  active?: boolean;
  inStock?: boolean;
  quantity?: number | null;
  recurringItem?: boolean;
  imageUrl?: string;
  vendorId?: string;
  billingLabel?: string;
  taxCategory?: string;
  internalNotes?: string;
  sortOrder?: number;
};

const categories = new Set<ProductCategory>([
  "bouquet",
  "pantry",
  "bundle",
  "wedding_event",
  "vendor_item",
  "other",
]);

const tiers = new Set<NonNullable<FlowerProduct["tier"]>>([
  "small",
  "standard",
  "premium",
  "custom",
]);

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function numberOrUndefined(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : undefined;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function auditPatch(
  doc: { inventoryAuditHistory?: InventoryAuditHistoryEntry[] },
  session: Session,
  isOwner: boolean,
  vendorId: string | undefined,
  summary: string,
) {
  const now = new Date().toISOString();
  const historyEntry: InventoryAuditHistoryEntry = {
    _key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    editedAt: now,
    editedByEmail: session.user?.email ?? "",
    editedByRole: isOwner ? "owner" : "vendor",
    editedByVendorId: vendorId ?? "",
    changeSummary: summary,
  };
  const previousHistory = Array.isArray(doc.inventoryAuditHistory)
    ? doc.inventoryAuditHistory
    : [];

  return {
    inventoryAudit: {
      lastEditedAt: now,
      lastEditedByEmail: session.user?.email ?? "",
      lastEditedByRole: isOwner ? "owner" : "vendor",
      lastEditedByVendorId: vendorId ?? "",
    },
    inventoryAuditHistory: [historyEntry, ...previousHistory].slice(0, 10),
  };
}

function setVendorField(data: Record<string, unknown>, vendorId: string | undefined) {
  if (vendorId) {
    data.vendor = { _type: "reference", _ref: vendorId };
  } else {
    data.vendor = null;
  }
}

async function ensureVendorVisible(vendorId: string | undefined) {
  if (!vendorId) return;
  const vendor = await sanityWriteClient.fetch<{ _id: string } | null>(
    `*[_type == "vendor" && _id == $id][0]{_id}`,
    { id: vendorId },
  );
  if (!vendor?._id) {
    throw new Error("Invalid vendor");
  }
}

async function success(id?: string) {
  return NextResponse.json({
    ok: true,
    id,
    item: id ? await fetchProduct(id) : undefined,
    savedAt: new Date().toISOString(),
  });
}

const productProjection = `{
  _id,
  _updatedAt,
  name,
  "slug": slug.current,
  publicName,
  tier,
  shortDescription,
  displayDescription,
  category,
  priceCents,
  active,
  inStock,
  quantity,
  recurringItem,
  billingLabel,
  taxCategory,
  internalNotes,
  metadata,
  "vendorId": vendor->_id,
  "vendorName": vendor->name,
  "vendorStripeAccountId": vendor->stripeAccountId,
  inventoryAudit,
  "inventoryAuditHistory": inventoryAuditHistory[0...10],
  stripePriceId,
  stripeProductId,
  "imageUrl": coalesce(imageUrl, externalImageUrl, image.asset->url),
  sortOrder
}`;

async function fetchProduct(id: string) {
  return sanityWriteClient.fetch(`*[_type == "flowerProduct" && _id == $id][0]${productProjection}`, {
    id,
  });
}

function validateProductInput(body: RequestBody, partial = false) {
  const data: Record<string, unknown> = {};
  const name = cleanString(body.name);
  if (!partial || name !== undefined) {
    if (!name) throw new Error("Name is required");
    data.name = name;
    data.slug = { _type: "slug", current: slugify(name) };
  }

  const publicName = cleanString(body.publicName);
  if (!partial || publicName !== undefined) {
    data.publicName = publicName || name || "";
  }

  if (!partial || body.category !== undefined) {
    if (!body.category || !categories.has(body.category)) {
      throw new Error("Choose a valid category");
    }
    data.category = body.category;
  }

  if (!partial || body.tier !== undefined) {
    data.tier = body.tier && tiers.has(body.tier) ? body.tier : "";
  }

  if (!partial || body.priceCents !== undefined) {
    const priceCents = numberOrUndefined(body.priceCents);
    if (priceCents === undefined || priceCents < 0) {
      throw new Error("Enter a valid price");
    }
    data.priceCents = priceCents;
  }

  const textFields = [
    ["shortDescription", body.shortDescription],
    ["displayDescription", body.displayDescription],
    ["imageUrl", body.imageUrl],
    ["billingLabel", body.billingLabel],
    ["taxCategory", body.taxCategory],
    ["internalNotes", body.internalNotes],
  ] as const;
  for (const [key, value] of textFields) {
    if (!partial || value !== undefined) {
      data[key] = cleanString(value) ?? "";
    }
  }

  if (!partial || body.active !== undefined) data.active = body.active !== false;
  if (!partial || body.inStock !== undefined) data.inStock = body.inStock === true;
  if (!partial || body.recurringItem !== undefined) {
    data.recurringItem = body.recurringItem === true;
  }
  if (!partial || body.quantity !== undefined) {
    data.quantity =
      body.quantity === null
        ? null
        : typeof body.quantity === "number" && Number.isFinite(body.quantity)
          ? Math.max(0, Math.round(body.quantity))
          : undefined;
  }
  if (!partial || body.sortOrder !== undefined) {
    data.sortOrder =
      typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
        ? Math.round(body.sortOrder)
        : 100;
  }

  if (!partial && !data.billingLabel) data.billingLabel = "Flower Service";
  if (!partial && !data.taxCategory) data.taxCategory = "flower_service";
  return data;
}

async function duplicateProduct(
  sourceId: string,
  session: Session,
  access: Extract<ReturnType<typeof getAdminAccess>, { session: Session }>,
) {
  const source = await sanityWriteClient.fetch<Record<string, unknown> | null>(
    `*[_type == "flowerProduct" && _id == $id][0]{
      name,
      publicName,
      slug,
      shortDescription,
      displayDescription,
      category,
      tier,
      priceCents,
      active,
      inStock,
      quantity,
      recurringItem,
      imageUrl,
      vendor,
      billingLabel,
      taxCategory,
      internalNotes,
      stripeProductId,
      stripePriceId,
      sortOrder
    }`,
    { id: sourceId },
  );
  if (!source) throw new Error("Product not found");
  const vendor = source.vendor as { _ref?: string } | undefined;
  if (!access.isOwner && vendor?._ref !== access.vendorId) {
    throw new Error("Forbidden");
  }
  const name = `${String(source.name ?? "Flower service")} copy`;
  const created = await sanityWriteClient.create({
    ...source,
    _type: "flowerProduct",
    name,
    publicName: `${String(source.publicName ?? source.name ?? "Flower service")} copy`,
    slug: { _type: "slug", current: `${slugify(name)}-${Date.now()}`.slice(0, 96) },
    active: false,
    inStock: false,
    sortOrder:
      typeof source.sortOrder === "number" && Number.isFinite(source.sortOrder)
        ? Number(source.sortOrder) + 1
        : 100,
    ...auditPatch({}, session, access.isOwner, access.vendorId, "duplicated product"),
  });
  return created._id;
}

async function saveProduct(req: Request) {
  const session = await auth();
  const access = getAdminAccess(session);
  const writable = requireWritableAdmin(access);
  if (writable) return writable;

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if ("error" in access) return access.error;
    if (body.duplicateId) {
      const id = await duplicateProduct(body.duplicateId, access.session, access);
      return NextResponse.json({ ok: true, id });
    }
    const data = validateProductInput(body);
    const vendorId = access.isOwner ? cleanString(body.vendorId) : access.vendorId;
    await ensureVendorVisible(vendorId);
    setVendorField(data, vendorId);
    const slug = (data.slug as { current?: string } | undefined)?.current;
    const existing = slug
      ? await sanityWriteClient.fetch<{
          _id: string;
          inventoryAuditHistory?: InventoryAuditHistoryEntry[];
        } | null>(
          `*[_type == "flowerProduct" && slug.current == $slug][0]{_id, inventoryAuditHistory}`,
          { slug },
        )
      : null;

    if (existing?._id) {
      await sanityWriteClient
        .patch(existing._id)
        .set({
          ...data,
          ...auditPatch(
            existing,
            access.session,
            access.isOwner,
            access.vendorId,
            "updated product",
          ),
        })
        .commit();
      return await success(existing._id);
    }

    const doc = await sanityWriteClient.create({
      _type: "flowerProduct",
      ...data,
      ...auditPatch({}, access.session, access.isOwner, access.vendorId, "created product"),
    });
    return await success(doc._id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  const access = getAdminAccess(session);
  const writable = requireWritableAdmin(access);
  if (writable) return writable;

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  try {
    if ("error" in access) return access.error;
    const doc = await sanityWriteClient.fetch<{
      _id: string;
      vendor?: { _ref?: string };
      inventoryAuditHistory?: InventoryAuditHistoryEntry[];
    } | null>(
      `*[_type == "flowerProduct" && _id == $id][0]{_id, vendor, inventoryAuditHistory}`,
      { id: body.id },
    );
    if (!doc) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (!access.isOwner && doc.vendor?._ref !== access.vendorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = validateProductInput(body, true);
    if (body.vendorId !== undefined) {
      const ownerError = requireOwner(access);
      if (ownerError) return ownerError;
      const vendorId = cleanString(body.vendorId);
      await ensureVendorVisible(vendorId);
      setVendorField(data, vendorId);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    await sanityWriteClient
      .patch(doc._id)
      .set({
        ...data,
        ...auditPatch(doc, access.session, access.isOwner, access.vendorId, "updated product"),
      })
      .commit();
    return await success(doc._id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export const POST = saveProduct;

export async function DELETE(req: Request) {
  const session = await auth();
  const access = getAdminAccess(session);
  const writable = requireWritableAdmin(access);
  if (writable) return writable;
  const ownerError = requireOwner(access);
  if (ownerError) return ownerError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

  await sanityWriteClient.patch(id).set({ active: false, inStock: false }).commit();
  return await success(id);
}
