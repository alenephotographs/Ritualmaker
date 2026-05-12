import { auth } from "@/auth";

/** Signed-in studio owner (ADMIN_ALLOWED_EMAILS + owner access code). */
export async function getOwnerSession() {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "owner") {
    return null;
  }
  return session;
}
