import { getOwnerSession } from "@/lib/adminAuth";
import {
  getClientDocumentById,
  markClientDocumentPdfGenerated,
} from "@/lib/db";
import { renderClientDocumentPdfBuffer } from "@/lib/pdf/renderClientDocumentPdf";
import { hasSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

function pdfFilename(clientName: string | undefined, kind: string) {
  const slug =
    (clientName || "client")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "client";
  return `ritualmaker-${kind}-${slug}.pdf`;
}

type RouteParams = { params: { id: string } };

export async function GET(_req: Request, ctx: RouteParams) {
  const session = await getOwnerSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!hasSupabaseService()) {
    return new Response(JSON.stringify({ error: "Database unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const { id } = ctx.params;
  const doc = await getClientDocumentById(id);
  if (!doc) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const buffer = await renderClientDocumentPdfBuffer(doc);
    const kind = doc.documentType === "invoice" ? "invoice" : "proposal";
    const name = pdfFilename(doc.clientName, kind);
    await markClientDocumentPdfGenerated(id);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("[client-documents/pdf]", e);
    return new Response(JSON.stringify({ error: "Could not render PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
