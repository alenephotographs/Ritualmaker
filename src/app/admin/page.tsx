import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { sanityClient } from "@/sanity/client";
import type { Bouquet, PantryItem, Vendor } from "@/sanity/types";
import { bouquetsQuery, pantryItemsQuery, vendorsQuery } from "@/sanity/queries";
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
    sanityClient.fetch<Vendor[]>(vendorsQuery).catch(() => []),
    sanityClient.fetch<Bouquet[]>(bouquetsQuery).catch(() => []),
    sanityClient.fetch<PantryItem[]>(pantryItemsQuery).catch(() => []),
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
