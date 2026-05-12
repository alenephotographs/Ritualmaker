import {
  floralJsonToText,
  formatUsdFromCents,
} from "@/lib/clientDocumentMoney";
import type {
  ClientDocumentPayload,
  ClientDocumentRecord,
  ClientDocumentStatus,
  ClientDocumentType,
} from "@/lib/types/clientDocument";
import type {
  ProposalBuilderState,
  ProposalPdfViewProps,
} from "@/lib/types/proposalBuilder";

export function builderBalanceDollars(s: ProposalBuilderState): number {
  return Math.max(0, (s.total || 0) - (s.deposit || 0));
}

function defaultNextSteps(due?: string): string[] {
  const lines = [
    "Pay the deposit through your secure Ritualmaker payment link to confirm your date.",
    "We finalize stem counts and palette details after the deposit is received.",
  ];
  if (due?.trim()) {
    lines.push(`Remaining balance is due by ${due.trim()} unless otherwise agreed.`);
  }
  return lines;
}

export function builderStateToViewProps(
  s: ProposalBuilderState,
  documentKind: ClientDocumentType,
): ProposalPdfViewProps {
  const totalC = Math.round((s.total || 0) * 100);
  const depC = Math.round((s.deposit || 0) * 100);
  const balC = Math.max(0, totalC - depC);
  const totalLine =
    totalC > 0 ? `Total — ${formatUsdFromCents(totalC)}` : "";
  const depositLine =
    depC > 0 ? `Deposit — ${formatUsdFromCents(depC)}` : undefined;
  const balanceLine =
    balC > 0 ? `Remaining balance — ${formatUsdFromCents(balC)}` : undefined;
  const due = s.dueDate.trim() || undefined;
  const baseUrl =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")) ||
    "ritualmakerflowers.com";
  return {
    documentKind,
    packageTitle: s.packageTitle,
    packageSubtitle: s.packageSubtitle,
    scopeText: s.scopeText,
    bridesmaidNames: s.bridesmaidNames,
    notes: s.notes,
    dayOf: s.dayOf,
    totalLine,
    depositLine,
    balanceLine,
    depositLink: s.depositLink,
    balanceLink: s.balanceLink,
    paymentDueDate: due,
    totalCents: totalC,
    depositCents: depC,
    balanceCents: balC,
    footerLines: ["Ritualmaker Flowers", baseUrl.replace(/^https?:\/\//, "")],
    nextStepsLines: defaultNextSteps(due),
  };
}

export function recordToBuilderState(r: ClientDocumentRecord): ProposalBuilderState {
  const scope =
    r.floralScopeText?.trim() ||
    (r.floralScope?.length ? floralJsonToText(r.floralScope) : "");
  return {
    status: r.status,
    paymentDepositPaid: r.paymentDepositPaid,
    paymentBalancePaid: r.paymentBalancePaid,
    stripePaymentLinkDepositId: r.stripePaymentLinkDepositId ?? "",
    stripePaymentLinkBalanceId: r.stripePaymentLinkBalanceId ?? "",
    depositPaidAt: r.depositPaidAt ?? "",
    balancePaidAt: r.balancePaidAt ?? "",
    packageTitle: r.packageTitle,
    packageSubtitle: r.packageSubtitle ?? "",
    scopeText: scope,
    bridesmaidNames: r.bridesmaidRibbonNames ?? "",
    notes: r.notes ?? "",
    dayOf: r.dayOf ?? "",
    total: (r.proposalTotalCents ?? 0) / 100,
    deposit: (r.depositAmountCents ?? 0) / 100,
    dueDate: r.paymentDueDate ?? "",
    depositLink: r.depositLink ?? "",
    balanceLink: r.balanceLink ?? "",
  };
}

export function recordToViewProps(r: ClientDocumentRecord): ProposalPdfViewProps {
  const s = recordToBuilderState(r);
  const auto = builderStateToViewProps(s, "proposal");
  const totalC = r.proposalTotalCents ?? 0;
  const depC = r.depositAmountCents ?? 0;
  const balC =
    r.balanceAmountCents != null
      ? r.balanceAmountCents
      : Math.max(0, totalC - depC);
  const baseUrl =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")) ||
    "ritualmakerflowers.com";
  return {
    ...auto,
    documentKind: "proposal",
    clientName: r.clientName,
    eventDate: r.eventDate,
    eventType: r.eventType,
    location: r.location,
    totalLine: r.totalLine?.trim() || auto.totalLine,
    depositLine: r.depositLine?.trim() || auto.depositLine,
    balanceLine: r.balanceLine?.trim() || auto.balanceLine,
    paymentDueDate: r.paymentDueDate ?? auto.paymentDueDate,
    totalCents: totalC,
    depositCents: depC,
    balanceCents: balC,
    footerLines: ["Ritualmaker Flowers", baseUrl.replace(/^https?:\/\//, "")],
    nextStepsLines: defaultNextSteps(r.paymentDueDate),
  };
}

export function builderStateToPayload(
  s: ProposalBuilderState,
  documentType: ClientDocumentType = "proposal",
): ClientDocumentPayload {
  const totalC = Math.round((s.total || 0) * 100);
  const depC = Math.round((s.deposit || 0) * 100);
  const totalLine =
    totalC > 0 ? `Total — ${formatUsdFromCents(totalC)}` : "";
  return {
    packageTitle: s.packageTitle.trim() || "Floral proposal",
    packageSubtitle: s.packageSubtitle.trim() || undefined,
    floralScopeText: s.scopeText.trim() || undefined,
    bridesmaidRibbonNames: s.bridesmaidNames.trim() || undefined,
    notes: s.notes.trim() || undefined,
    dayOf: s.dayOf.trim() || undefined,
    proposalTotalCents: totalC || null,
    depositAmountCents: depC || null,
    paymentDueDate: s.dueDate.trim() || undefined,
    depositLink: s.depositLink.trim() || undefined,
    balanceLink: s.balanceLink.trim() || undefined,
    status: s.status,
    paymentDepositPaid: s.paymentDepositPaid,
    paymentBalancePaid: s.paymentBalancePaid,
    stripePaymentLinkDepositId: s.stripePaymentLinkDepositId.trim() || undefined,
    stripePaymentLinkBalanceId: s.stripePaymentLinkBalanceId.trim() || undefined,
    floralScope: [],
    totalLine,
    documentType,
    rawInquiryJson: {},
  };
}

export function isProposalBuilderPayload(
  raw: unknown,
): raw is ProposalBuilderState & { documentType?: ClientDocumentType } {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  return typeof o.scopeText === "string" && typeof o.packageTitle === "string";
}

function numFromUnknown(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v.replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function parseProposalStatus(raw: unknown): ClientDocumentStatus {
  const s = typeof raw === "string" ? raw : "";
  if (
    s === "lead" ||
    s === "proposal_sent" ||
    s === "booked" ||
    s === "complete" ||
    s === "declined"
  ) {
    return s;
  }
  return "lead";
}

export function parseProposalBuilderFromRequest(
  raw: unknown,
): (ProposalBuilderState & { documentType: ClientDocumentType }) | null {
  if (!isProposalBuilderPayload(raw)) return null;
  const o = raw as Record<string, unknown>;
  return {
    status: parseProposalStatus(o.status),
    paymentDepositPaid: Boolean(o.paymentDepositPaid),
    paymentBalancePaid: Boolean(o.paymentBalancePaid),
    stripePaymentLinkDepositId: String(o.stripePaymentLinkDepositId ?? ""),
    stripePaymentLinkBalanceId: String(o.stripePaymentLinkBalanceId ?? ""),
    depositPaidAt: String(o.depositPaidAt ?? ""),
    balancePaidAt: String(o.balancePaidAt ?? ""),
    packageTitle: String(o.packageTitle ?? ""),
    packageSubtitle: String(o.packageSubtitle ?? ""),
    scopeText: String(o.scopeText ?? ""),
    bridesmaidNames: String(o.bridesmaidNames ?? ""),
    notes: String(o.notes ?? ""),
    dayOf: String(o.dayOf ?? ""),
    total: numFromUnknown(o.total),
    deposit: numFromUnknown(o.deposit),
    dueDate: String(o.dueDate ?? ""),
    depositLink: String(o.depositLink ?? ""),
    balanceLink: String(o.balanceLink ?? ""),
    documentType: o.documentType === "invoice" ? "invoice" : "proposal",
  };
}
