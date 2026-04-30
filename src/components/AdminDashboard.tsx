"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import type { FlowerProduct, FlowerSalesRecord, Vendor } from "@/sanity/types";
import { formatUSD } from "@/lib/format";

type AdminDashboardProps = {
  isOwner: boolean;
  defaultVendorId?: string;
  vendors: Vendor[];
  flowerProducts: FlowerProduct[];
  salesRecords: FlowerSalesRecord[];
  userEmail?: string | null;
};

type ProductFormState = {
  id?: string;
  name: string;
  publicName: string;
  shortDescription: string;
  displayDescription: string;
  category: string;
  customCategory: string;
  tier: string;
  customTier: string;
  price: string;
  active: boolean;
  inStock: boolean;
  quantity: string;
  recurringItem: boolean;
  imageUrl: string;
  vendorId: string;
  billingLabel: string;
  overrideBillingLabel: boolean;
  taxCategory: string;
  sortOrder: string;
  internalNotes: string;
  showDisplayDescription: boolean;
};

type VendorFormState = {
  id?: string;
  name: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  payoutMethodNotes: string;
  commissionOrWholesaleNotes: string;
  active: boolean;
  internalNotes: string;
};

type SalesFormState = {
  id?: string;
  customerName: string;
  customerEmail: string;
  itemName: string;
  amount: string;
  saleDate: string;
  paymentMethod: FlowerSalesRecord["paymentMethod"];
  vendorId: string;
  notes: string;
  billingType: string;
};

const productCategories = [
  { value: "bouquet", label: "Bouquet" },
  { value: "bundle", label: "Bundle" },
  { value: "pantry", label: "Pantry" },
  { value: "wedding_event", label: "Wedding/event flowers" },
  { value: "vendor_item", label: "Vendor item" },
  { value: "other", label: "Other" },
];

const tierOptions = ["small", "standard", "premium", "custom"] as const;
const taxCategoryOptions = ["flower_service", "retail", "event_service"] as const;

const skuPresets = {
  glimmer: {
    name: "Glimmer",
    publicName: "Glimmer",
    price: "12",
    category: "bouquet",
    tier: "small",
    shortDescription: "Small seasonal grab bouquet.",
    displayDescription: "A simple daily flower offering, freshly cut and easy to take home.",
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: "10",
  },
  blessing: {
    name: "Blessing",
    publicName: "Blessing",
    price: "18",
    category: "bouquet",
    tier: "standard",
    shortDescription: "Signature Ritualmaker seasonal bouquet.",
    displayDescription: "A fuller bouquet for the table, the week, or a thoughtful gift.",
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: "20",
  },
  abundance: {
    name: "Abundance",
    publicName: "Abundance",
    price: "26",
    category: "bouquet",
    tier: "premium",
    shortDescription: "Larger gift-ready seasonal bouquet.",
    displayDescription: "An abundant seasonal arrangement for sharing, gifting, or anchoring a space.",
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: "30",
  },
  gardenOil: {
    name: "Garden Oil",
    publicName: "Garden Oil",
    price: "14",
    category: "pantry",
    tier: "",
    shortDescription: "Seasonal botanical-infused garden oil.",
    displayDescription:
      "A small-batch garden oil infused with seasonal herbs and botanicals, made as a simple kitchen ritual.",
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: "70",
  },
  botanicalSugar: {
    name: "Botanical Sugar",
    publicName: "Botanical Sugar",
    price: "10",
    category: "pantry",
    tier: "",
    shortDescription: "Seasonal flower and herb sugar.",
    displayDescription:
      "A fragrant botanical sugar for tea, baking, fruit, cocktails, and small daily rituals.",
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: "80",
  },
  herbalTea: {
    name: "Herbal Tea",
    publicName: "Herbal Tea",
    price: "10",
    category: "pantry",
    tier: "",
    shortDescription: "Seasonal herbal tea blend.",
    displayDescription:
      "A small-batch herbal tea blend made with garden-grown and seasonal botanicals.",
    billingLabel: "Flower Service",
    taxCategory: "flower_service",
    sortOrder: "90",
  },
} satisfies Record<string, Partial<ProductFormState>>;

type BatchPriceOperation = "increase" | "decrease";
type BatchPriceMode = "dollars" | "percent";

const paymentMethods: { value: FlowerSalesRecord["paymentMethod"]; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "venmo", label: "Venmo" },
  { value: "card", label: "Card" },
  { value: "invoice", label: "Invoice" },
  { value: "other", label: "Other" },
];

const emptyProductForm: ProductFormState = {
  name: "",
  publicName: "",
  shortDescription: "",
  displayDescription: "",
  category: "bouquet",
  customCategory: "",
  tier: "",
  customTier: "",
  price: "",
  active: true,
  inStock: true,
  quantity: "",
  recurringItem: true,
  imageUrl: "",
  vendorId: "",
  billingLabel: "Flower Service",
  overrideBillingLabel: false,
  taxCategory: "flower_service",
  sortOrder: "100",
  internalNotes: "",
  showDisplayDescription: false,
};

function ProductFormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-ink/10 pt-3">
      <p className="text-[10px] uppercase tracking-widest text-ink/40">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

const emptyVendorForm: VendorFormState = {
  name: "",
  contactName: "",
  contactEmail: "",
  phone: "",
  payoutMethodNotes: "",
  commissionOrWholesaleNotes: "",
  active: true,
  internalNotes: "",
};

const today = new Date().toISOString().slice(0, 10);

const emptySalesForm: SalesFormState = {
  customerName: "",
  customerEmail: "",
  itemName: "",
  amount: "",
  saleDate: today,
  paymentMethod: "cash",
  vendorId: "",
  notes: "",
  billingType: "flower service",
};

function dollarsFromCents(cents?: number) {
  if (typeof cents !== "number") return "";
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}

function centsFromDollars(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

function statusClassName(on: boolean) {
  return on ? "bg-moss/15 text-moss" : "bg-ink/10 text-ink/55";
}

type ApiResult<T> = {
  error?: string;
  id?: string;
  item?: T;
  vendor?: Vendor;
  record?: FlowerSalesRecord;
  savedAt?: string;
};

function upsertById<T extends { _id: string }>(rows: T[], next: T) {
  const exists = rows.some((row) => row._id === next._id);
  const merged = exists
    ? rows.map((row) => (row._id === next._id ? next : row))
    : [next, ...rows];
  return merged;
}

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as ApiResult<T>;
  } catch {
    return {};
  }
}

export function AdminDashboard({
  isOwner,
  defaultVendorId,
  vendors,
  flowerProducts,
  salesRecords,
  userEmail,
}: AdminDashboardProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [vendorForm, setVendorForm] = useState<VendorFormState>(emptyVendorForm);
  const [salesForm, setSalesForm] = useState<SalesFormState>(emptySalesForm);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [batchPriceOperation, setBatchPriceOperation] =
    useState<BatchPriceOperation>("increase");
  const [batchPriceMode, setBatchPriceMode] = useState<BatchPriceMode>("dollars");
  const [batchPriceValue, setBatchPriceValue] = useState("");
  const [productRows, setProductRows] = useState<FlowerProduct[]>(flowerProducts);
  const [vendorRows, setVendorRows] = useState<Vendor[]>(vendors);
  const [salesRows, setSalesRows] = useState<FlowerSalesRecord[]>(salesRecords);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quickEdits, setQuickEdits] = useState<Record<string, { price: string; quantity: string }>>(
    {},
  );

  const visibleVendors = useMemo(
    () => vendorRows.filter((vendor) => (isOwner ? true : vendor._id === defaultVendorId)),
    [defaultVendorId, isOwner, vendorRows],
  );
  const visibleProducts = useMemo(
    () =>
      productRows.filter((product) =>
        isOwner ? true : !defaultVendorId || product.vendorId === defaultVendorId,
      ),
    [defaultVendorId, isOwner, productRows],
  );
  const visibleSales = useMemo(
    () =>
      salesRows.filter((record) =>
        isOwner ? true : !defaultVendorId || record.vendorId === defaultVendorId,
      ),
    [defaultVendorId, isOwner, salesRows],
  );
  const selectedProducts = useMemo(
    () => visibleProducts.filter((product) => selectedProductIds.includes(product._id)),
    [selectedProductIds, visibleProducts],
  );

  const activeInStock = visibleProducts.filter(
    (product) => product.active !== false && product.inStock !== false,
  ).length;
  const outRecurring = visibleProducts.filter(
    (product) => product.recurringItem && product.inStock === false,
  ).length;
  const activeVendorItems = visibleProducts.filter(
    (product) =>
      product.active !== false && product.inStock !== false && Boolean(product.vendorId),
  ).length;
  const coreProducts = ["glimmer", "blessing", "abundance"]
    .map((slug) => visibleProducts.find((item) => item.slug === slug))
    .filter(Boolean) as FlowerProduct[];

  function normalizeCategory(form: ProductFormState) {
    return form.category === "other" && form.customCategory.trim()
      ? form.customCategory.trim()
      : form.category;
  }

  function normalizeTier(form: ProductFormState) {
    return form.tier === "custom" ? form.customTier.trim() : form.tier;
  }

  function normalizeBillingLabel(form: ProductFormState) {
    return form.overrideBillingLabel && form.billingLabel.trim()
      ? form.billingLabel.trim()
      : "Flower Service";
  }

  async function postJson<T>(url: string, payload: Record<string, unknown>) {
    setBusyId(String(payload.id ?? url));
    setErrorMessage(null);
    setStatusMessage(null);
    const response = await fetch(url, {
      method: payload.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await readJson<T>(response);
    setBusyId(null);
    if (!response.ok) {
      setErrorMessage(data.error ?? "Could not save changes");
      return null;
    }
    setStatusMessage(
      data.savedAt
        ? `Saved ${new Date(data.savedAt).toLocaleString()}`
        : "Saved.",
    );
    return data;
  }

  async function patchProduct(id: string, payload: Record<string, unknown>) {
    const data = await postJson<FlowerProduct>("/api/admin/flower-products", {
      id,
      ...payload,
    });
    if (data?.item) {
      setProductRows((current) => upsertById(current, data.item as FlowerProduct));
    }
  }

  function editProduct(product: FlowerProduct) {
    const categoryIsKnown = productCategories.some((item) => item.value === product.category);
    const tierIsKnown = tierOptions.some((item) => item === product.tier);
    const billingLabel = product.billingLabel ?? "Flower Service";
    setProductForm({
      id: product._id,
      name: product.name,
      publicName: product.publicName ?? product.name,
      shortDescription: product.shortDescription ?? "",
      displayDescription: product.displayDescription ?? product.description ?? "",
      category: categoryIsKnown ? product.category : "other",
      customCategory: categoryIsKnown ? "" : product.category,
      tier: tierIsKnown ? (product.tier ?? "") : "custom",
      customTier: tierIsKnown ? "" : (product.tier ?? ""),
      price: dollarsFromCents(product.priceCents),
      active: product.active !== false,
      inStock: product.inStock !== false,
      quantity: typeof product.quantity === "number" ? String(product.quantity) : "",
      recurringItem: product.recurringItem !== false,
      imageUrl: product.imageUrl ?? "",
      vendorId: product.vendorId ?? "",
      billingLabel,
      overrideBillingLabel: billingLabel !== "Flower Service",
      taxCategory: product.taxCategory ?? "flower_service",
      sortOrder: String(product.sortOrder ?? 100),
      internalNotes: product.internalNotes ?? "",
      showDisplayDescription: Boolean(product.displayDescription ?? product.description),
    });
  }

  function editVendor(vendor: Vendor) {
    setVendorForm({
      id: vendor._id,
      name: vendor.name,
      contactName: vendor.contactName ?? "",
      contactEmail: vendor.contactEmail ?? "",
      phone: vendor.phone ?? "",
      payoutMethodNotes: vendor.payoutMethodNotes ?? "",
      commissionOrWholesaleNotes: vendor.commissionOrWholesaleNotes ?? "",
      active: vendor.active !== false,
      internalNotes: vendor.internalNotes ?? "",
    });
  }

  function startSalesFromProduct(product: FlowerProduct) {
    setSalesForm({
      customerName: "",
      customerEmail: "",
      itemName: product.name,
      amount: dollarsFromCents(product.priceCents),
      saleDate: today,
      paymentMethod: "cash",
      vendorId: product.vendorId ?? "",
      notes: "",
      billingType: product.billingLabel ?? "flower service",
    });
  }

  function newProduct() {
    setProductForm(emptyProductForm);
    setErrorMessage(null);
    setStatusMessage("New product form ready.");
  }

  function applySkuPreset(key: keyof typeof skuPresets) {
    const preset = skuPresets[key];
    setProductForm({
      ...emptyProductForm,
      ...preset,
      overrideBillingLabel: false,
      showDisplayDescription: false,
      active: true,
      inStock: true,
      recurringItem: true,
    });
    setStatusMessage(`Loaded ${preset.name} preset.`);
    setErrorMessage(null);
  }

  function showNewVendorForm() {
    setVendorForm(emptyVendorForm);
    setStatusMessage("New vendor form ready.");
    setErrorMessage(null);
  }

  function productPayload() {
    const category =
      productForm.category === "other" && productForm.customCategory
        ? productForm.customCategory
        : productForm.category;
    const tier =
      productForm.tier === "custom" && productForm.customTier
        ? productForm.customTier
        : productForm.tier;
    return {
      id: productForm.id,
      name: productForm.name,
      publicName: productForm.publicName,
      shortDescription: productForm.shortDescription,
      displayDescription: productForm.displayDescription,
      category,
      tier,
      priceCents: centsFromDollars(productForm.price),
      active: productForm.active,
      inStock: productForm.inStock,
      quantity: productForm.quantity ? Number(productForm.quantity) : undefined,
      recurringItem: productForm.recurringItem,
      imageUrl: productForm.imageUrl,
      vendorId: productForm.vendorId,
      billingLabel: productForm.overrideBillingLabel ? productForm.billingLabel : "Flower Service",
      taxCategory: productForm.taxCategory,
      sortOrder: productForm.sortOrder ? Number(productForm.sortOrder) : 100,
      internalNotes: productForm.internalNotes,
    };
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await postJson<FlowerProduct>("/api/admin/flower-products", {
      ...productPayload(),
    });
    if (data?.item) {
      setProductRows((current) => upsertById(current, data.item as FlowerProduct));
      setProductForm(emptyProductForm);
    }
  }

  async function duplicateProduct(product: FlowerProduct) {
    const data = await postJson<FlowerProduct>("/api/admin/flower-products", {
      duplicateId: product._id,
    });
    if (data?.item) {
      setProductRows((current) => upsertById(current, data.item as FlowerProduct));
    }
  }

  function toggleSelectedProduct(productId: string) {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  async function applyBatchPriceChange() {
    if (!selectedProducts.length) {
      setErrorMessage("Select at least one product first.");
      return;
    }

    const rawValue = Number(batchPriceValue);
    if (!Number.isFinite(rawValue) || rawValue <= 0) {
      setErrorMessage("Enter a positive dollar amount or percentage.");
      return;
    }

    setBusyId("batch-prices");
    setErrorMessage(null);
    setStatusMessage(null);
    const updates = selectedProducts.map(async (product) => {
      const adjustment =
        batchPriceMode === "percent"
          ? Math.round(product.priceCents * (rawValue / 100))
          : centsFromDollars(batchPriceValue);
      const priceCents =
        batchPriceOperation === "increase"
          ? product.priceCents + adjustment
          : Math.max(0, product.priceCents - adjustment);

      const response = await fetch("/api/admin/flower-products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product._id,
          priceCents,
        }),
      });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(data.error ?? `Could not update ${product.name}`);
      }
      return data.item as FlowerProduct | undefined;
    });

    try {
      const updated = (await Promise.all(updates)).filter(Boolean) as FlowerProduct[];
      setProductRows((current) =>
        updated.reduce((rows, item) => upsertById(rows, item), current),
      );
      setSelectedProductIds([]);
      setStatusMessage(`Updated ${updated.length} product price(s).`);
      setBusyId(null);
    } catch (error) {
      setBusyId(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not apply batch price change",
      );
    }
  }

  async function saveVendor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await postJson<Vendor>("/api/admin/vendors", vendorForm);
    if (data?.vendor) {
      setVendorRows((current) => upsertById(current, data.vendor as Vendor));
      setVendorForm(emptyVendorForm);
    }
  }

  async function saveSalesRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await postJson<FlowerSalesRecord>("/api/admin/sales-records", {
      id: salesForm.id,
      customerName: salesForm.customerName,
      customerEmail: salesForm.customerEmail,
      itemName: salesForm.itemName,
      amountCents: centsFromDollars(salesForm.amount),
      saleDate: salesForm.saleDate,
      paymentMethod: salesForm.paymentMethod,
      vendorId: salesForm.vendorId,
      notes: salesForm.notes,
      billingType: salesForm.billingType,
    });
    if (data?.record) {
      setSalesRows((current) => upsertById(current, data.record as FlowerSalesRecord));
      setSalesForm(emptySalesForm);
    }
  }

  async function quickSaveProduct(product: FlowerProduct) {
    const priceInput = document.getElementById(
      `quick-price-${product._id}`,
    ) as HTMLInputElement | null;
    const quantityInput = document.getElementById(
      `quick-quantity-${product._id}`,
    ) as HTMLInputElement | null;
    const data = await postJson<FlowerProduct>("/api/admin/flower-products", {
      id: product._id,
      priceCents: centsFromDollars(priceInput?.value ?? dollarsFromCents(product.priceCents)),
      quantity: quantityInput?.value ? Number(quantityInput.value) : undefined,
    });
    if (data?.item) {
      setProductRows((current) => upsertById(current, data.item as FlowerProduct));
    }
  }

  async function openConnectLink(vendorId: string) {
    setBusyId(vendorId);
    setErrorMessage(null);
    setStatusMessage(null);
    const response = await fetch("/api/stripe/connect/account-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId }),
    });
    const data = (await readJson(response)) as { error?: string; url?: string };
    setBusyId(null);
    if (!response.ok || !data.url) {
      setErrorMessage(data.error ?? "Could not create onboarding link");
      return;
    }
    window.location.href = data.url;
  }

  async function openDashboard(vendorId: string) {
    setBusyId(vendorId);
    setErrorMessage(null);
    setStatusMessage(null);
    const response = await fetch("/api/stripe/connect/login-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId }),
    });
    const data = (await readJson(response)) as { error?: string; url?: string };
    setBusyId(null);
    if (!response.ok || !data.url) {
      setErrorMessage(data.error ?? "Could not open Stripe dashboard");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">Admin</p>
          <h1 className="mt-2 font-display text-4xl font-light sm:text-5xl">
            Inventory + billing
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            {userEmail} · Flower services, local pickup, vendors, and simple records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/sign-in" })}
          className="border border-ink/20 px-4 py-2 text-xs uppercase tracking-widest text-ink/70 hover:bg-ink hover:text-cream"
        >
          Sign out
        </button>
      </div>

      {(statusMessage || errorMessage) && (
        <div
          className={`mb-5 border px-4 py-3 text-sm ${
            errorMessage
              ? "border-magenta/30 bg-bloom/10 text-magenta"
              : "border-moss/30 bg-moss/10 text-moss"
          }`}
          role={errorMessage ? "alert" : "status"}
        >
          {errorMessage ?? statusMessage}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active in-stock", activeInStock],
          ["Out recurring", outRecurring],
          ["Active vendor items", activeVendorItems],
          ["Recent records", visibleSales.length],
        ].map(([label, value]) => (
          <div key={label} className="border border-ink/10 bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-ink/40">{label}</p>
            <p className="mt-2 font-display text-4xl font-light">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 border border-ink/10 bg-white p-4 sm:p-5">
        <p className="text-xs uppercase tracking-widest text-ink/40">Quick stock</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-ink/40">
              <tr>
                <th className="border-b border-ink/10 py-2 pr-3 font-normal">Name</th>
                <th className="border-b border-ink/10 px-3 py-2 font-normal">Price</th>
                <th className="border-b border-ink/10 px-3 py-2 font-normal">Qty</th>
                <th className="border-b border-ink/10 px-3 py-2 font-normal">In stock</th>
                <th className="border-b border-ink/10 px-3 py-2 font-normal">Active</th>
                <th className="border-b border-ink/10 pl-3 py-2 font-normal">Save</th>
              </tr>
            </thead>
            <tbody>
          {["glimmer", "blessing", "abundance"].map((slug) => {
            const product = visibleProducts.find((item) => item.slug === slug);
            return product ? (
              <tr key={product._id} className="border-b border-ink/10 align-top">
                <td className="py-3 pr-3">
                  <button
                    type="button"
                    onClick={() => editProduct(product)}
                    className="font-medium underline decoration-ink/20 underline-offset-4"
                  >
                    {product.publicName ?? product.name}
                  </button>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-ink/40">
                    Updated {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "—"}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <input
                    id={`quick-price-${product._id}`}
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={dollarsFromCents(product.priceCents)}
                    className="w-20 border border-ink/20 bg-white px-2 py-1.5 text-sm"
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    id={`quick-quantity-${product._id}`}
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={product.quantity ?? ""}
                    className="w-20 border border-ink/20 bg-white px-2 py-1.5 text-sm"
                  />
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    disabled={busyId === product._id}
                    onClick={() => patchProduct(product._id, { inStock: product.inStock === false })}
                    className={`px-3 py-1.5 text-xs uppercase tracking-widest ${statusClassName(product.inStock !== false)}`}
                  >
                    {product.inStock === false ? "Out" : "In"}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    disabled={busyId === product._id}
                    onClick={() => patchProduct(product._id, { active: product.active === false })}
                    className={`px-3 py-1.5 text-xs uppercase tracking-widest ${statusClassName(product.active !== false)}`}
                  >
                    {product.active === false ? "Off" : "On"}
                  </button>
                </td>
                <td className="py-3 pl-3">
                  <button
                    type="button"
                    disabled={busyId === product._id}
                    onClick={() => quickSaveProduct(product)}
                    className="bg-ink px-3 py-1.5 text-xs uppercase tracking-widest text-cream disabled:bg-ink/30"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={slug} className="border-b border-ink/10">
                <td colSpan={6} className="py-3 text-sm text-ink/55">
                  {slug} not seeded yet.
                </td>
              </tr>
            );
          })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-ink/10 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/40">
                Products / flower services
              </p>
              <h2 className="mt-2 font-display text-3xl font-light">Saved offerings</h2>
            </div>
            <button
              type="button"
              onClick={newProduct}
              className="border border-ink/20 px-3 py-2 text-xs uppercase tracking-widest"
            >
              New
            </button>
          </div>

          <div className="mt-5 border border-ink/10 bg-cream/70 p-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink/55">
                <input
                  type="checkbox"
                  checked={
                    visibleProducts.length > 0 &&
                    selectedProductIds.length === visibleProducts.length
                  }
                  onChange={(event) =>
                    setSelectedProductIds(
                      event.target.checked ? visibleProducts.map((product) => product._id) : [],
                    )
                  }
                />
                Select all
              </label>
              <label className="text-xs uppercase tracking-widest text-ink/55">
                Direction
                <select
                  value={batchPriceOperation}
                  onChange={(event) =>
                    setBatchPriceOperation(event.target.value as BatchPriceOperation)
                  }
                  className="mt-1 block border border-ink/20 bg-white px-2 py-1.5 text-xs normal-case tracking-normal"
                >
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </label>
              <label className="text-xs uppercase tracking-widest text-ink/55">
                Type
                <select
                  value={batchPriceMode}
                  onChange={(event) =>
                    setBatchPriceMode(event.target.value as typeof batchPriceMode)
                  }
                  className="mt-1 block border border-ink/20 bg-white px-2 py-1.5 text-xs normal-case tracking-normal"
                >
                  <option value="dollars">Dollar amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </label>
              <TextInput
                label={batchPriceMode === "dollars" ? "Amount" : "Percent"}
                value={batchPriceValue}
                onChange={setBatchPriceValue}
                placeholder={batchPriceMode === "dollars" ? "2" : "10"}
              />
              <button
                type="button"
                disabled={!selectedProductIds.length || busyId === "batch-prices"}
                onClick={applyBatchPriceChange}
                className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-cream disabled:cursor-not-allowed disabled:bg-ink/30"
              >
                Apply to {selectedProductIds.length || 0}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {visibleProducts.length ? (
              visibleProducts.map((product) => (
                <article
                  key={product._id}
                  className="border border-ink/10 bg-cream/60 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product._id)}
                        onChange={() => toggleSelectedProduct(product._id)}
                        aria-label={`Select ${product.name}`}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-widest text-ink/40">
                          {product.category} · {product.tier ?? "no tier"} · sort{" "}
                          {product.sortOrder ?? 100}
                        </p>
                        <p className="mt-1 text-sm text-ink/65">
                          {formatUSD(product.priceCents)}
                          {typeof product.quantity === "number"
                            ? ` · Qty ${product.quantity}`
                            : ""}
                          {" · "}
                          {product.recurringItem === false ? "one-off" : "recurring"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        defaultValue={dollarsFromCents(product.priceCents)}
                        aria-label={`Price for ${product.name}`}
                        onBlur={(event) => {
                          const nextPrice = centsFromDollars(event.target.value);
                          if (nextPrice !== product.priceCents) {
                            void postJson("/api/admin/flower-products", {
                              id: product._id,
                              priceCents: nextPrice,
                            });
                          }
                        }}
                        className="w-20 border border-ink/20 px-2 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        disabled={busyId === product._id}
                        onClick={() =>
                          postJson("/api/admin/flower-products", {
                            id: product._id,
                            inStock: product.inStock === false,
                          })
                        }
                        className={`px-3 py-1.5 text-xs uppercase tracking-widest ${statusClassName(
                          product.inStock !== false,
                        )}`}
                      >
                        {product.inStock === false ? "Out" : "In stock"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === product._id}
                        onClick={() =>
                          postJson("/api/admin/flower-products", {
                            id: product._id,
                            active: product.active === false,
                          })
                        }
                        className={`px-3 py-1.5 text-xs uppercase tracking-widest ${statusClassName(
                          product.active !== false,
                        )}`}
                      >
                        {product.active === false ? "Inactive" : "Active"}
                      </button>
                      <button
                        type="button"
                        onClick={() => editProduct(product)}
                        className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => startSalesFromProduct(product)}
                        className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest"
                      >
                        Record sale
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateProduct(product)}
                        className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest"
                      >
                        Duplicate
                      </button>
                    </div>
                  </div>
                  {product.inventoryAudit?.lastEditedAt && (
                    <p className="mt-3 text-xs text-ink/45">
                      Last edit:{" "}
                      {new Date(product.inventoryAudit.lastEditedAt).toLocaleString()} by{" "}
                      {product.inventoryAudit.lastEditedByEmail || "unknown"}
                    </p>
                  )}
                </article>
              ))
            ) : (
              <p className="text-sm text-ink/55">No flower services yet.</p>
            )}
          </div>
        </div>

        <form onSubmit={saveProduct} className="border border-ink/10 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/40">
                {productForm.id ? "Edit offering" : "Add offering"}
              </p>
              <h2 className="mt-1 font-display text-3xl font-light">Product form</h2>
            </div>
            <button
              type="submit"
              disabled={busyId === (productForm.id ?? "/api/admin/flower-products")}
              className="bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream disabled:bg-ink/30"
            >
              {busyId === (productForm.id ?? "/api/admin/flower-products")
                ? "Saving..."
                : "Save offering"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => applySkuPreset("glimmer")} className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest">
              Load Glimmer
            </button>
            <button type="button" onClick={() => applySkuPreset("blessing")} className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest">
              Load Blessing
            </button>
            <button type="button" onClick={() => applySkuPreset("abundance")} className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest">
              Load Abundance
            </button>
          </div>

          <div className="mt-4 grid gap-2 border border-ink/10 bg-cream/50 p-3 sm:grid-cols-3">
            <ToggleSwitch
              label="Active"
              checked={productForm.active}
              onChange={(checked) => setProductForm({ ...productForm, active: checked })}
            />
            <ToggleSwitch
              label="In stock"
              checked={productForm.inStock}
              onChange={(checked) => setProductForm({ ...productForm, inStock: checked })}
            />
            <ToggleSwitch
              label="Recurring"
              checked={productForm.recurringItem}
              onChange={(checked) => setProductForm({ ...productForm, recurringItem: checked })}
            />
          </div>

          <div className="mt-4 space-y-4">
            <FormSection title="Core">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label="Internal name"
                  value={productForm.name}
                  onChange={(value) => setProductForm({ ...productForm, name: value })}
                  required
                />
                <TextInput
                  label="Public name"
                  value={productForm.publicName}
                  onChange={(value) => setProductForm({ ...productForm, publicName: value })}
                  required
                />
              </div>
              <SelectInput
                label="Category"
                value={productForm.category}
                onChange={(value) => setProductForm({ ...productForm, category: value })}
                options={productCategories}
              />
              {productForm.category === "other" && (
                <TextInput
                  label="Custom category"
                  value={productForm.customCategory}
                  onChange={(value) => setProductForm({ ...productForm, customCategory: value })}
                />
              )}
              <SelectInput
                label="Tier"
                value={productForm.tier || "small"}
                onChange={(value) => setProductForm({ ...productForm, tier: value })}
                options={tierOptions.map((tier) => ({ value: tier, label: tier }))}
              />
              {productForm.tier === "custom" && (
                <TextInput
                  label="Custom tier"
                  value={productForm.customTier}
                  onChange={(value) => setProductForm({ ...productForm, customTier: value })}
                />
              )}
              <div>
                <p className="text-xs uppercase tracking-widest text-ink/40">Quick price</p>
                <div className="mt-2 flex gap-2">
                  {["12", "18", "26"].map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setProductForm({ ...productForm, price })}
                      className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest"
                    >
                      ${price}
                    </button>
                  ))}
                </div>
              </div>
              <TextInput
                label="Price"
                type="number"
                value={productForm.price}
                onChange={(value) => setProductForm({ ...productForm, price: value })}
                placeholder="12"
                required
              />
            </FormSection>

            <FormSection title="Availability">
              <TextInput
                label="Quantity optional"
                type="number"
                value={productForm.quantity}
                onChange={(value) => setProductForm({ ...productForm, quantity: value })}
                placeholder="4"
              />
            </FormSection>

            <FormSection title="Content">
              <TextareaInput
                label="Short description"
                helper="Used on product cards"
                rows={2}
                value={productForm.shortDescription}
                onChange={(value) =>
                  setProductForm({ ...productForm, shortDescription: value })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setProductForm({
                    ...productForm,
                    showDisplayDescription: !productForm.showDisplayDescription,
                  })
                }
                className="text-xs uppercase tracking-widest text-ink/60 underline decoration-ink/20 underline-offset-4"
              >
                {productForm.showDisplayDescription ? "Hide" : "Show"} display description
              </button>
              {productForm.showDisplayDescription && (
                <TextareaInput
                  label="Display description"
                  rows={3}
                  value={productForm.displayDescription}
                  onChange={(value) =>
                    setProductForm({ ...productForm, displayDescription: value })
                  }
                />
              )}
            </FormSection>

            <FormSection title="Advanced">
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-0 flex-1 text-sm text-ink/70">
                  Vendor optional
                  <select
                    value={productForm.vendorId}
                    onChange={(event) =>
                      setProductForm({ ...productForm, vendorId: event.target.value })
                    }
                    className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {visibleVendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={showNewVendorForm}
                  className="border border-ink/20 px-3 py-2 text-xs uppercase tracking-widest"
                >
                  + New vendor
                </button>
              </div>
              <ToggleSwitch
                label="Override billing label"
                checked={productForm.overrideBillingLabel}
                onChange={(checked) =>
                  setProductForm({ ...productForm, overrideBillingLabel: checked })
                }
              />
              {productForm.overrideBillingLabel && (
                <TextInput
                  label="Billing label"
                  value={productForm.billingLabel}
                  onChange={(value) => setProductForm({ ...productForm, billingLabel: value })}
                />
              )}
              <SelectInput
                label="Tax category"
                value={productForm.taxCategory}
                onChange={(value) => setProductForm({ ...productForm, taxCategory: value })}
                options={taxCategoryOptions.map((tax) => ({ value: tax, label: tax }))}
              />
              <TextInput
                label="Sort order"
                type="number"
                value={productForm.sortOrder}
                onChange={(value) => setProductForm({ ...productForm, sortOrder: value })}
                placeholder="10"
                helper="Lower = shows first"
              />
              <TextInput
                label="Image URL optional"
                value={productForm.imageUrl}
                onChange={(value) => setProductForm({ ...productForm, imageUrl: value })}
                placeholder="/photos/example.jpg"
              />
              <TextareaInput
                label="Internal notes"
                value={productForm.internalNotes}
                onChange={(value) => setProductForm({ ...productForm, internalNotes: value })}
              />
            </FormSection>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={saveVendor} className="border border-ink/10 bg-white p-4 sm:p-6">
          <p className="text-xs uppercase tracking-widest text-ink/40">
            {vendorForm.id ? "Edit vendor" : "Add vendor"}
          </p>
          <div className="mt-4 space-y-3">
            <TextInput
              label="Vendor name"
              value={vendorForm.name}
              onChange={(value) => setVendorForm({ ...vendorForm, name: value })}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput
                label="Contact name"
                value={vendorForm.contactName}
                onChange={(value) => setVendorForm({ ...vendorForm, contactName: value })}
              />
              <TextInput
                label="Email"
                value={vendorForm.contactEmail}
                onChange={(value) => setVendorForm({ ...vendorForm, contactEmail: value })}
              />
            </div>
            <TextInput
              label="Phone"
              value={vendorForm.phone}
              onChange={(value) => setVendorForm({ ...vendorForm, phone: value })}
            />
            <TextareaInput
              label="Payout method notes"
              value={vendorForm.payoutMethodNotes}
              onChange={(value) =>
                setVendorForm({ ...vendorForm, payoutMethodNotes: value })
              }
            />
            <TextareaInput
              label="Commission or wholesale notes"
              value={vendorForm.commissionOrWholesaleNotes}
              onChange={(value) =>
                setVendorForm({ ...vendorForm, commissionOrWholesaleNotes: value })
              }
            />
            <TextareaInput
              label="Internal notes"
              value={vendorForm.internalNotes}
              onChange={(value) => setVendorForm({ ...vendorForm, internalNotes: value })}
            />
            <CheckboxInput
              label="Active"
              checked={vendorForm.active}
              onChange={(checked) => setVendorForm({ ...vendorForm, active: checked })}
            />
            <button
              type="submit"
              className="bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream"
            >
              Save vendor
            </button>
          </div>
        </form>

        <div className="border border-ink/10 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/40">Vendors</p>
              <h2 className="mt-2 font-display text-3xl font-light">Consignment notes</h2>
            </div>
            <button
              type="button"
              onClick={() => setVendorForm(emptyVendorForm)}
              className="border border-ink/20 px-3 py-2 text-xs uppercase tracking-widest"
            >
              New
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {visibleVendors.map((vendor) => (
              <article key={vendor._id} className="border border-ink/10 bg-cream/60 p-4">
                <p className="font-medium">{vendor.name}</p>
                <p className="mt-1 text-sm text-ink/60">
                  {vendor.contactName || vendor.contactEmail || "No contact saved"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-widest text-ink/40">
                  {vendor.active === false ? "Inactive" : "Active"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editVendor(vendor)}
                    className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openConnectLink(vendor._id)}
                    disabled={busyId === vendor._id || !vendor.contactEmail}
                    className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest disabled:opacity-40"
                    title={vendor.contactEmail ? undefined : "Add vendor email before Stripe setup"}
                  >
                    Stripe setup
                  </button>
                  <button
                    type="button"
                    onClick={() => openDashboard(vendor._id)}
                    disabled={busyId === vendor._id || !vendor.stripeAccountId}
                    className="border border-ink/20 px-3 py-1.5 text-xs uppercase tracking-widest disabled:opacity-40"
                  >
                    Stripe
                  </button>
                </div>
                {!vendor.contactEmail && (
                  <p className="mt-2 text-xs text-ink/45">
                    Add vendor email before Stripe setup.
                  </p>
                )}
                {!vendor.stripeAccountId && (
                  <p className="mt-2 text-xs text-ink/45">
                    Stripe dashboard is not connected yet.
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={saveSalesRecord} className="border border-ink/10 bg-white p-4 sm:p-6">
          <p className="text-xs uppercase tracking-widest text-ink/40">Billing record</p>
          <h2 className="mt-2 font-display text-3xl font-light">Record sale</h2>
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput
                label="Customer name optional"
                value={salesForm.customerName}
                onChange={(value) => setSalesForm({ ...salesForm, customerName: value })}
              />
              <TextInput
                label="Customer email optional"
                value={salesForm.customerEmail}
                onChange={(value) => setSalesForm({ ...salesForm, customerEmail: value })}
              />
            </div>
            <TextInput
              label="Item / service name"
              value={salesForm.itemName}
              onChange={(value) => setSalesForm({ ...salesForm, itemName: value })}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput
                label="Amount"
                value={salesForm.amount}
                onChange={(value) => setSalesForm({ ...salesForm, amount: value })}
                required
              />
              <TextInput
                label="Date"
                type="date"
                value={salesForm.saleDate}
                onChange={(value) => setSalesForm({ ...salesForm, saleDate: value })}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-ink/70">
                Payment method
                <select
                  value={salesForm.paymentMethod}
                  onChange={(event) =>
                    setSalesForm({
                      ...salesForm,
                      paymentMethod: event.target.value as SalesFormState["paymentMethod"],
                    })
                  }
                  className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-ink/70">
                Vendor optional
                <select
                  value={salesForm.vendorId}
                  onChange={(event) =>
                    setSalesForm({ ...salesForm, vendorId: event.target.value })
                  }
                  className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
                >
                  <option value="">Ritualmaker / none</option>
                  {visibleVendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <TextInput
              label="Tax category / billing type"
              value={salesForm.billingType}
              onChange={(value) => setSalesForm({ ...salesForm, billingType: value })}
            />
            <TextareaInput
              label="Notes"
              value={salesForm.notes}
              onChange={(value) => setSalesForm({ ...salesForm, notes: value })}
            />
            <button
              type="submit"
              className="bg-ink px-5 py-2.5 text-xs uppercase tracking-widest text-cream"
            >
              Save record
            </button>
          </div>
        </form>

        <div className="border border-ink/10 bg-white p-4 sm:p-6">
          <p className="text-xs uppercase tracking-widest text-ink/40">Recent records</p>
          <div className="mt-4 space-y-3">
            {visibleSales.length ? (
              visibleSales.slice(0, 12).map((record) => (
                <article key={record._id} className="border border-ink/10 bg-cream/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{record.itemName}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {record.customerName || record.customerEmail || "Walk-up"} ·{" "}
                        {record.vendorName ?? "Ritualmaker"}
                      </p>
                    </div>
                    <p className="font-display text-2xl font-light">
                      {formatUSD(record.amountCents)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-widest text-ink/40">
                    {record.saleDate} · {record.paymentMethod} ·{" "}
                    {record.billingType ?? "flower service"}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-ink/55">No billing records yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  helper?: string;
}) {
  return (
    <label className="block text-sm text-ink/70">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
      />
      {helper && <span className="mt-1 block text-xs text-ink/45">{helper}</span>}
    </label>
  );
}

function TextareaInput({
  label,
  value,
  onChange,
  helper,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  rows?: number;
}) {
  return (
    <label className="block text-sm text-ink/70">
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-ink/20 px-3 py-2 text-sm"
      />
      {helper && <span className="mt-1 block text-xs text-ink/45">{helper}</span>}
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-sm text-ink/70">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-ink/20 bg-white px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 border px-3 py-2 text-sm ${
        checked ? "border-moss/30 bg-moss/10 text-moss" : "border-ink/10 bg-white text-ink/55"
      }`}
    >
      <span>{label}</span>
      <span className={`h-5 w-9 rounded-full p-0.5 ${checked ? "bg-moss" : "bg-ink/20"}`}>
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border border-ink/10 bg-cream/40 p-3">
      <p className="text-xs uppercase tracking-widest text-ink/40">{title}</p>
      {children}
    </section>
  );
}

function CheckboxInput({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
