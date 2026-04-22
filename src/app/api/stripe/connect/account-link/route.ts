import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createAccountOnboardingLink,
  createConnectedAccountV2,
} from "@/lib/stripeConnect";
import { hasSanityWriteClient, sanityWriteClient } from "@/sanity/writeClient";
import type { Vendor } from "@/sanity/types";

export const runtime = "nodejs";

type RequestBody = {
  vendorId?: string;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
    if (!body.vendorId) {
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }
    if (!hasSanityWriteClient()) {
      return NextResponse.json(
        { error: "Vendor updates are temporarily unavailable" },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const vendor = await sanityWriteClient.fetch<Vendor | null>(
      `*[_type == "vendor" && _id == $id][0]{
        _id,
        name,
        contactEmail,
        stripeAccountId
      }`,
      { id: body.vendorId },
    );
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const isOwner = session.user.role === "owner";
    const userVendorId = session.user.vendorId;
    if (!isOwner) {
      if (!userVendorId || userVendorId !== vendor._id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    let accountId = vendor.stripeAccountId;
    if (!accountId) {
      const account = await createConnectedAccountV2({
        displayName: vendor.name,
        email: vendor.contactEmail,
      });
      accountId = account.id;
      await sanityWriteClient
        .patch(vendor._id)
        .set({ stripeAccountId: accountId })
        .commit();
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    const url = await createAccountOnboardingLink(
      accountId,
      `${origin}/admin/vendors?vendorId=${encodeURIComponent(vendor._id)}&refresh=1`,
      `${origin}/admin/vendors?vendorId=${encodeURIComponent(vendor._id)}&connected=1`,
    );

    return NextResponse.json({
      url,
      accountId,
      note: "Use this link to complete Stripe onboarding, including tax and payout requirements.",
    });
  } catch (error) {
    console.error("[stripe/connect/account-link] failed", error);
    return NextResponse.json({ error: "Could not create onboarding link" }, { status: 500 });
  }
}
