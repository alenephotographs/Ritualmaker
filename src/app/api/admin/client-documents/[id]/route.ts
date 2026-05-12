import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/adminAuth";
import { parseClientDocumentPatchBody } from "@/lib/clientDocumentPayload";
import { getClientDocumentById, patchClientDocument } from "@/lib/db";
import { hasSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

export async function GET(_req: Request, ctx: RouteParams) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasSupabaseService()) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 500 },
    );
  }
  const { id } = ctx.params;
  const doc = await getClientDocumentById(id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ document: doc });
}

export async function PATCH(req: Request, ctx: RouteParams) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasSupabaseService()) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 500 },
    );
  }
  const { id } = ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const existing = await getClientDocumentById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (parseClientDocumentPatchBody(body) === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const doc = await patchClientDocument(id, body);
  if (!doc) {
    return NextResponse.json({ error: "Could not update document" }, { status: 500 });
  }
  return NextResponse.json({ document: doc });
}
