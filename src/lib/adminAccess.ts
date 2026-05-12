import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { hasSanityWriteClient } from "@/sanity/writeClient";

export type AdminAccess =
  | { error: NextResponse }
  | { session: Session; isOwner: boolean; vendorId?: string };

export function getAdminAccess(session: Session | null): AdminAccess {
  if (!session?.user?.email) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return {
    session,
    isOwner: session.user.role === "owner",
    vendorId: session.user.vendorId,
  };
}

export function requireWritableAdmin(access: AdminAccess) {
  if ("error" in access) return access.error;
  if (!hasSanityWriteClient()) {
    return NextResponse.json(
      { error: "Admin updates are temporarily unavailable" },
      { status: 500 },
    );
  }
  return null;
}

export function requireOwner(access: AdminAccess) {
  if ("error" in access) return access.error;
  if (!access.isOwner) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  return null;
}

export async function requireAdminAccess() {
  return getAdminAccess(await auth());
}
