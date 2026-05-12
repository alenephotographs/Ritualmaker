import { insertUxEvent } from "@/lib/db";
import { hasSupabaseService } from "@/lib/supabase/service";

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
  if (!hasSupabaseService()) return;
  try {
    await insertUxEvent({
      eventType: input.eventType,
      experiment: input.experiment ?? "cta-copy",
      variant: input.variant,
      itemType: input.itemType,
      itemId: input.itemId,
      checkoutSessionId: input.checkoutSessionId,
      amountTotal: input.amountTotal,
      path: input.path,
      userAgent: input.userAgent,
    });
  } catch (e) {
    console.error("[uxAnalytics] insert failed", e);
  }
}
