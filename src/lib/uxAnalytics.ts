import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";

export type UxEventInput = {
  eventType: "cta_view" | "cta_click" | "checkout_completed";
  experiment?: string;
  variant?: string;
  itemType?: string;
  itemId?: string;
  checkoutSessionId?: string;
  amountTotal?: number;
  path?: string;
  userAgent?: string;
};

export async function trackUxEvent(input: UxEventInput) {
  if (!hasSanityWriteClient()) return;

  const doc: { _type: "uxEvent"; [key: string]: unknown } = {
    _type: "uxEvent",
    eventType: input.eventType,
    experiment: input.experiment ?? "cta-copy",
    eventAt: new Date().toISOString(),
  };

  if (input.variant) doc.variant = input.variant;
  if (input.itemType) doc.itemType = input.itemType;
  if (input.itemId) doc.itemId = input.itemId;
  if (input.checkoutSessionId) doc.checkoutSessionId = input.checkoutSessionId;
  if (typeof input.amountTotal === "number") doc.amountTotal = input.amountTotal;
  if (input.path) doc.path = input.path;
  if (input.userAgent) doc.userAgent = input.userAgent;

  await sanityWriteClient.create({
    ...doc,
  });
}
