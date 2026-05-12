import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateProductForAdmin } from "@/lib/db";
import { hasSupabaseService } from "@/lib/supabase/service";

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
  if (!hasSupabaseService()) {
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

    const isOwner = session.user.role === "owner";
    const result = await updateProductForAdmin({
      kind: body.kind,
      id: body.id,
      available: body.available,
      comingSoon: body.comingSoon,
      vendorId: body.vendorId,
      userEmail: session.user.email,
      isOwner,
      userVendorId: session.user.vendorId,
    });

    if (!result.ok) {
      const status =
        result.message === "Product not found"
          ? 404
          : result.message === "Forbidden"
            ? 403
            : result.message === "No updatable fields provided" || result.message === "Invalid vendor"
              ? 400
              : 500;
      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/products] failed", error);
    return NextResponse.json({ error: "Could not update product" }, { status: 500 });
  }
}
