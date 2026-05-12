import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getClientDocumentByPublicToken } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const MIN_USD_CENTS = 50;

type RouteParams = { params: { token: string } };

type Body = { mode?: string };

export async function POST(req: Request, ctx: RouteParams) {
  const token = ctx.params.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    /* empty body ok */
  }
  const mode = body.mode === "balance" ? "balance" : body.mode === "full" ? "full" : "deposit";

  const doc = await getClientDocumentByPublicToken(token);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc.proposalApprovedAt) {
    return NextResponse.json(
      { error: "Please approve the proposal before paying." },
      { status: 403 },
    );
  }

  const total = doc.proposalTotalCents ?? 0;
  const dep = doc.depositAmountCents ?? 0;
  const balance = Math.max(0, total - dep);
  const fullCents = doc.paymentDepositPaid ? balance : total;

  let amount = 0;
  let paymentRole: "deposit" | "balance" | "full" = "deposit";
  if (mode === "deposit") {
    if (doc.paymentDepositPaid) {
      return NextResponse.json({ error: "Deposit already paid." }, { status: 409 });
    }
    amount = dep;
    paymentRole = "deposit";
  } else if (mode === "balance") {
    if (!doc.paymentDepositPaid) {
      return NextResponse.json(
        { error: "Pay the deposit first." },
        { status: 409 },
      );
    }
    if (doc.paymentBalancePaid || balance < MIN_USD_CENTS) {
      return NextResponse.json({ error: "No balance due." }, { status: 409 });
    }
    amount = balance;
    paymentRole = "balance";
  } else {
    if (doc.paymentDepositPaid && doc.paymentBalancePaid) {
      return NextResponse.json({ error: "Already paid in full." }, { status: 409 });
    }
    if (doc.paymentDepositPaid && balance < MIN_USD_CENTS) {
      return NextResponse.json({ error: "Already paid in full." }, { status: 409 });
    }
    amount = fullCents;
    paymentRole = "full";
  }

  if (amount < MIN_USD_CENTS) {
    return NextResponse.json(
      { error: "Amount is below the minimum charge for this payment." },
      { status: 400 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const stripe = getStripe();
  const title =
    doc.packageTitle?.trim() || doc.clientName?.trim() || "Ritualmaker proposal";
  const eventLabel = [doc.eventType, doc.eventDate].filter(Boolean).join(" · ");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/proposal/${encodeURIComponent(token)}?paid=${paymentRole}`,
    cancel_url: `${origin}/proposal/${encodeURIComponent(token)}`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name:
              paymentRole === "full"
                ? `Ritualmaker — ${title} (full payment)`
                : paymentRole === "deposit"
                  ? `Ritualmaker — ${title} (deposit)`
                  : `Ritualmaker — ${title} (balance)`,
            description: eventLabel || undefined,
          },
        },
        quantity: 1,
      },
    ],
    automatic_tax: { enabled: false },
    payment_method_types: ["card"],
    customer_email: doc.clientEmail?.trim() || undefined,
    metadata: {
      clientDocumentId: doc.id,
      paymentRole,
      proposalToken: token,
    },
  } as unknown as Stripe.Checkout.SessionCreateParams);

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
