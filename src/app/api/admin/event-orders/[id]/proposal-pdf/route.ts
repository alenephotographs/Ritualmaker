import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireAdminAccess } from "@/lib/adminAccess";
import { getEventOrderById, sanitizeFileNamePart } from "@/lib/eventOrders";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

export const runtime = "nodejs";

function formatCurrency(cents?: number) {
  if (typeof cents !== "number") return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatDate(date?: string) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString();
}

function lineWrap(text: string, maxLen: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLen && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["—"];
}

function drawWrappedText(
  page: (typeof PDFDocument.prototype)["getPages"] extends () => (infer P)[] ? P : never,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  font: Awaited<ReturnType<typeof PDFDocument.create>> extends { embedFont: infer EF }
    ? EF extends (...args: never[]) => Promise<infer F>
      ? F
      : never
    : never,
) {
  const words = text.split(/\s+/).filter(Boolean);
  let current = "";
  let nextY = y;
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, fontSize) > maxWidth && current) {
      page.drawText(current, { x, y: nextY, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
      nextY -= 14;
      current = word;
    } else {
      current = next;
    }
  }
  if (current) {
    page.drawText(current, { x, y: nextY, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
    nextY -= 14;
  }
  return nextY;
}

export async function POST(_req: Request, context: { params: { id: string } }) {
  const access = await requireAdminAccess();
  if ("error" in access) return access.error;
  if (!access.isOwner) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  if (!hasSanityWriteClient()) {
    return NextResponse.json({ error: "Admin updates are temporarily unavailable" }, { status: 500 });
  }

  const id = context.params.id;
  const order = await getEventOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Event order not found" }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let y = 760;

  page.drawText("Ritualmaker Proposal", {
    x: 48,
    y,
    size: 24,
    font: bold,
    color: rgb(0.09, 0.13, 0.15),
  });
  y -= 32;

  const rows: Array<[string, string]> = [
    ["Client", order.name || "—"],
    ["Email", order.email || "—"],
    ["Event type", order.eventType || "Event"],
    ["Event date", formatDate(order.eventDate)],
    ["Location", order.eventLocation || "—"],
    ["Proposal total", formatCurrency(order.proposalTotalCents)],
    ["Deposit amount", formatCurrency(order.depositAmountCents)],
    ["Balance amount", formatCurrency(order.balanceAmountCents)],
    ["Balance due date", formatDate(order.balanceDueDate)],
    ["Deposit link", order.depositPaymentLinkUrl || "—"],
    ["Balance link", order.balancePaymentLinkUrl || "—"],
  ];

  for (const [label, value] of rows) {
    page.drawText(`${label}:`, { x: 48, y, size: 11, font: bold, color: rgb(0.2, 0.2, 0.2) });
    y = drawWrappedText(page, value, 178, y, 386, 11, regular) - 4;
  }

  y -= 4;
  page.drawText("Proposal notes / scope", {
    x: 48,
    y,
    size: 11,
    font: bold,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 16;

  for (const line of lineWrap(order.proposalScope || order.notes || "", 86)) {
    page.drawText(line, { x: 48, y, size: 11, font: regular, color: rgb(0.1, 0.1, 0.1) });
    y -= 14;
    if (y < 60) break;
  }

  const pdfBytes = await pdf.save();
  const fileName = `ritualmaker-proposal-${sanitizeFileNamePart(order.name || order._id)}.pdf`;
  const now = new Date().toISOString();

  await sanityWriteClient
    .patch(order._id)
    .set({
      proposalPdfGeneratedAt: now,
      proposalPdfFileName: fileName,
    })
    .commit();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
