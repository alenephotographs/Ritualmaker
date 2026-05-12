import { getClientDocumentByPublicToken } from "@/lib/db";
import { renderClientDocumentPdfBuffer } from "@/lib/pdf/renderClientDocumentPdf";

export const runtime = "nodejs";

type RouteParams = { params: { token: string } };

function pdfFilename(clientName: string | undefined) {
  const slug =
    (clientName || "proposal")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "proposal";
  return `ritualmaker-proposal-${slug}.pdf`;
}

export async function GET(_req: Request, ctx: RouteParams) {
  const token = ctx.params.token?.trim();
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const doc = await getClientDocumentByPublicToken(token);
  if (!doc) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const buffer = await renderClientDocumentPdfBuffer(doc);
    const name = pdfFilename(doc.clientName);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (e) {
    console.error("[proposal/pdf]", e);
    return new Response(JSON.stringify({ error: "Could not render PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
