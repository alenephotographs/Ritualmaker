import type { ClientDocumentRecord } from "@/lib/types/clientDocument";

export function computedBalanceCents(record: {
  proposalTotalCents?: number | null;
  depositAmountCents?: number | null;
}): number | null {
  const t = record.proposalTotalCents;
  const d = record.depositAmountCents;
  if (t == null || d == null) return null;
  return Math.max(0, t - d);
}

/** True when Stripe payment links exist but no longer match last snapshot (or legacy missing snapshot). */
export function computePaymentLinksStale(
  doc: Pick<
    ClientDocumentRecord,
    | "stripePaymentLinkDepositId"
    | "lastPaymentSnapshotTotal"
    | "lastPaymentSnapshotDeposit"
    | "lastPaymentSnapshotBalance"
    | "lastPaymentSnapshotBalanceDueDate"
    | "proposalTotalCents"
    | "depositAmountCents"
    | "paymentDueDate"
  >,
): boolean {
  if (!doc.stripePaymentLinkDepositId?.trim()) return false;
  const t = doc.proposalTotalCents ?? null;
  const d = doc.depositAmountCents ?? null;
  const bal = computedBalanceCents(doc);
  const due = doc.paymentDueDate?.trim() || null;
  const st = doc.lastPaymentSnapshotTotal;
  const sd = doc.lastPaymentSnapshotDeposit;
  const sb = doc.lastPaymentSnapshotBalance;
  const sDue = doc.lastPaymentSnapshotBalanceDueDate?.trim() || null;
  if (st == null && sd == null && sb == null) return true;
  return (
    t !== st ||
    d !== sd ||
    bal !== sb ||
    (due ?? "") !== (sDue ?? "")
  );
}

/** Unpaid Stripe invoice total differs from current proposal total. */
export function computeInvoiceTotalMismatch(doc: ClientDocumentRecord): boolean {
  if (!doc.stripeInvoiceId?.trim()) return false;
  const paidLike =
    doc.stripeInvoiceStatus === "paid" ||
    doc.stripeInvoiceStatus === "void" ||
    doc.stripeInvoiceStatus === "uncollectible";
  if (paidLike) return false;
  const invAmt = doc.stripeInvoiceAmountCents;
  const total = doc.proposalTotalCents;
  if (invAmt == null || total == null) return false;
  return invAmt !== total;
}
