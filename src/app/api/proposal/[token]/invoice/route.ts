import { NextResponse } from "next/server";

import { getClientDocumentByPublicToken } from "@/lib/db";
import {
  createStripeInvoiceForClientDocument,
  isClientInvoiceEnabled,
} from "@/lib/stripeClientInvoices";
import { hasSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

type RouteParams = { params: { token: string } };

const noStoreHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function invoiceUrl(doc: {
  stripeInvoicePdfUrl?: string;
  stripeInvoiceUrl?: string;
}): string {
  return doc.stripeInvoicePdfUrl?.trim() || doc.stripeInvoiceUrl?.trim() || "";
}

export async function GET(_req: Request, ctx: RouteParams) {
  const token = ctx.params.token?.trim();
  if (!token) {
    return NextResponse.json(
      { error: "Missing token" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const doc = await getClientDocumentByPublicToken(token);
  if (!doc) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: noStoreHeaders },
    );
  }

  const url = invoiceUrl(doc);
  if (!url) {
    return NextResponse.json(
      { error: "No invoice is available yet." },
      { status: 404, headers: noStoreHeaders },
    );
  }

  return NextResponse.redirect(url, {
    status: 302,
    headers: noStoreHeaders,
  });
}

export async function POST(_req: Request, ctx: RouteParams) {
  if (!hasSupabaseService()) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 500, headers: noStoreHeaders },
    );
  }

  const token = ctx.params.token?.trim();
  if (!token) {
    return NextResponse.json(
      { error: "Missing token" },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const doc = await getClientDocumentByPublicToken(token);
  if (!doc) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: noStoreHeaders },
    );
  }

  const existing = invoiceUrl(doc);
  if (existing) {
    return NextResponse.json({ url: existing }, { headers: noStoreHeaders });
  }

  if (!isClientInvoiceEnabled(doc)) {
    return NextResponse.json(
      { error: "Invoice generation is not enabled for this proposal." },
      { status: 403, headers: noStoreHeaders },
    );
  }

  if (!doc.proposalApprovedAt) {
    return NextResponse.json(
      { error: "Approve the proposal before generating an invoice." },
      { status: 403, headers: noStoreHeaders },
    );
  }

  const result = await createStripeInvoiceForClientDocument(doc);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: result.status, headers: noStoreHeaders },
    );
  }

  return NextResponse.json(
    { url: result.invoicePdfUrl || result.hostedInvoiceUrl },
    { headers: noStoreHeaders },
  );
}
