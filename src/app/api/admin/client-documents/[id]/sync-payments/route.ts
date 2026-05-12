import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/adminAuth";
import { syncClientDocumentStripePaymentsFromApi } from "@/lib/db";
import { hasSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

export async function POST(_req: Request, ctx: RouteParams) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasSupabaseService()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  const doc = await syncClientDocumentStripePaymentsFromApi(ctx.params.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ document: doc });
}
