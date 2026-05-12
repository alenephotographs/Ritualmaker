import { NextResponse } from "next/server";
import { approveProposalByToken } from "@/lib/db";

export const runtime = "nodejs";

type RouteParams = { params: { token: string } };

type Body = { fullName?: string; agreed?: boolean };

export async function POST(req: Request, ctx: RouteParams) {
  const token = ctx.params.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.agreed) {
    return NextResponse.json({ error: "Agreement is required." }, { status: 400 });
  }
  const name = typeof body.fullName === "string" ? body.fullName.trim() : "";
  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
  const doc = await approveProposalByToken(token, name, ip);
  if (!doc) {
    return NextResponse.json({ error: "Could not approve proposal." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
