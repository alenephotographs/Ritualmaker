import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/adminAuth";
import { getClientDocumentById } from "@/lib/db";
import { createStripeInvoiceForClientDocument } from "@/lib/stripeClientInvoices";
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

  const id = ctx.params.id;
  const doc = await getClientDocumentById(id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await createStripeInvoiceForClientDocument(doc);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.status },
    );
  }

  return NextResponse.json({
    document: result.document,
    invoiceId: result.invoiceId,
    hostedInvoiceUrl: result.hostedInvoiceUrl,
  });
}
