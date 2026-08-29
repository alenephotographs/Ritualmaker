import type { ProposalLifecycleStatus } from "@/lib/types/proposalLifecycle";

export type ClientDocumentType = "proposal" | "invoice";

export type ClientDocumentStatus =
  | "lead"
  | "proposal_sent"
  | "booked"
  | "complete"
  | "declined";

export type FloralScopeLine = {
  primary: string;
  detail?: string;
};

/** Fields the owner edits in admin before generating a PDF. */
export type ClientDocumentPayload = {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  eventType?: string;
  eventDate?: string;
  location?: string;
  status?: ClientDocumentStatus;
  paymentDepositPaid?: boolean;
  paymentBalancePaid?: boolean;
  proposalTotalCents?: number | null;
  depositAmountCents?: number | null;
  paymentDueDate?: string;
  internalNotes?: string;
  rawInquiryJson?: Record<string, unknown>;
  intakeNotes?: string;
  floralScopeText?: string;
  packageTitle: string;
  packageSubtitle?: string;
  floralScope: FloralScopeLine[];
  totalLine: string;
  bridesmaidRibbonNames?: string;
  notes?: string;
  dayOf?: string;
  depositLine?: string;
  depositLink?: string;
  balanceLine?: string;
  balanceLink?: string;
  /** Stripe `plink_…` when links were created from admin (enables webhooks + sync). */
  stripePaymentLinkDepositId?: string;
  stripePaymentLinkBalanceId?: string;
  documentType: ClientDocumentType;
};

/** Partial admin edit (autosave). Omits server-only Stripe fields. */
export type ClientDocumentAdminPatch = Partial<
  Omit<
    ClientDocumentPayload,
    | "stripePaymentLinkDepositId"
    | "stripePaymentLinkBalanceId"
  >
>;

export type ClientDocumentRecord = {
  id: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  eventType?: string;
  eventDate?: string;
  location?: string;
  status: ClientDocumentStatus;
  paymentDepositPaid: boolean;
  paymentBalancePaid: boolean;
  proposalTotalCents?: number | null;
  depositAmountCents?: number | null;
  /** Persisted remainder (proposal total − deposit). */
  balanceAmountCents?: number | null;
  paymentDueDate?: string;
  internalNotes?: string;
  rawInquiryJson: Record<string, unknown>;
  intakeNotes?: string;
  floralScopeText?: string;
  packageTitle: string;
  packageSubtitle?: string;
  floralScope: FloralScopeLine[];
  totalLine: string;
  bridesmaidRibbonNames?: string;
  notes?: string;
  dayOf?: string;
  depositLine?: string;
  depositLink?: string;
  balanceLine?: string;
  balanceLink?: string;
  stripePaymentLinkDepositId?: string;
  stripePaymentLinkBalanceId?: string;
  lastPaymentSnapshotTotal?: number | null;
  lastPaymentSnapshotDeposit?: number | null;
  lastPaymentSnapshotBalance?: number | null;
  lastPaymentSnapshotBalanceDueDate?: string | null;
  stripeInvoiceId?: string;
  stripeInvoiceUrl?: string;
  stripeInvoicePdfUrl?: string;
  stripeInvoiceStatus?: string;
  stripeInvoiceAmountCents?: number | null;
  /** Stored; also derivable from snapshots — updated on every save. */
  paymentLinksStale: boolean;
  proposalPdfGeneratedAt?: string;
  /** Unguessable token for /proposal/[token]; admin-rotated. */
  proposalPublicToken?: string;
  proposalPublicTokenExpiresAt?: string;
  proposalLinkDisabled: boolean;
  proposalLifecycleStatus: ProposalLifecycleStatus;
  proposalFirstViewedAt?: string;
  proposalLastViewedAt?: string;
  proposalViewCount: number;
  proposalApprovedAt?: string;
  proposalApprovedName?: string;
  proposalApprovedIp?: string;
  depositPaidAt?: string;
  balancePaidAt?: string;
  documentType: ClientDocumentType;
  createdAt: string;
  updatedAt: string;
};
