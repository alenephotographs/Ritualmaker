import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { sanityClient } from "@/sanity/client";
import type {
  FlowerProduct,
  FlowerSalesRecord,
  Vendor,
} from "@/sanity/types";
import {
  flowerProductsQuery,
  flowerSalesRecordsQuery,
  vendorsQuery,
} from "@/sanity/queries";
import { AdminDashboard } from "@/components/AdminDashboard";
import { ensureRequiredOfferings } from "@/lib/requiredOfferings";

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

  if (isOwner) {
    await ensureRequiredOfferings().catch((error) => {
      console.error("[admin] failed ensuring required offerings", error);
    });
  }

  const [vendors, flowerProducts, salesRecords] = await Promise.all([
    sanityClient.fetch<Vendor[]>(vendorsQuery).catch(() => []),
    sanityClient.fetch<FlowerProduct[]>(flowerProductsQuery).catch(() => []),
    sanityClient.fetch<FlowerSalesRecord[]>(flowerSalesRecordsQuery).catch(() => []),
  ]);

  return (
    <AdminDashboard
      isOwner={isOwner}
      defaultVendorId={vendorId}
      vendors={vendors}
      flowerProducts={flowerProducts}
      salesRecords={salesRecords}
      userEmail={session.user.email}
    />
  );
}
