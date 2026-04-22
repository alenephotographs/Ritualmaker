import { NextResponse } from "next/server";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

export const runtime = "nodejs";

type InquiryPayload = {
  name?: string;
  email?: string;
  phone?: string;
  eventDate?: string;
  venue?: string;
  guestCount?: number;
  budgetBand?: string;
  notes?: string;
  services?: string[];
};

const allowedServices = new Set(["florals", "live-collage", "photography"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(value?: string): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export async function POST(req: Request) {
  let payload: InquiryPayload;
  try {
    payload = (await req.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const name = sanitizeString(payload.name);
    const email = sanitizeString(payload.email);
    const services = (payload.services ?? [])
      .filter((service): service is string => Boolean(service))
      .filter((service) => allowedServices.has(service));

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields (name and email)" },
        { status: 400 },
      );
    }
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (!services.length) {
      return NextResponse.json(
        { error: "Select at least one service for the inquiry" },
        { status: 400 },
      );
    }
    if (
      typeof payload.guestCount === "number" &&
      (!Number.isInteger(payload.guestCount) ||
        payload.guestCount < 0 ||
        payload.guestCount > 1000000)
    ) {
      return NextResponse.json({ error: "Guest count must be a valid number" }, { status: 400 });
    }

    if (!hasSanityWriteClient()) {
      return NextResponse.json(
        { error: "Inquiry intake is temporarily unavailable. Please try again shortly." },
        { status: 500 },
      );
    }

    const doc = await sanityWriteClient.create({
      _type: "weddingInquiry",
      name,
      email,
      phone: sanitizeString(payload.phone),
      eventDate: sanitizeString(payload.eventDate),
      venue: sanitizeString(payload.venue),
      guestCount: payload.guestCount,
      budgetBand: sanitizeString(payload.budgetBand),
      notes: sanitizeString(payload.notes),
      services,
      status: "new",
    });

    return NextResponse.json({
      ok: true,
      id: doc._id,
      note: "Inquiry saved successfully.",
    });
  } catch (error) {
    console.error("[inquiries] failed", error);
    return NextResponse.json({ error: "Could not submit inquiry" }, { status: 500 });
  }
}
