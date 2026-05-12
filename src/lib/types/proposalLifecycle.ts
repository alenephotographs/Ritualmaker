/** Client-facing + admin-display proposal funnel (hosted /proposal/[token]). */
export type ProposalLifecycleStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "approved"
  | "balance_due"
  | "deposit_paid"
  | "partially_paid"
  | "paid_in_full"
  | "completed"
  | "cancelled";

export const PROPOSAL_LIFECYCLE_ORDER: ProposalLifecycleStatus[] = [
  "draft",
  "sent",
  "viewed",
  "approved",
  "balance_due",
  "deposit_paid",
  "partially_paid",
  "paid_in_full",
  "completed",
  "cancelled",
];

export const PROPOSAL_LIFECYCLE_SET = new Set<string>(PROPOSAL_LIFECYCLE_ORDER);

export function parseProposalLifecycleStatus(
  raw: string | null | undefined,
): ProposalLifecycleStatus {
  if (raw === "archived") return "cancelled";
  if (raw && PROPOSAL_LIFECYCLE_SET.has(raw)) {
    return raw as ProposalLifecycleStatus;
  }
  return "draft";
}
