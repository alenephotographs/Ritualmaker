import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";
import { trackUxEvent } from "@/lib/uxAnalytics";

export const runtime = "nodejs";

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
        await trackUxEvent({
          eventType: "checkout_completed",
          experiment: "cta-copy",
          variant: session.metadata?.ctaVariant || "unknown",
          itemType: session.metadata?.itemType,
          itemId: session.metadata?.itemId,
          checkoutSessionId: session.id,
          amountTotal: session.amount_total ?? undefined,
        });
        if (hasSanityWriteClient()) {
          const vendorId = session.metadata?.vendorId;
          const checkoutSessionId = session.id;
          const existingRecord = await sanityWriteClient.fetch<{ _id: string } | null>(
            `*[_type == "flowerSalesRecord" && checkoutSessionId == $checkoutSessionId][0]{_id}`,
            { checkoutSessionId },
          );
          const salesRecord = {
            _type: "flowerSalesRecord",
            customerName: session.customer_details?.name ?? "",
            customerEmail: session.customer_details?.email ?? "",
            itemName: session.metadata?.itemName || "Flower Service",
            amountCents: session.amount_total ?? 0,
            saleDate: new Date().toISOString(),
            paymentMethod: "card",
            billingType: session.metadata?.billingLabel || "flower service",
            taxCategory: session.metadata?.taxCategory || "flower_service",
            checkoutSessionId,
            paymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id,
            itemType: session.metadata?.itemType ?? "",
            itemId: session.metadata?.itemId ?? "",
            productCategory: session.metadata?.productCategory ?? "",
            billingLabel: session.metadata?.billingLabel ?? "",
            notes: `Stripe checkout session ${session.id}`,
            ...(vendorId
              ? { vendor: { _type: "reference" as const, _ref: vendorId } }
              : {}),
          };
          if (existingRecord?._id) {
            const { _type, ...updates } = salesRecord;
            await sanityWriteClient.patch(existingRecord._id).set(updates).commit();
          } else {
            await sanityWriteClient.create(salesRecord);
          }
        }
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
    case "account.updated": {
      try {
        const account = event.data.object as Stripe.Account;
        if (hasSanityWriteClient()) {
          const complete = Boolean(
            account.charges_enabled &&
              account.payouts_enabled &&
              account.details_submitted,
          );
          const vendor = await sanityWriteClient.fetch<{ _id: string } | null>(
            `*[_type == "vendor" && stripeAccountId == $accountId][0]{_id}`,
            { accountId: account.id },
          );
          if (vendor?._id) {
            const currentlyDue = account.requirements?.currently_due ?? [];
            const pastDue = account.requirements?.past_due ?? [];
            await sanityWriteClient
              .patch(vendor._id)
              .set({
                stripeOnboardingComplete: complete,
                stripeDetailsSubmitted: Boolean(account.details_submitted),
                stripeChargesEnabled: Boolean(account.charges_enabled),
                stripePayoutsEnabled: Boolean(account.payouts_enabled),
                stripeRequirementsCurrentlyDue: currentlyDue,
                stripeRequirementsPastDue: pastDue,
                stripeRequirementsDisabledReason:
                  account.requirements?.disabled_reason ?? "",
                stripeComplianceLastSyncedAt: new Date().toISOString(),
              })
              .commit();
          }
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
