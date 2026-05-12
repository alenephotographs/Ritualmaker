import { AdminDashboard } from "@/components/AdminDashboard";
import { loadAdminDashboardData } from "@/lib/adminData";
import { ensureRequiredOfferings } from "@/lib/requiredOfferings";
import { auth } from "@/auth";

export const metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const isOwner = session.user.role === "owner";
  const vendorId = session.user.vendorId;

  if (isOwner) {
    await ensureRequiredOfferings().catch((error) => {
      console.error("[admin] failed ensuring required offerings", error);
    });
  }

  const data = await loadAdminDashboardData();

  return (
    <AdminDashboard
      section="dashboard"
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
