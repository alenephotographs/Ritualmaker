import type { ClientDocumentStatus, ClientDocumentType } from "@/lib/types/clientDocument";

/** Live builder form — mirrors left panel. */
export type ProposalBuilderState = {
  status: ClientDocumentStatus;
  paymentDepositPaid: boolean;
  paymentBalancePaid: boolean;
  stripePaymentLinkDepositId: string;
  stripePaymentLinkBalanceId: string;
  /** Read-only for UI (ISO); not sent on save. */
  depositPaidAt: string;
  balancePaidAt: string;
  packageTitle: string;
  packageSubtitle: string;
  scopeText: string;
  bridesmaidNames: string;
  notes: string;
  dayOf: string;
  total: number;
  deposit: number;
  dueDate: string;
  depositLink: string;
  balanceLink: string;
};

/** Props for the single @react-pdf document (preview + export). */
export type ProposalPdfViewProps = {
  documentKind: ClientDocumentType;
  clientName?: string;
  eventDate?: string;
  eventType?: string;
  location?: string;
  packageTitle: string;
  packageSubtitle: string;
  scopeText: string;
  bridesmaidNames: string;
  notes: string;
  dayOf: string;
  totalLine: string;
  depositLine?: string;
  balanceLine?: string;
  depositLink: string;
  balanceLink: string;
  paymentDueDate?: string;
  /** Large-type amounts (cents) for client proposal PDF. */
  totalCents?: number;
  depositCents?: number;
  balanceCents?: number;
  footerLines?: string[];
  nextStepsLines?: string[];
};

export function emptyProposalBuilderState(): ProposalBuilderState {
  return {
    status: "lead",
    paymentDepositPaid: false,
    paymentBalancePaid: false,
    stripePaymentLinkDepositId: "",
    stripePaymentLinkBalanceId: "",
    depositPaidAt: "",
    balancePaidAt: "",
    packageTitle: "",
    packageSubtitle: "",
    scopeText: "",
    bridesmaidNames: "",
    notes: "",
    dayOf: "",
    total: 0,
    deposit: 0,
    dueDate: "",
    depositLink: "",
    balanceLink: "",
  };
}
