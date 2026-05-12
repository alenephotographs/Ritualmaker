import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getOwnerSession } from "@/lib/adminAuth";
import {
  attachStripePaymentLinksToClientDocument,
  clearClientDocumentBalanceStripeLinkId,
  getClientDocumentById,
} from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { hasSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

const MIN_USD_CENTS = 50;

export async function POST(_req: Request, ctx: RouteParams) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasSupabaseService()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  const id = ctx.params.id;
  const doc = await getClientDocumentById(id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const depositCents = doc.depositAmountCents ?? 0;
  const totalCents = doc.proposalTotalCents ?? 0;
  const balanceCents = Math.max(0, totalCents - depositCents);

  if (depositCents < MIN_USD_CENTS) {
    return NextResponse.json(
      {
        error: `Set a deposit of at least $${MIN_USD_CENTS / 100} before creating Stripe links.`,
      },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const title = doc.packageTitle?.trim() || "Floral";

  async function deactivateIfPresent(plId: string | undefined) {
    if (!plId?.startsWith("plink_")) return;
    try {
      await stripe.paymentLinks.update(plId, { active: false });
    } catch (e) {
      console.warn("[stripe-payment-links] deactivate", plId, e);
    }
  }

  await deactivateIfPresent(doc.stripePaymentLinkDepositId);
  await deactivateIfPresent(doc.stripePaymentLinkBalanceId);

  if (balanceCents < MIN_USD_CENTS) {
    await clearClientDocumentBalanceStripeLinkId(id);
  }

  const depositPl = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: depositCents,
          product_data: {
            name: `Deposit — ${title.slice(0, 120)}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      clientDocumentId: id,
      paymentRole: "deposit",
    },
  } as unknown as Stripe.PaymentLinkCreateParams);

  let balancePl: Stripe.PaymentLink | null = null;
  if (balanceCents >= MIN_USD_CENTS) {
    balancePl = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: balanceCents,
            product_data: {
              name: `Balance — ${title.slice(0, 120)}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        clientDocumentId: id,
        paymentRole: "balance",
      },
    } as unknown as Stripe.PaymentLinkCreateParams);
  }

  const updated = await attachStripePaymentLinksToClientDocument(id, {
    depositLinkUrl: depositPl.url,
    stripePaymentLinkDepositId: depositPl.id,
    balanceLinkUrl: balancePl?.url ?? null,
    stripePaymentLinkBalanceId: balancePl?.id ?? null,
    snapshotTotalCents: totalCents,
    snapshotDepositCents: depositCents,
    snapshotBalanceCents: balanceCents,
    snapshotBalanceDueDate: doc.paymentDueDate?.trim() ?? null,
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Could not save payment links" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    document: updated,
    depositUrl: depositPl.url,
    balanceUrl: balancePl?.url ?? null,
  });
}
