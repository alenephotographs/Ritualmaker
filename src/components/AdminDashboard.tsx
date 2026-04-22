"use client";

import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import type { Bouquet, PantryItem, Vendor } from "@/sanity/types";

type AdminDashboardProps = {
  isOwner: boolean;
  defaultVendorId?: string;
  vendors: Vendor[];
  bouquets: Bouquet[];
  pantryItems: PantryItem[];
  userEmail?: string | null;
};

type ItemKind = "bouquet" | "pantryItem";

export function AdminDashboard({
  isOwner,
  defaultVendorId,
  vendors,
  bouquets,
  pantryItems,
  userEmail,
}: AdminDashboardProps) {
  const [busyVendorId, setBusyVendorId] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const filteredBouquets = useMemo(
    () =>
      isOwner
        ? bouquets
        : bouquets.filter((b) => !defaultVendorId || b.vendorId === defaultVendorId),
    [bouquets, isOwner, defaultVendorId],
  );
  const filteredPantry = useMemo(
    () =>
      isOwner
        ? pantryItems
        : pantryItems.filter((i) => !defaultVendorId || i.vendorId === defaultVendorId),
    [pantryItems, isOwner, defaultVendorId],
  );

  async function openConnectLink(vendorId: string) {
    setBusyVendorId(vendorId);
    const res = await fetch("/api/stripe/connect/account-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId }),
    });
    const data = await res.json();
    setBusyVendorId(null);
    if (!res.ok) {
      alert(data.error ?? "Could not create onboarding link");
      return;
    }
    window.location.href = data.url;
  }

  async function openDashboard(vendorId: string) {
    setBusyVendorId(vendorId);
    const res = await fetch("/api/stripe/connect/login-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId }),
    });
    const data = await res.json();
    setBusyVendorId(null);
    if (!res.ok) {
      alert(data.error ?? "Could not open Stripe dashboard");
      return;
    }
    window.location.href = data.url;
  }

  async function updateProduct(
    kind: ItemKind,
    id: string,
    payload: { available?: boolean; vendorId?: string; comingSoon?: boolean },
  ) {
    setBusyProductId(id);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        id,
        ...payload,
      }),
    });
    const data = await res.json();
    setBusyProductId(null);
    if (!res.ok) {
      alert(data.error ?? "Could not update product");
      return;
    }
    window.location.reload();
  }

  function complianceSummary(vendor: Vendor) {
    const due = vendor.stripeRequirementsCurrentlyDue ?? [];
    const pastDue = vendor.stripeRequirementsPastDue ?? [];
    const allRequirements = [...due, ...pastDue].map((r) => r.toLowerCase());
    const hasTaxRequirement = allRequirements.some((r) => r.includes("tax"));

    if (!vendor.stripeAccountId) {
      return "Not connected";
    }
    if (pastDue.length > 0) {
      return hasTaxRequirement
        ? `Past due: ${pastDue.length} item(s), including tax details`
        : `Past due: ${pastDue.length} item(s)`;
    }
    if (due.length > 0) {
      return hasTaxRequirement
        ? `Action needed: ${due.length} item(s), including tax details`
        : `Action needed: ${due.length} item(s)`;
    }
    if (vendor.stripeOnboardingComplete) {
      return "All Stripe tax and payout requirements complete";
    }
    return "Connected, pending review";
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">Admin</p>
          <h1 className="mt-2 font-display text-5xl font-light">Inventory + vendors</h1>
          <p className="mt-2 text-sm text-ink/60">{userEmail}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/sign-in" })}
          className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
        >
          Sign out
        </button>
      </div>

      <section className="mb-8">
        <h2 className="font-display text-3xl font-light">Vendors</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {vendors
            .filter((vendor) => (isOwner ? true : vendor._id === defaultVendorId))
            .map((vendor) => (
              <article key={vendor._id} className="border border-ink/10 bg-white p-5">
                <p className="text-[10px] uppercase tracking-widest text-ink/40">Vendor</p>
                <h3 className="mt-2 font-display text-2xl font-light">{vendor.name}</h3>
                <p className="mt-2 text-sm text-ink/60">
                  Stripe:{" "}
                  {vendor.stripeOnboardingComplete
                    ? "Onboarding complete"
                    : vendor.stripeAccountId
                      ? "Needs onboarding"
                      : "Not connected"}
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  Compliance: {complianceSummary(vendor)}
                </p>
                {vendor.stripeComplianceLastSyncedAt && (
                  <p className="mt-1 text-xs text-ink/45">
                    Last synced:{" "}
                    {new Date(vendor.stripeComplianceLastSyncedAt).toLocaleString()}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openConnectLink(vendor._id)}
                    disabled={busyVendorId === vendor._id}
                    className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-cream disabled:bg-ink/30"
                  >
                    {vendor.stripeAccountId
                      ? "Complete onboarding / tax docs"
                      : "Connect Stripe"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openDashboard(vendor._id)}
                    disabled={busyVendorId === vendor._id || !vendor.stripeAccountId}
                    className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-widest text-ink/70 disabled:opacity-40"
                  >
                    Open Stripe
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-3xl font-light">Bouquets</h2>
        <div className="mt-4 space-y-3">
          {filteredBouquets.map((item) => (
            <article
              key={item._id}
              className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-white p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-ink/50">{item.vendorName ?? "No vendor"}</p>
                {item.inventoryAudit?.lastEditedAt && (
                  <p className="text-xs text-ink/45">
                    Last edit:{" "}
                    {new Date(item.inventoryAudit.lastEditedAt).toLocaleString()} by{" "}
                    {item.inventoryAudit.lastEditedByEmail || "unknown"}
                  </p>
                )}
                {item.inventoryAuditHistory && item.inventoryAuditHistory.length > 0 && (
                  <p className="text-xs text-ink/45">
                    History entries: {item.inventoryAuditHistory.length}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isOwner && (
                  <select
                    defaultValue={item.vendorId}
                    onChange={(event) =>
                      updateProduct("bouquet", item._id, { vendorId: event.target.value })
                    }
                    className="border border-ink/20 px-2 py-1 text-xs"
                  >
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  disabled={busyProductId === item._id}
                  onClick={() =>
                    updateProduct("bouquet", item._id, { available: !item.available })
                  }
                  className="border border-ink/20 px-3 py-1 text-xs uppercase tracking-widest text-ink/70"
                >
                  {item.available ? "Mark out" : "Mark available"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-light">Pantry</h2>
        <div className="mt-4 space-y-3">
          {filteredPantry.map((item) => (
            <article
              key={item._id}
              className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-white p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-ink/50">{item.vendorName ?? "No vendor"}</p>
                {item.inventoryAudit?.lastEditedAt && (
                  <p className="text-xs text-ink/45">
                    Last edit:{" "}
                    {new Date(item.inventoryAudit.lastEditedAt).toLocaleString()} by{" "}
                    {item.inventoryAudit.lastEditedByEmail || "unknown"}
                  </p>
                )}
                {item.inventoryAuditHistory && item.inventoryAuditHistory.length > 0 && (
                  <p className="text-xs text-ink/45">
                    History entries: {item.inventoryAuditHistory.length}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isOwner && (
                  <select
                    defaultValue={item.vendorId}
                    onChange={(event) =>
                      updateProduct("pantryItem", item._id, { vendorId: event.target.value })
                    }
                    className="border border-ink/20 px-2 py-1 text-xs"
                  >
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  disabled={busyProductId === item._id}
                  onClick={() =>
                    updateProduct("pantryItem", item._id, {
                      available: !(item.available ?? true),
                    })
                  }
                  className="border border-ink/20 px-3 py-1 text-xs uppercase tracking-widest text-ink/70"
                >
                  {item.available === false ? "Mark available" : "Mark out"}
                </button>
                <button
                  type="button"
                  disabled={busyProductId === item._id}
                  onClick={() =>
                    updateProduct("pantryItem", item._id, {
                      comingSoon: !(item.comingSoon ?? false),
                    })
                  }
                  className="border border-ink/20 px-3 py-1 text-xs uppercase tracking-widest text-ink/70"
                >
                  {item.comingSoon ? "Disable soon" : "Set coming soon"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
