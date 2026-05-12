import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBouquets, getPantryItems, getVendors } from "@/lib/db";
import type { Bouquet, PantryItem, Vendor } from "@/lib/types/content";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin",
};

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

  const [vendors, bouquets, pantryItems] = await Promise.all([
    getVendors().catch(() => []),
    getBouquets().catch(() => []),
    getPantryItems().catch(() => []),
  ]);

  return (
    <AdminDashboard
      isOwner={isOwner}
      defaultVendorId={vendorId}
      vendors={vendors}
      bouquets={bouquets}
      pantryItems={pantryItems}
      userEmail={session.user.email}
    />
  );
}
