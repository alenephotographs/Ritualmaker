import { NextResponse } from "next/server";
import { trackUxEvent } from "@/lib/uxAnalytics";

export const runtime = "nodejs";

type Body = {
  eventType?: "cta_view" | "cta_click";
  variant?: "buy" | "checkout";
  itemType?: "bouquet" | "pantryItem";
  itemId?: string;
  path?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.eventType !== "cta_view" && body.eventType !== "cta_click") {
      return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
    }
    if (body.variant !== "buy" && body.variant !== "checkout") {
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }
    if (
      body.itemType &&
      body.itemType !== "bouquet" &&
      body.itemType !== "pantryItem"
    ) {
      return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
    }
    await trackUxEvent({
      eventType: body.eventType,
      experiment: "cta-copy",
      variant: body.variant,
      itemType: body.itemType,
      itemId: body.itemId,
      path: body.path,
      userAgent: req.headers.get("user-agent") ?? "",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics/cta] failed", error);
    return NextResponse.json({ error: "Could not track event" }, { status: 500 });
  }
}
