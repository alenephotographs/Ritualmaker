import type {
  ClientDocumentAdminPatch,
  ClientDocumentPayload,
  ClientDocumentRecord,
  ClientDocumentStatus,
  FloralScopeLine,
} from "@/lib/types/clientDocument";
import type { ProposalLifecycleStatus } from "@/lib/types/proposalLifecycle";

import { floralJsonToText } from "@/lib/clientDocumentMoney";

export function parseFloralScopeInput(raw: unknown): FloralScopeLine[] {
  if (!Array.isArray(raw)) return [];
  const out: FloralScopeLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const primary = typeof o.primary === "string" ? o.primary.trim() : "";
    if (!primary) continue;
    const detail =
      typeof o.detail === "string" && o.detail.trim()
        ? o.detail.trim()
        : undefined;
    out.push(detail ? { primary, detail } : { primary });
  }
  return out;
}

const STATUS_SET = new Set<string>([
  "lead",
  "proposal_sent",
  "booked",
  "complete",
  "declined",
]);

function parseStatus(raw: unknown): ClientDocumentStatus {
  if (typeof raw === "string" && STATUS_SET.has(raw)) {
    return raw as ClientDocumentStatus;
  }
  return "lead";
}

function parseRawInquiryBody(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const o = JSON.parse(raw) as unknown;
      if (o && typeof o === "object" && !Array.isArray(o)) {
        return o as Record<string, unknown>;
      }
    } catch {
      return { pasted: raw };
    }
  }
  return {};
}

export function parseClientDocumentBody(
  raw: unknown,
): ClientDocumentPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const clientName =
    typeof b.clientName === "string" && b.clientName.trim()
      ? b.clientName.trim()
      : "";
  const packageTitleRaw =
    typeof b.packageTitle === "string" ? b.packageTitle.trim() : "";
  const packageTitle =
    packageTitleRaw ||
    (clientName ? `${clientName} — Floral` : "Floral proposal");
  const docType = b.documentType === "invoice" ? "invoice" : "proposal";
  const totalLine = typeof b.totalLine === "string" ? b.totalLine.trim() : "";
  const floralScopeText =
    typeof b.floralScopeText === "string" && b.floralScopeText.trim()
      ? b.floralScopeText
      : undefined;

  return {
    clientName: clientName || undefined,
    clientEmail:
      typeof b.clientEmail === "string" && b.clientEmail.trim()
        ? b.clientEmail.trim()
        : undefined,
    clientPhone:
      typeof b.clientPhone === "string" && b.clientPhone.trim()
        ? b.clientPhone.trim()
        : undefined,
    eventType:
      typeof b.eventType === "string" && b.eventType.trim()
        ? b.eventType.trim()
        : undefined,
    eventDate:
      typeof b.eventDate === "string" && b.eventDate.trim()
        ? b.eventDate.trim()
        : undefined,
    location:
      typeof b.location === "string" && b.location.trim()
        ? b.location.trim()
        : undefined,
    status: parseStatus(b.status),
    paymentDepositPaid: Boolean(b.paymentDepositPaid),
    paymentBalancePaid: Boolean(b.paymentBalancePaid),
    proposalTotalCents:
      typeof b.proposalTotalCents === "number" &&
      Number.isFinite(b.proposalTotalCents)
        ? Math.round(b.proposalTotalCents)
        : null,
    depositAmountCents:
      typeof b.depositAmountCents === "number" &&
      Number.isFinite(b.depositAmountCents)
        ? Math.round(b.depositAmountCents)
        : null,
    paymentDueDate:
      typeof b.paymentDueDate === "string" && b.paymentDueDate.trim()
        ? b.paymentDueDate.trim()
        : undefined,
    internalNotes:
      typeof b.internalNotes === "string" && b.internalNotes.trim()
        ? b.internalNotes.trim()
        : undefined,
    rawInquiryJson: parseRawInquiryBody(b.rawInquiryJson),
    intakeNotes:
      typeof b.intakeNotes === "string" && b.intakeNotes.trim()
        ? b.intakeNotes.trim()
        : undefined,
    floralScopeText,
    packageTitle,
    packageSubtitle:
      typeof b.packageSubtitle === "string" && b.packageSubtitle.trim()
        ? b.packageSubtitle.trim()
        : undefined,
    floralScope: floralScopeText
      ? []
      : parseFloralScopeInput(b.floralScope),
    totalLine,
    bridesmaidRibbonNames:
      typeof b.bridesmaidRibbonNames === "string" && b.bridesmaidRibbonNames.trim()
        ? b.bridesmaidRibbonNames.trim()
        : undefined,
    notes:
      typeof b.notes === "string" && b.notes.trim() ? b.notes.trim() : undefined,
    dayOf:
      typeof b.dayOf === "string" && b.dayOf.trim() ? b.dayOf.trim() : undefined,
    depositLine:
      typeof b.depositLine === "string" && b.depositLine.trim()
        ? b.depositLine.trim()
        : undefined,
    depositLink:
      typeof b.depositLink === "string" && b.depositLink.trim()
        ? b.depositLink.trim()
        : undefined,
    balanceLine:
      typeof b.balanceLine === "string" && b.balanceLine.trim()
        ? b.balanceLine.trim()
        : undefined,
    balanceLink:
      typeof b.balanceLink === "string" && b.balanceLink.trim()
        ? b.balanceLink.trim()
        : undefined,
    stripePaymentLinkDepositId:
      typeof b.stripePaymentLinkDepositId === "string" &&
      b.stripePaymentLinkDepositId.trim()
        ? b.stripePaymentLinkDepositId.trim()
        : undefined,
    stripePaymentLinkBalanceId:
      typeof b.stripePaymentLinkBalanceId === "string" &&
      b.stripePaymentLinkBalanceId.trim()
        ? b.stripePaymentLinkBalanceId.trim()
        : undefined,
    documentType: docType,
  };
}

function optionalTrimString(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t || undefined;
}

function optionalCents(raw: unknown): number | null | undefined {
  if (raw === null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.round(raw);
  return undefined;
}

/** Partial update body for autosave (only include keys you intend to change). */
export function parseClientDocumentPatchBody(
  raw: unknown,
): ClientDocumentAdminPatch | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const out: ClientDocumentAdminPatch = {};
  if ("clientName" in b) out.clientName = optionalTrimString(b.clientName);
  if ("clientEmail" in b) out.clientEmail = optionalTrimString(b.clientEmail);
  if ("clientPhone" in b) out.clientPhone = optionalTrimString(b.clientPhone);
  if ("eventType" in b) out.eventType = optionalTrimString(b.eventType);
  if ("eventDate" in b) out.eventDate = optionalTrimString(b.eventDate);
  if ("location" in b) out.location = optionalTrimString(b.location);
  if ("status" in b) out.status = parseStatus(b.status);
  if ("paymentDepositPaid" in b)
    out.paymentDepositPaid = Boolean(b.paymentDepositPaid);
  if ("paymentBalancePaid" in b)
    out.paymentBalancePaid = Boolean(b.paymentBalancePaid);
  if ("proposalTotalCents" in b) {
    const c = optionalCents(b.proposalTotalCents);
    if (c !== undefined) out.proposalTotalCents = c;
  }
  if ("depositAmountCents" in b) {
    const c = optionalCents(b.depositAmountCents);
    if (c !== undefined) out.depositAmountCents = c;
  }
  if ("paymentDueDate" in b)
    out.paymentDueDate = optionalTrimString(b.paymentDueDate);
  if ("internalNotes" in b)
    out.internalNotes = optionalTrimString(b.internalNotes);
  if ("rawInquiryJson" in b && b.rawInquiryJson && typeof b.rawInquiryJson === "object" && !Array.isArray(b.rawInquiryJson)) {
    out.rawInquiryJson = b.rawInquiryJson as Record<string, unknown>;
  }
  if ("intakeNotes" in b) out.intakeNotes = optionalTrimString(b.intakeNotes);
  if ("floralScopeText" in b)
    out.floralScopeText = optionalTrimString(b.floralScopeText);
  if ("packageTitle" in b) {
    const t = optionalTrimString(b.packageTitle);
    if (t) out.packageTitle = t;
  }
  if ("packageSubtitle" in b)
    out.packageSubtitle = optionalTrimString(b.packageSubtitle);
  if ("floralScope" in b) out.floralScope = parseFloralScopeInput(b.floralScope);
  if ("totalLine" in b)
    out.totalLine =
      typeof b.totalLine === "string" ? b.totalLine.trim() : "";
  if ("bridesmaidRibbonNames" in b)
    out.bridesmaidRibbonNames = optionalTrimString(b.bridesmaidRibbonNames);
  if ("notes" in b) out.notes = optionalTrimString(b.notes);
  if ("dayOf" in b) out.dayOf = optionalTrimString(b.dayOf);
  if ("depositLine" in b) out.depositLine = optionalTrimString(b.depositLine);
  if ("depositLink" in b) out.depositLink = optionalTrimString(b.depositLink);
  if ("balanceLine" in b) out.balanceLine = optionalTrimString(b.balanceLine);
  if ("balanceLink" in b) out.balanceLink = optionalTrimString(b.balanceLink);
  if ("documentType" in b)
    out.documentType = b.documentType === "invoice" ? "invoice" : "proposal";
  return out;
}

export function recordToWritablePayload(
  r: ClientDocumentRecord,
): ClientDocumentPayload {
  return {
    packageTitle: r.packageTitle,
    packageSubtitle: r.packageSubtitle,
    clientName: r.clientName,
    clientEmail: r.clientEmail,
    clientPhone: r.clientPhone,
    eventType: r.eventType,
    eventDate: r.eventDate,
    location: r.location,
    status: r.status,
    paymentDepositPaid: r.paymentDepositPaid,
    paymentBalancePaid: r.paymentBalancePaid,
    proposalTotalCents: r.proposalTotalCents,
    depositAmountCents: r.depositAmountCents,
    paymentDueDate: r.paymentDueDate,
    internalNotes: r.internalNotes,
    rawInquiryJson: r.rawInquiryJson,
    intakeNotes: r.intakeNotes,
    floralScopeText: r.floralScopeText,
    floralScope: r.floralScope,
    totalLine: r.totalLine,
    bridesmaidRibbonNames: r.bridesmaidRibbonNames,
    notes: r.notes,
    dayOf: r.dayOf,
    depositLine: r.depositLine,
    depositLink: r.depositLink,
    balanceLine: r.balanceLine,
    balanceLink: r.balanceLink,
    stripePaymentLinkDepositId: r.stripePaymentLinkDepositId,
    stripePaymentLinkBalanceId: r.stripePaymentLinkBalanceId,
    documentType: r.documentType,
  };
}

export function applyClientDocumentPatch(
  existing: ClientDocumentRecord,
  patch: ClientDocumentAdminPatch,
): ClientDocumentPayload {
  const base = recordToWritablePayload(existing);
  const merged: ClientDocumentPayload = { ...base };
  (Object.keys(patch) as (keyof ClientDocumentAdminPatch)[]).forEach((k) => {
    const v = patch[k];
    if (v === undefined) return;
    if (k === "rawInquiryJson" && v && typeof v === "object") {
      merged.rawInquiryJson = {
        ...existing.rawInquiryJson,
        ...(v as Record<string, unknown>),
      };
      return;
    }
    (merged as Record<string, unknown>)[k] = v as unknown;
  });
  return merged;
}

const SAMPLE_FLORAL_LINES: FloralScopeLine[] = [
  {
    primary: "Base Flower Fee — $325",
    detail: "Harvesting, prep, transport, installation",
  },
  { primary: "Bridal Bouquet (24 stems) — $235" },
  {
    primary: "Bridesmaids Bouquets (5) — $575",
    detail: "Ribbon labels included",
  },
  {
    primary: "Boutonnières (5) — $100",
    detail: "Groom + 4 groomsmen",
  },
  { primary: "Arbor Floral Installation — $750" },
  {
    primary: "Bud Vases (10 tables) — $400",
    detail: "Approx. 150 stems total",
  },
];

/** Exact sample used for QA — only admin-entered fields, no inquiry metadata. */
export const SAMPLE_EMILY_LIZAH_PAYLOAD: ClientDocumentPayload = {
  documentType: "proposal",
  clientName: "Emily & Lizah",
  status: "proposal_sent",
  packageTitle: "Wildflower Floral Package",
  packageSubtitle:
    "Wildflower-inspired, colorful, organic, abundant\nIncludes blue hydrangea + yellow/orange marigolds",
  floralScopeText: floralJsonToText(SAMPLE_FLORAL_LINES),
  floralScope: [],
  totalLine: "Total — $2,385",
  proposalTotalCents: 238500,
  depositAmountCents: 0,
  bridesmaidRibbonNames: "Courtney (MOH), Brynn, Becky, Rachel, Mehruz",
  notes:
    "Bud vases arranged on-site by bride\n\nEmily providing all vases (bud + sweetheart table)\n\nArrival time needed for arbor installation",
  dayOf:
    "Flowers delivered organized by use\n\nBouquets + boutonnières ready to wear\n\nArbor installed on-site\n\nBud vase stems delivered in water",
  depositLine: "Deposit — Pay Deposit",
  depositLink: "https://buy.stripe.com/dRmbJ3774fkg75O9ig2sM00",
  balanceLine: "Remaining Balance — Pay Balance",
  balanceLink: "https://buy.stripe.com/00w5kF2QOdc8duc7a82sM01",
};

export function clientDocumentPayloadToRecord(
  p: ClientDocumentPayload,
): ClientDocumentRecord {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    clientName: p.clientName,
    clientEmail: p.clientEmail,
    clientPhone: p.clientPhone,
    eventType: p.eventType,
    eventDate: p.eventDate,
    location: p.location,
    status: p.status ?? "lead",
    paymentDepositPaid: p.paymentDepositPaid ?? false,
    paymentBalancePaid: p.paymentBalancePaid ?? false,
    proposalTotalCents: p.proposalTotalCents,
    depositAmountCents: p.depositAmountCents,
    balanceAmountCents:
      p.proposalTotalCents != null && p.depositAmountCents != null
        ? Math.max(0, p.proposalTotalCents - p.depositAmountCents)
        : undefined,
    paymentDueDate: p.paymentDueDate,
    internalNotes: p.internalNotes,
    rawInquiryJson: p.rawInquiryJson ?? {},
    intakeNotes: p.intakeNotes,
    floralScopeText: p.floralScopeText,
    packageTitle: p.packageTitle,
    packageSubtitle: p.packageSubtitle,
    floralScope: p.floralScope,
    totalLine: p.totalLine,
    bridesmaidRibbonNames: p.bridesmaidRibbonNames,
    notes: p.notes,
    dayOf: p.dayOf,
    depositLine: p.depositLine,
    depositLink: p.depositLink,
    balanceLine: p.balanceLine,
    balanceLink: p.balanceLink,
    stripePaymentLinkDepositId: p.stripePaymentLinkDepositId,
    stripePaymentLinkBalanceId: p.stripePaymentLinkBalanceId,
    paymentLinksStale: false,
    proposalLinkDisabled: false,
    proposalLifecycleStatus: "draft" as ProposalLifecycleStatus,
    proposalViewCount: 0,
    documentType: p.documentType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
