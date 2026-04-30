import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/sign-in");
  }
  const isOwner = session.user.role === "owner";
  const vendorId = session.user.vendorId;
  if (!isOwner && !vendorId) {
    redirect("/admin/sign-in");
  }
  redirect("/admin/dashboard");
}
