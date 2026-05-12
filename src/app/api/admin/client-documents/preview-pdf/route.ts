import { getOwnerSession } from "@/lib/adminAuth";
import {
  builderStateToViewProps,
  parseProposalBuilderFromRequest,
} from "@/lib/proposal/builderConverters";
import {
  clientDocumentPayloadToRecord,
  parseClientDocumentBody,
} from "@/lib/clientDocumentPayload";
import {
  renderClientDocumentPdfBuffer,
  renderProposalPdfBuffer,
} from "@/lib/pdf/renderClientDocumentPdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getOwnerSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const fromBuilder = parseProposalBuilderFromRequest(body);
    if (fromBuilder) {
      const { documentType, ...state } = fromBuilder;
      const view = builderStateToViewProps(state, documentType);
      const buffer = await renderProposalPdfBuffer(view);
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'inline; filename="ritualmaker-preview.pdf"',
          "Cache-Control": "private, no-store",
        },
      });
    }

    const payload = parseClientDocumentBody(body);
    if (!payload) {
      return new Response(JSON.stringify({ error: "Invalid body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const buffer = await renderClientDocumentPdfBuffer(
      clientDocumentPayloadToRecord(payload),
    );
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="ritualmaker-preview.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("[client-documents/preview-pdf]", e);
    return new Response(JSON.stringify({ error: "Could not render PDF" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
