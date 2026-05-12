import { NextResponse } from "next/server";
import { incrementProposalViewByToken } from "@/lib/db";

export const runtime = "nodejs";

type RouteParams = { params: { token: string } };

export async function POST(_req: Request, ctx: RouteParams) {
  const token = ctx.params.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const doc = await incrementProposalViewByToken(token);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
