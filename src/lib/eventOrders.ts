import { sanityWriteClient } from "@/sanity/writeClient";

export type EventOrder = {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  name?: string;
  email?: string;
  phone?: string;
  formType?: string;
  services?: string[];
  photoInquiryKind?: string;
  eventType?: string;
  eventDate?: string;
  venue?: string;
  eventLocation?: string;
  guestCount?: number;
  budgetBand?: string;
  notes?: string;
  proposalScope?: string;
  proposalTotalCents?: number;
  depositAmountCents?: number;
  balanceAmountCents?: number;
  balanceDueDate?: string;
  proposalPdfGeneratedAt?: string;
  proposalPdfFileName?: string;
  depositPaymentLinkId?: string;
  depositPaymentLinkUrl?: string;
  balancePaymentLinkId?: string;
  balancePaymentLinkUrl?: string;
  stripeInvoiceId?: string;
  stripeInvoiceUrl?: string;
  stripeInvoicePdfUrl?: string;
  stripeInvoiceStatus?: string;
  stripeInvoiceCreatedAt?: string;
  depositPaid?: boolean;
  balancePaid?: boolean;
  paidInFull?: boolean;
  paymentStatusUpdatedAt?: string;
  internalNotes?: string;
  status?: string;
};

export const eventOrderProjection = `{
  _id,
  _createdAt,
  _updatedAt,
  name,
  email,
  phone,
  formType,
  services,
  photoInquiryKind,
  eventType,
  eventDate,
  venue,
  "eventLocation": coalesce(eventLocation, venue),
  guestCount,
  budgetBand,
  notes,
  proposalScope,
  proposalTotalCents,
  depositAmountCents,
  balanceAmountCents,
  balanceDueDate,
  proposalPdfGeneratedAt,
  proposalPdfFileName,
  depositPaymentLinkId,
  depositPaymentLinkUrl,
  balancePaymentLinkId,
  balancePaymentLinkUrl,
  stripeInvoiceId,
  stripeInvoiceUrl,
  stripeInvoicePdfUrl,
  stripeInvoiceStatus,
  stripeInvoiceCreatedAt,
  depositPaid,
  balancePaid,
  paidInFull,
  paymentStatusUpdatedAt,
  internalNotes,
  status
}`;

export function inferEventType(order: Pick<EventOrder, "services" | "formType" | "photoInquiryKind">) {
  const services = order.services ?? [];
  if (services.includes("commercial-account")) return "Corporate";
  if (services.includes("wedding-event-florals") || services.includes("florals")) return "Wedding";
  if (services.includes("photography") || order.formType === "photography") return "Event";
  if (services.includes("restaurant-hotel")) return "Corporate";
  return "Event";
}

export function sanitizeFileNamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function toCents(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return undefined;
  return Math.round(numeric);
}

export async function getEventOrderById(id: string) {
  return sanityWriteClient.fetch<EventOrder | null>(
    `*[_type == "weddingInquiry" && _id == $id][0]${eventOrderProjection}`,
    { id },
  );
}

export function computePaidInFull(input: {
  depositPaid?: boolean;
  balancePaid?: boolean;
  stripeInvoiceStatus?: string;
}) {
  const invoicePaid =
    input.stripeInvoiceStatus === "paid" ||
    input.stripeInvoiceStatus === "void" ||
    input.stripeInvoiceStatus === "uncollectible";
  return Boolean(input.depositPaid && input.balancePaid) || invoicePaid;
}
