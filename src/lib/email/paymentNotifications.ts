import "server-only";

import { Resend } from "resend";

import { formatUsdFromCents } from "@/lib/clientDocumentMoney";

type PaymentNotificationInput = {
  clientName?: string;
  eventType?: string;
  eventDate?: string;
  paymentType: "deposit" | "balance" | "full" | "invoice";
  amountPaidCents: number;
  proposalTotalCents: number;
  remainingBalanceCents: number;
  adminEventUrl: string;
  clientProposalUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function line(label: string, value: string): string {
  return `${label}: ${value}`;
}

export async function sendPaymentNotificationEmail(
  input: PaymentNotificationInput,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.PAYMENT_NOTIFICATION_EMAIL?.trim();
  if (!apiKey || !to) {
    console.warn("[email] payment notification skipped; missing env vars");
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Ritualmaker <onboarding@resend.dev>";
  const resend = new Resend(apiKey);
  const rows = [
    line("Client name", input.clientName?.trim() || "Unknown client"),
    line("Event type", input.eventType?.trim() || "Event"),
    line("Event date", input.eventDate?.trim() || "TBD"),
    line("Payment type", input.paymentType),
    line("Amount paid", formatUsdFromCents(input.amountPaidCents)),
    line("Proposal total", formatUsdFromCents(input.proposalTotalCents)),
    line("Remaining balance", formatUsdFromCents(input.remainingBalanceCents)),
    line("Admin event record", input.adminEventUrl),
    line("Client proposal page", input.clientProposalUrl),
  ];
  const text = rows.join("\n");
  const html = `<div>${rows
    .map((row) => `<p>${escapeHtml(row)}</p>`)
    .join("")}</div>`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Ritualmaker payment received",
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}
