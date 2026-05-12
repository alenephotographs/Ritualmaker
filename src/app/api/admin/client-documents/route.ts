import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/adminAuth";
import { parseClientDocumentBody } from "@/lib/clientDocumentPayload";
import {
  insertClientDocument,
  listClientDocuments,
} from "@/lib/db";
import { hasSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET() {
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
  const docs = await listClientDocuments();
  return NextResponse.json({ documents: docs });
}

export async function POST(req: Request) {
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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const payload = parseClientDocumentBody(body);
  if (!payload) {
    return NextResponse.json(
      { error: "packageTitle is required" },
      { status: 400 },
    );
  }
  const doc = await insertClientDocument(payload);
  if (!doc) {
    return NextResponse.json({ error: "Could not create document" }, { status: 500 });
  }
  return NextResponse.json({ document: doc });
}
