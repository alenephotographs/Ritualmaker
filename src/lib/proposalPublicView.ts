import { deriveProposalLifecycle } from "@/lib/proposalLifecycleLogic";
import { buildPublicScopeSections } from "@/lib/proposalScopeSections";
import type { ClientDocumentRecord } from "@/lib/types/clientDocument";
import type { ProposalLifecycleStatus } from "@/lib/types/proposalLifecycle";

/** Safe payload for hosted proposal UI (no internal notes, no Stripe secrets). */
export type PublicProposalViewModel = {
  packageTitle: string;
  packageSubtitle?: string;
  clientName?: string;
  eventType?: string;
  eventDate?: string;
  location?: string;
  notes?: string;
  dayOf?: string;
  bridesmaidRibbonNames?: string;
  intakeNotes?: string;
  proposalTotalCents: number;
  depositAmountCents: number;
  balanceAmountCents: number;
  paymentDueDate?: string;
  lifecycle: ProposalLifecycleStatus;
  paymentDepositPaid: boolean;
  paymentBalancePaid: boolean;
  proposalApprovedAt?: string;
  proposalApprovedName?: string;
  proposalFirstViewedAt?: string;
  proposalLastViewedAt?: string;
  proposalViewCount: number;
  proposalLinkDisabled: boolean;
  depositPaidAt?: string;
  balancePaidAt?: string;
  scopeSections: ReturnType<typeof buildPublicScopeSections>;
};

export function toPublicProposalView(
  doc: ClientDocumentRecord,
): PublicProposalViewModel | null {
  const total = doc.proposalTotalCents ?? 0;
  const dep = doc.depositAmountCents ?? 0;
  const bal =
    doc.balanceAmountCents != null
      ? doc.balanceAmountCents
      : Math.max(0, total - dep);
  return {
    packageTitle: doc.packageTitle,
    packageSubtitle: doc.packageSubtitle,
    clientName: doc.clientName,
    eventType: doc.eventType,
    eventDate: doc.eventDate,
    location: doc.location,
    notes: doc.notes,
    dayOf: doc.dayOf,
    bridesmaidRibbonNames: doc.bridesmaidRibbonNames,
    intakeNotes: doc.intakeNotes,
    proposalTotalCents: total,
    depositAmountCents: dep,
    balanceAmountCents: bal,
    paymentDueDate: doc.paymentDueDate,
    lifecycle: deriveProposalLifecycle(doc),
    paymentDepositPaid: doc.paymentDepositPaid,
    paymentBalancePaid: doc.paymentBalancePaid,
    proposalApprovedAt: doc.proposalApprovedAt,
    proposalApprovedName: doc.proposalApprovedName,
    proposalFirstViewedAt: doc.proposalFirstViewedAt,
    proposalLastViewedAt: doc.proposalLastViewedAt,
    proposalViewCount: doc.proposalViewCount,
    proposalLinkDisabled: doc.proposalLinkDisabled,
    depositPaidAt: doc.depositPaidAt,
    balancePaidAt: doc.balancePaidAt,
    scopeSections: buildPublicScopeSections(
      doc.floralScopeText,
      doc.floralScope ?? [],
    ),
  };
}
