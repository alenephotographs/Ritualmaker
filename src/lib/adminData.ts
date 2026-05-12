import { sanityClient } from "@/sanity/client";
import {
  eventOrdersQuery,
  flowerProductsQuery,
  flowerSalesRecordsQuery,
  vendorsQuery,
} from "@/sanity/queries";
import type { EventOrder, FlowerProduct, FlowerSalesRecord, Vendor } from "@/sanity/types";

export type AdminDashboardData = {
  vendors: Vendor[];
  flowerProducts: FlowerProduct[];
  salesRecords: FlowerSalesRecord[];
  eventOrders: EventOrder[];
  cmsLoadError: string | null;
};

function take<T>(result: PromiseSettledResult<T>, label: string, empty: T): T {
  if (result.status === "fulfilled") return result.value;
  console.error(`[admin] Sanity fetch failed (${label})`, result.reason);
  return empty;
}

export async function loadAdminDashboardData(): Promise<AdminDashboardData> {
  const settled = await Promise.allSettled([
    sanityClient.fetch<Vendor[]>(vendorsQuery),
    sanityClient.fetch<FlowerProduct[]>(flowerProductsQuery),
    sanityClient.fetch<FlowerSalesRecord[]>(flowerSalesRecordsQuery),
    sanityClient.fetch<EventOrder[]>(eventOrdersQuery),
  ]);

  const cmsLoadError = settled.some((r) => r.status === "rejected")
    ? "Some lists could not be loaded from Sanity (see server logs). Data may be incomplete until this is fixed."
    : null;

  return {
    vendors: take(settled[0], "vendors", [] as Vendor[]),
    flowerProducts: take(settled[1], "flowerProducts", [] as FlowerProduct[]),
    salesRecords: take(settled[2], "salesRecords", [] as FlowerSalesRecord[]),
    eventOrders: take(settled[3], "eventOrders", [] as EventOrder[]),
    cmsLoadError,
  };
}
