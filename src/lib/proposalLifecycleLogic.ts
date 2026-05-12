import type { ClientDocumentRecord } from "@/lib/types/clientDocument";
import type { ProposalLifecycleStatus } from "@/lib/types/proposalLifecycle";

const MIN_REMAINING_CENTS = 50;

/** Derive canonical lifecycle from payments, views, token, and flags. */
export function deriveProposalLifecycle(
  doc: ClientDocumentRecord,
): ProposalLifecycleStatus {
  if (doc.proposalLinkDisabled) return "cancelled";
  if (doc.status === "declined") return "cancelled";

  const t = doc.proposalTotalCents ?? 0;
  const d = doc.depositAmountCents ?? 0;
  const bal = Math.max(0, t - d);
  const depositPaid = doc.paymentDepositPaid;
  const balancePaid = doc.paymentBalancePaid;
  const financiallySettled =
    depositPaid && (balancePaid || bal < MIN_REMAINING_CENTS);

  if (financiallySettled) {
    if (doc.status === "complete") return "completed";
    return "paid_in_full";
  }

  if (!depositPaid && balancePaid) {
    return "partially_paid";
  }

  if (depositPaid && !balancePaid && bal >= MIN_REMAINING_CENTS) {
    return "deposit_paid";
  }

  if (doc.proposalApprovedAt) {
    if (
      !depositPaid &&
      !balancePaid &&
      (t >= MIN_REMAINING_CENTS || d >= MIN_REMAINING_CENTS)
    ) {
      return "balance_due";
    }
    return "approved";
  }

  if ((doc.proposalViewCount ?? 0) > 0) return "viewed";
  if (doc.proposalPublicToken) return "sent";
  return "draft";
}
