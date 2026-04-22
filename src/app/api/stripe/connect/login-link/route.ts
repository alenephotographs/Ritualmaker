import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createExpressDashboardLink } from "@/lib/stripeConnect";
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
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (!body.vendorId) {
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }
    if (!hasSanityWriteClient()) {
      return NextResponse.json(
        { error: "Vendor dashboard is temporarily unavailable" },
        { status: 500 },
      );
    }
    const vendor = await sanityWriteClient.fetch<Vendor | null>(
      `*[_type == "vendor" && _id == $id][0]{_id, stripeAccountId}`,
      { id: body.vendorId },
    );
    if (!vendor?.stripeAccountId) {
      return NextResponse.json(
        { error: "Vendor does not have a connected Stripe account yet" },
        { status: 409 },
      );
    }

    const isOwner = session.user.role === "owner";
    const userVendorId = session.user.vendorId;
    if (!isOwner) {
      if (!userVendorId || userVendorId !== vendor._id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const url = await createExpressDashboardLink(vendor.stripeAccountId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[stripe/connect/login-link] failed", error);
    return NextResponse.json({ error: "Could not create login link" }, { status: 500 });
  }
}
