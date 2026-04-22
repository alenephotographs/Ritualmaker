import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";
import type { InventoryAuditHistoryEntry, Vendor } from "@/sanity/types";

type RequestBody = {
  kind?: "bouquet" | "pantryItem";
  id?: string;
  available?: boolean;
  vendorId?: string;
  comingSoon?: boolean;
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasSanityWriteClient()) {
    return NextResponse.json(
      { error: "Product updates are temporarily unavailable" },
      { status: 500 },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (!body.id || !body.kind) {
      return NextResponse.json({ error: "Missing id or kind" }, { status: 400 });
    }
    if (body.kind !== "bouquet" && body.kind !== "pantryItem") {
      return NextResponse.json({ error: "Invalid product kind" }, { status: 400 });
    }

    const doc = await sanityWriteClient.fetch<{
      _id: string;
      vendor?: { _ref: string };
      inventoryAuditHistory?: InventoryAuditHistoryEntry[];
    } | null>(
      `*[_type == $type && _id == $id][0]{_id, vendor, inventoryAuditHistory}`,
      { id: body.id, type: body.kind },
    );
    if (!doc) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isOwner = session.user.role === "owner";
    const userVendorId = session.user.vendorId;
    if (!isOwner) {
      if (!userVendorId) {
        return NextResponse.json({ error: "Vendor identity missing" }, { status: 403 });
      }
      if (doc.vendor?._ref !== userVendorId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const patch = sanityWriteClient.patch(doc._id);
    let changed = false;
    if (typeof body.available === "boolean") {
      patch.set({ available: body.available });
      changed = true;
    }
    if (typeof body.comingSoon === "boolean" && body.kind === "pantryItem") {
      patch.set({ comingSoon: body.comingSoon });
      changed = true;
    }
    if (body.vendorId && isOwner) {
      const vendor = await sanityWriteClient.fetch<Vendor | null>(
        `*[_type == "vendor" && _id == $id][0]{_id}`,
        { id: body.vendorId },
      );
      if (vendor?._id) {
        patch.set({ vendor: { _type: "reference", _ref: vendor._id } });
        changed = true;
      }
    }

    if (!changed) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const changeParts: string[] = [];
    if (typeof body.available === "boolean") {
      changeParts.push(`available=${body.available ? "true" : "false"}`);
    }
    if (typeof body.comingSoon === "boolean" && body.kind === "pantryItem") {
      changeParts.push(`comingSoon=${body.comingSoon ? "true" : "false"}`);
    }
    if (body.vendorId && isOwner) {
      changeParts.push(`vendorReassigned=${body.vendorId}`);
    }

    const historyEntry: InventoryAuditHistoryEntry = {
      _key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      editedAt: now,
      editedByEmail: session.user.email ?? "",
      editedByRole: isOwner ? "owner" : "vendor",
      editedByVendorId: userVendorId ?? "",
      changeSummary: changeParts.join(", "),
    };
    const previousHistory = Array.isArray(doc.inventoryAuditHistory)
      ? doc.inventoryAuditHistory
      : [];
    const nextHistory = [historyEntry, ...previousHistory].slice(0, 10);

    patch.set({
      inventoryAudit: {
        lastEditedAt: now,
        lastEditedByEmail: session.user.email ?? "",
        lastEditedByRole: isOwner ? "owner" : "vendor",
        lastEditedByVendorId: userVendorId ?? "",
      },
      inventoryAuditHistory: nextHistory,
    });

    await patch.commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/products] failed", error);
    return NextResponse.json({ error: "Could not update product" }, { status: 500 });
  }
}
