import { NextResponse } from "next/server";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

export const runtime = "nodejs";

type FormType = "on-location" | "photography";

type PhotoInquiryKind =
  | "field-rental"
  | "sessions-with-me"
  | "wedding-engagement-on-location";

type InquiryPayload = {
  name?: string;
  email?: string;
  phone?: string;
  eventDate?: string;
  venue?: string;
  eventLocation?: string;
  guestCount?: number | string;
  budgetBand?: string;
  notes?: string;
  /** Alias some frontends send for the notes/message body */
  message?: string;
  services?: string[];
  formType?: FormType;
  photoInquiryKind?: PhotoInquiryKind;
};

function coerceGuestCount(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 1000000) return undefined;
  return n;
}

const onLocationServiceValues = [
  "wedding-event-florals",
  "popup-flower-bar",
  "restaurant-hotel",
  "commercial-account",
  "live-collage",
  "general-on-location",
  "florals",
];
const allowedServices = new Set([...onLocationServiceValues, "photography"]);
const onLocationServices = new Set(onLocationServiceValues);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const allowedPhotoKinds = new Set<string>([
  "field-rental",
  "sessions-with-me",
  "wedding-engagement-on-location",
]);

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
    const rawNotes = payload.message ?? payload.notes;
    const name = sanitizeString(payload.name);
    const email = sanitizeString(payload.email);
    const formType: FormType =
      payload.formType === "photography" ? "photography" : "on-location";

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

    if (formType === "on-location") {
      if (!services.length) {
        return NextResponse.json(
          { error: "Select at least one on-location inquiry type" },
          { status: 400 },
        );
      }
      const invalid = services.some((s) => !onLocationServices.has(s));
      if (invalid) {
        return NextResponse.json(
          { error: "On-location inquiries can only include on-location services" },
          { status: 400 },
        );
      }
    } else {
      if (services.length !== 1 || services[0] !== "photography") {
        return NextResponse.json(
          { error: "Photography inquiries must use the photography form" },
          { status: 400 },
        );
      }
      const kind = sanitizeString(payload.photoInquiryKind);
      if (!kind || !allowedPhotoKinds.has(kind)) {
        return NextResponse.json(
          { error: "Please select what kind of photography you are inquiring about" },
          { status: 400 },
        );
      }
    }

    const guestCount = coerceGuestCount(payload.guestCount);
    if (
      guestCount === undefined &&
      payload.guestCount !== undefined &&
      payload.guestCount !== null &&
      payload.guestCount !== ""
    ) {
      return NextResponse.json({ error: "Guest count must be a valid number" }, { status: 400 });
    }

    if (!hasSanityWriteClient()) {
      return NextResponse.json(
        { error: "Inquiry intake is temporarily unavailable. Please try again shortly." },
        { status: 500 },
      );
    }

    const photoInquiryKind =
      formType === "photography"
        ? (sanitizeString(payload.photoInquiryKind) as PhotoInquiryKind)
        : undefined;

    const venue = sanitizeString(payload.venue) ?? sanitizeString(payload.eventLocation);

    const doc = await sanityWriteClient.create({
      _type: "weddingInquiry",
      formType,
      name,
      email,
      phone: sanitizeString(payload.phone),
      eventDate: sanitizeString(payload.eventDate),
      venue,
      guestCount,
      budgetBand: sanitizeString(payload.budgetBand),
      notes: sanitizeString(typeof rawNotes === "string" ? rawNotes : undefined),
      services,
      ...(photoInquiryKind ? { photoInquiryKind } : {}),
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
