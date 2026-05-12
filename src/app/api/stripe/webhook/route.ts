import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  markClientDocumentStripePayment,
  setClientDocumentStripeInvoiceStatus,
  updateVendorFromStripeAccount,
} from "@/lib/db";
import { hasSupabaseService } from "@/lib/supabase/service";
import { trackUxEvent } from "@/lib/uxAnalytics";

export const runtime = "nodejs";

async function resolveProposalPaymentMeta(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<{ clientDocumentId?: string; paymentRole?: string }> {
  let clientDocumentId = session.metadata?.clientDocumentId?.trim();
  let paymentRole = session.metadata?.paymentRole?.trim();
  if (clientDocumentId && paymentRole) {
    return { clientDocumentId, paymentRole };
  }
  const plRef = session.payment_link;
  const plId =
    typeof plRef === "string"
      ? plRef
      : plRef &&
          typeof plRef === "object" &&
          "id" in plRef &&
          typeof (plRef as { id?: string }).id === "string"
        ? (plRef as { id: string }).id
        : null;
  if (plId?.startsWith("plink_")) {
    const pl = await stripe.paymentLinks.retrieve(plId);
    clientDocumentId =
      pl.metadata?.clientDocumentId?.trim() ?? clientDocumentId;
    paymentRole = pl.metadata?.paymentRole?.trim() ?? paymentRole;
  }
  return { clientDocumentId, paymentRole };
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Invalid webhook request" }, { status: 400 });
  }

  const stripe = getStripe();
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      try {
        const session = event.data.object as Stripe.Checkout.Session;
        if (hasSupabaseService()) {
          try {
            const meta = await resolveProposalPaymentMeta(stripe, session);
            if (meta.clientDocumentId && meta.paymentRole) {
              const amount = session.amount_total ?? undefined;
              if (
                meta.paymentRole === "deposit" ||
                meta.paymentRole === "balance"
              ) {
                await markClientDocumentStripePayment(
                  meta.clientDocumentId,
                  meta.paymentRole === "deposit" ? "deposit" : "balance",
                  { amountTotalCents: amount },
                );
                console.log("[stripe] client document payment", meta);
              } else if (meta.paymentRole === "full") {
                await markClientDocumentStripePayment(
                  meta.clientDocumentId,
                  "full",
                  { amountTotalCents: amount },
                );
                console.log("[stripe] client document full payment", meta);
              }
            }
          } catch (e) {
            console.error("[stripe] proposal payment metadata", e);
          }
        }
        await trackUxEvent({
          eventType: "checkout_completed",
          experiment: "cta-copy",
          variant: session.metadata?.ctaVariant || "unknown",
          itemType: session.metadata?.itemType,
          itemId: session.metadata?.itemId,
          checkoutSessionId: session.id,
          amountTotal: session.amount_total ?? undefined,
        });
        console.log("[stripe] checkout completed", {
          id: session.id,
          itemId: session.metadata?.itemId,
          ctaVariant: session.metadata?.ctaVariant,
          amount_total: session.amount_total,
        });
      } catch (error) {
        console.error("[stripe] failed handling checkout.session.completed", error);
      }
      break;
    }
    case "invoice.paid":
    case "invoice.payment_succeeded": {
      try {
        const inv = event.data.object as Stripe.Invoice;
        if (hasSupabaseService()) {
          const docId =
            inv.metadata?.clientDocumentId?.trim() ||
            inv.metadata?.event_order_id?.trim();
          if (docId) {
            await setClientDocumentStripeInvoiceStatus(docId, "paid");
            console.log("[stripe] client document invoice paid", docId);
          }
        }
      } catch (e) {
        console.error("[stripe] invoice paid handler", e);
      }
      break;
    }
    case "invoice.voided": {
      try {
        const inv = event.data.object as Stripe.Invoice;
        if (hasSupabaseService()) {
          const docId =
            inv.metadata?.clientDocumentId?.trim() ||
            inv.metadata?.event_order_id?.trim();
          if (docId) {
            await setClientDocumentStripeInvoiceStatus(docId, "void");
          }
        }
      } catch (e) {
        console.error("[stripe] invoice voided handler", e);
      }
      break;
    }
    case "account.updated": {
      try {
        const account = event.data.object as Stripe.Account;
        if (hasSupabaseService()) {
          const complete = Boolean(
            account.charges_enabled &&
              account.payouts_enabled &&
              account.details_submitted,
          );
          const currentlyDue = account.requirements?.currently_due ?? [];
          const pastDue = account.requirements?.past_due ?? [];
          await updateVendorFromStripeAccount(account.id, {
            stripeOnboardingComplete: complete,
            stripeDetailsSubmitted: Boolean(account.details_submitted),
            stripeChargesEnabled: Boolean(account.charges_enabled),
            stripePayoutsEnabled: Boolean(account.payouts_enabled),
            stripeRequirementsCurrentlyDue: currentlyDue,
            stripeRequirementsPastDue: pastDue,
            stripeRequirementsDisabledReason: account.requirements?.disabled_reason ?? "",
          });
        }
      } catch (error) {
        console.error("[stripe] failed handling account.updated", error);
      }
      break;
    }
    default:
      // Ignore other events for now.
      break;
  }

  return NextResponse.json({ received: true });
}
