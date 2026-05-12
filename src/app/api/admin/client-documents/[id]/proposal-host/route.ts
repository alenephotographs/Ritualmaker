import { NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/adminAuth";
import {
  adminMarkProposalApproved,
  adminSetProposalLifecycleStatus,
  getClientDocumentById,
  rotateProposalPublicTokenForAdmin,
  setProposalLinkDisabledForAdmin,
} from "@/lib/db";
import { hasSupabaseService } from "@/lib/supabase/service";
import type { ProposalLifecycleStatus } from "@/lib/types/proposalLifecycle";
import { PROPOSAL_LIFECYCLE_SET } from "@/lib/types/proposalLifecycle";

export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

type Body = {
  action?:
    | "rotate_token"
    | "disable_link"
    | "enable_link"
    | "mark_approved"
    | "set_lifecycle";
  approvedName?: string;
  lifecycle?: string;
};

export async function POST(req: Request, ctx: RouteParams) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasSupabaseService()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }

  const id = ctx.params.id;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action;
  if (action === "rotate_token") {
    const doc = await rotateProposalPublicTokenForAdmin(id);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  }
  if (action === "disable_link") {
    const doc = await setProposalLinkDisabledForAdmin(id, true);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  }
  if (action === "enable_link") {
    const doc = await setProposalLinkDisabledForAdmin(id, false);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  }
  if (action === "mark_approved") {
    const name =
      typeof body.approvedName === "string" && body.approvedName.trim()
        ? body.approvedName.trim()
        : "Approved (admin)";
    const doc = await adminMarkProposalApproved(id, name);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  }
  if (action === "set_lifecycle") {
    const raw = body.lifecycle;
    if (typeof raw !== "string" || !PROPOSAL_LIFECYCLE_SET.has(raw)) {
      return NextResponse.json({ error: "Invalid lifecycle" }, { status: 400 });
    }
    const doc = await adminSetProposalLifecycleStatus(
      id,
      raw as ProposalLifecycleStatus,
    );
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET(_req: Request, ctx: RouteParams) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasSupabaseService()) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  }
  const doc = await getClientDocumentById(ctx.params.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const path = doc.proposalPublicToken
    ? `/proposal/${doc.proposalPublicToken}`
    : "";
  const hostedUrl =
    origin && path ? `${origin.replace(/\/$/, "")}${path}` : null;
  return NextResponse.json({
    document: doc,
    hostedUrl,
  });
}
