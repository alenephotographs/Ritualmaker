import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

export default async function AdminPortalLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/admin/sign-in");
  }
  const isOwner = session.user.role === "owner";
  const vendorId = session.user.vendorId;
  if (!isOwner && !vendorId) {
    redirect("/admin/sign-in");
  }

  return (
    <div className="min-h-screen bg-cream/40">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="mb-8 flex w-full flex-col gap-6 border-b border-ink/10 pb-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="min-w-0 shrink-0">
            <p className="text-xs uppercase tracking-widest text-ink/45">Admin</p>
            <h1 className="mt-2 font-display text-3xl font-light text-ink sm:text-4xl">
              Ritualmaker admin
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink/60">
              Signed in as <span className="text-ink/80">{session.user.email}</span>
            </p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 lg:max-w-none lg:items-end">
            <AdminNav />
            <AdminSignOutButton />
          </div>
        </header>
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </div>
  );
}
