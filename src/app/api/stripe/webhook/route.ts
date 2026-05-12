import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  markClientDocumentStripePayment,
  setClientDocumentStripeInvoiceStatus,
  updateVendorFromStripeAccount,
} from "@/lib/db";
import { hasSupabaseService } from "@/lib/supabase/service";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";
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

async function syncInvoiceStatusToEventOrder(invoice: Stripe.Invoice) {
  const eventOrderId =
    typeof invoice.metadata?.event_order_id === "string"
      ? invoice.metadata.event_order_id
      : "";
  if (!eventOrderId || !hasSanityWriteClient()) return;

  const paidInFull = invoice.status === "paid";
  await sanityWriteClient
    .patch(eventOrderId)
    .set({
      stripeInvoiceStatus: invoice.status ?? "",
      paidInFull,
      balancePaid: paidInFull,
      paymentStatusUpdatedAt: new Date().toISOString(),
    })
    .commit();
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
        if (hasSanityWriteClient()) {
          const eventOrderId = session.metadata?.event_order_id;
          const paymentType = session.metadata?.payment_type;
          if (
            eventOrderId &&
            (paymentType === "deposit" ||
              paymentType === "balance" ||
              paymentType === "invoice")
          ) {
            const depositPaid = paymentType === "deposit" ? true : undefined;
            const balancePaid = paymentType === "balance" ? true : undefined;
            const paidInFull = paymentType === "balance" || paymentType === "invoice";
            await sanityWriteClient
              .patch(eventOrderId)
              .set({
                ...(typeof depositPaid === "boolean" ? { depositPaid } : {}),
                ...(typeof balancePaid === "boolean" ? { balancePaid } : {}),
                ...(paidInFull ? { paidInFull: true } : {}),
                paymentStatusUpdatedAt: new Date().toISOString(),
              })
              .commit()
              .catch((error) => {
                console.error("[stripe] failed syncing event-order checkout payment", error);
              });
          }

          const vendorId = session.metadata?.vendorId;
          const checkoutSessionId = session.id;
          const existingRecord = await sanityWriteClient.fetch<{ _id: string } | null>(
            `*[_type == "flowerSalesRecord" && checkoutSessionId == $checkoutSessionId][0]{_id}`,
            { checkoutSessionId },
          );
          const ritualBundleDiscountCentsRaw = session.metadata?.ritualBundleDiscountCents;
          const ritualBundleDiscountCents =
            typeof ritualBundleDiscountCentsRaw === "string" && /^\d+$/.test(ritualBundleDiscountCentsRaw)
              ? Number(ritualBundleDiscountCentsRaw)
              : 0;
          const ritualBundleDiscountApplied =
            typeof session.metadata?.ritualBundleDiscountApplied === "string"
              ? session.metadata.ritualBundleDiscountApplied
              : ritualBundleDiscountCents > 0
                ? "yes"
                : "";

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
            ritualBundleDiscountCents: ritualBundleDiscountCents > 0 ? ritualBundleDiscountCents : undefined,
            ritualBundleDiscountApplied: ritualBundleDiscountApplied || undefined,
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
    case "invoice.created":
    case "invoice.finalized":
    case "invoice.paid":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
    case "invoice.updated":
    case "invoice.voided":
    case "invoice.marked_uncollectible": {
      try {
        const invoice = event.data.object as Stripe.Invoice;
        if (hasSupabaseService()) {
          if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
            const docId =
              invoice.metadata?.clientDocumentId?.trim() ||
              invoice.metadata?.event_order_id?.trim();
            if (docId) {
              await setClientDocumentStripeInvoiceStatus(docId, "paid");
              console.log("[stripe] client document invoice paid", docId);
            }
          }
          if (event.type === "invoice.voided") {
            const docId =
              invoice.metadata?.clientDocumentId?.trim() ||
              invoice.metadata?.event_order_id?.trim();
            if (docId) {
              await setClientDocumentStripeInvoiceStatus(docId, "void");
            }
          }
        }
        await syncInvoiceStatusToEventOrder(invoice);
      } catch (error) {
        console.error("[stripe] failed syncing invoice status", error);
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
