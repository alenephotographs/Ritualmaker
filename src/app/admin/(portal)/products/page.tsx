import { AdminDashboard } from "@/components/AdminDashboard";
import { loadAdminDashboardData } from "@/lib/adminData";
import { auth } from "@/auth";

export const metadata = { title: "Admin — Products" };

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const isOwner = session.user.role === "owner";
  const vendorId = session.user.vendorId;
  const data = await loadAdminDashboardData();

  return (
    <AdminDashboard
      section="products"
      isOwner={isOwner}
      defaultVendorId={vendorId}
      vendors={data.vendors}
      flowerProducts={data.flowerProducts}
      salesRecords={data.salesRecords}
      eventOrders={data.eventOrders}
      userEmail={session.user.email}
      cmsLoadError={data.cmsLoadError}
    />
  );
}
