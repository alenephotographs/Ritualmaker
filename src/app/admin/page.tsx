import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { sanityClient } from "@/sanity/client";
import type {
  EventOrder,
  FlowerProduct,
  FlowerSalesRecord,
  Vendor,
} from "@/sanity/types";
import {
  eventOrdersQuery,
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

  const settled = await Promise.allSettled([
    sanityClient.fetch<Vendor[]>(vendorsQuery),
    sanityClient.fetch<FlowerProduct[]>(flowerProductsQuery),
    sanityClient.fetch<FlowerSalesRecord[]>(flowerSalesRecordsQuery),
    sanityClient.fetch<EventOrder[]>(eventOrdersQuery),
  ]);

  function take<T>(result: PromiseSettledResult<T>, label: string, empty: T): T {
    if (result.status === "fulfilled") return result.value;
    console.error(`[admin] Sanity fetch failed (${label})`, result.reason);
    return empty;
  }

  const vendors = take(settled[0], "vendors", [] as Vendor[]);
  const flowerProducts = take(settled[1], "flowerProducts", [] as FlowerProduct[]);
  const salesRecords = take(settled[2], "salesRecords", [] as FlowerSalesRecord[]);
  const eventOrders = take(settled[3], "eventOrders", [] as EventOrder[]);
  const cmsLoadError = settled.some((r) => r.status === "rejected")
    ? "Some lists could not be loaded from Sanity (see server logs). Inventory and records may be incomplete until this is fixed."
    : null;

  return (
    <AdminDashboard
      isOwner={isOwner}
      defaultVendorId={vendorId}
      vendors={vendors}
      flowerProducts={flowerProducts}
      salesRecords={salesRecords}
      eventOrders={eventOrders}
      userEmail={session.user.email}
      cmsLoadError={cmsLoadError}
    />
  );
}
