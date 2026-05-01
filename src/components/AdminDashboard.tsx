"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { EventOrder, FlowerProduct, FlowerSalesRecord, Vendor } from "@/sanity/types";
import { formatUSD } from "@/lib/format";
import { isBouquetCategory, RITUAL_BUNDLE_CUSTOMER_NOTE } from "@/lib/ritualBundle";
import {
  productAdminIssueLabel,
  productAdminIssues,
  shopProductDisplayTitle,
  shopProductHeroImageUrl,
  type ProductAdminIssue,
} from "@/lib/shopProduct";
import {
  AdminCard,
  AdminEmptyState,
  AdminSection,
  SectionFeedback,
  StatusBadge,
  adminHelperClass,
  adminInputClass,
  adminLabelClass,
  btnDestructive,
  btnPrimary,
  btnSecondary,
  btnUtility,
} from "@/components/admin/AdminPrimitives";

export type AdminDashboardSection =
  | "dashboard"
  | "orders"
  | "products"
  | "events"
  | "payments"
  | "media"
  | "settings";

type AdminDashboardProps = {
  section: AdminDashboardSection;
  isOwner: boolean;
  defaultVendorId?: string;
  vendors: Vendor[];
  flowerProducts: FlowerProduct[];
  salesRecords: FlowerSalesRecord[];
  eventOrders: EventOrder[];
  /** @deprecated Layout shows signed-in email */
  userEmail?: string | null;
  /** Server-side hint when CMS lists could not be loaded (logged on server). */
  cmsLoadError?: string | null;
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
  shipsNationwide: boolean;
  imageUrl: string;
  /** Sanity image asset ids in display order; first = main image. */
  galleryAssetIds: string[];
  /** Public URLs for thumbnails (from CMS or after upload). */
  galleryPreviewUrls: string[];
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

type EventOrderFormState = {
  id?: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  proposalScope: string;
  proposalTotal: string;
  depositAmount: string;
  balanceAmount: string;
  balanceDueDate: string;
  internalNotes: string;
  clientFacingNotes: string;
  phone: string;
  status: string;
  balanceManualOverride: boolean;
  depositPaidManual: boolean;
  balancePaidManual: boolean;
  paidInFullManual: boolean;
};

const productCategories = [
  { value: "flowers", label: "Flowers" },
  { value: "pantry", label: "Pantry" },
];

const tierOptions = ["small", "standard", "premium", "custom"] as const;
const taxCategoryOptions = ["flower_service", "retail", "event_service"] as const;

const skuPresets = {
  glimmer: {
    name: "Glimmer",
    publicName: "Glimmer",
    price: "12",
    category: "flowers",
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
    category: "flowers",
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
    category: "flowers",
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
    shipsNationwide: true,
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
  category: "flowers",
  customCategory: "",
  tier: "",
  customTier: "",
  price: "",
  active: true,
  inStock: true,
  quantity: "",
  recurringItem: true,
  shipsNationwide: false,
  imageUrl: "",
  galleryAssetIds: [],
  galleryPreviewUrls: [],
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

const emptyEventOrderForm: EventOrderFormState = {
  eventType: "Wedding",
  eventDate: "",
  eventLocation: "",
  proposalScope: "",
  proposalTotal: "",
  depositAmount: "",
  balanceAmount: "",
  balanceDueDate: "",
  internalNotes: "",
  clientFacingNotes: "",
  phone: "",
  status: "new",
  balanceManualOverride: false,
  depositPaidManual: false,
  balancePaidManual: false,
  paidInFullManual: false,
};

const eventOrderStatusOptions: { value: string; label: string }[] = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "booked", label: "Booked" },
  { value: "declined", label: "Declined" },
];

function dollarsFromCents(cents?: number) {
  if (typeof cents !== "number") return "";
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}

function centsFromDollars(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

function validateShopProductForm(form: ProductFormState): string | null {
  const title = (form.publicName ?? form.name ?? "").trim();
  if (!title) return "Public name (title) is required before saving.";
  const priceCents = centsFromDollars(form.price);
  if (!form.price.trim() || priceCents <= 0) return "Enter a valid price greater than zero.";
  const hasImage =
    Boolean(form.imageUrl?.trim()) ||
    form.galleryAssetIds.some((id) => id.startsWith("image-"));
  if (!hasImage) return "Add at least one product image (upload or image URL) before saving.";
  if (form.active && !form.inStock) {
    return "Products marked active should be in stock, or turn off Active until you are ready to sell.";
  }
  return null;
}

function inferEventType(order: EventOrder) {
  const services = order.services ?? [];
  if (services.includes("commercial-account")) return "Corporate";
  if (services.includes("wedding-event-florals") || services.includes("florals")) return "Wedding";
  if (services.includes("restaurant-hotel")) return "Corporate";
  return "Event";
}

function statusClassName(on: boolean) {
  return on ? "bg-moss/15 text-moss" : "bg-ink/10 text-ink/55";
}

type ApiResult<T> = {
  error?: string;
  id?: string;
  item?: T;
  order?: EventOrder;
  vendor?: Vendor;
  record?: FlowerSalesRecord;
  salesRecord?: FlowerSalesRecord;
  paymentLinkId?: string;
  paymentLinkUrl?: string;
  invoiceId?: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
  status?: string;
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

const coreBouquetSlugs = ["glimmer", "blessing", "abundance"] as const;
const coreBouquetPresetLabel: Record<(typeof coreBouquetSlugs)[number], string> = {
  glimmer: "Glimmer",
  blessing: "Blessing",
  abundance: "Abundance",
};

function findQuickStockProduct(
  products: FlowerProduct[],
  coreSlug: (typeof coreBouquetSlugs)[number],
): FlowerProduct | undefined {
  const bySlug = products.find((p) => p.slug === coreSlug);
  if (bySlug) return bySlug;
  const label = coreSlug.charAt(0).toUpperCase() + coreSlug.slice(1);
  const lower = label.toLowerCase();
  return products.find(
    (p) =>
      isBouquetCategory(p.category) &&
      (p.publicName?.trim().toLowerCase() === lower ||
        p.name.trim().toLowerCase() === lower),
  );
}

export function AdminDashboard({
  section,
  isOwner,
  defaultVendorId,
  vendors,
  flowerProducts,
  salesRecords,
  eventOrders,
  userEmail: _userEmail,
  cmsLoadError,
}: AdminDashboardProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<{ assetId: string; url: string }[]>([]);
  const [mediaCopyFeedback, setMediaCopyFeedback] = useState<string | null>(null);
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
  const [eventOrderRows, setEventOrderRows] = useState<EventOrder[]>(eventOrders);
  const [eventOrderForm, setEventOrderForm] = useState<EventOrderFormState>(emptyEventOrderForm);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedEventOrderIds, setExpandedEventOrderIds] = useState<Set<string>>(new Set());
  const [eventOrderSectionError, setEventOrderSectionError] = useState<string | null>(null);
  const [eventOrderSectionSuccess, setEventOrderSectionSuccess] = useState<string | null>(null);
  const [eventOrderFieldErrors, setEventOrderFieldErrors] = useState<Record<string, string>>({});
  const [paymentsSectionFeedback, setPaymentsSectionFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [productTab, setProductTab] = useState<"all" | "flowers" | "pantry">("all");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setVendorRows(vendors);
    setProductRows(flowerProducts);
    setSalesRows(salesRecords);
    setEventOrderRows(eventOrders);
  }, [vendors, flowerProducts, salesRecords, eventOrders]);

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
  const visibleEventOrders = useMemo(() => (isOwner ? eventOrderRows : []), [eventOrderRows, isOwner]);

  const upcomingEventOrders = useMemo(() => {
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + 30);
    return visibleEventOrders
      .filter((o) => {
        if (!o.eventDate) return false;
        const d = new Date(o.eventDate);
        return !Number.isNaN(d.getTime()) && d >= now && d <= horizon;
      })
      .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)))
      .slice(0, 8);
  }, [visibleEventOrders]);

  const paymentSummary = useMemo(() => {
    let depositDue = 0;
    let depositPaid = 0;
    let balanceDue = 0;
    let balancePaid = 0;
    for (const o of visibleEventOrders) {
      if (o.depositPaid) depositPaid += 1;
      else if (o.depositPaymentLinkUrl || (o.depositAmountCents && o.depositAmountCents > 0))
        depositDue += 1;
      if (o.balancePaid) balancePaid += 1;
      else if (o.balancePaymentLinkUrl || (o.balanceAmountCents && o.balanceAmountCents > 0))
        balanceDue += 1;
    }
    return { depositDue, depositPaid, balanceDue, balancePaid };
  }, [visibleEventOrders]);

  const productsForTab = useMemo(() => {
    if (productTab === "flowers") return visibleProducts.filter((p) => p.category !== "pantry");
    if (productTab === "pantry") return visibleProducts.filter((p) => p.category === "pantry");
    return visibleProducts;
  }, [visibleProducts, productTab]);

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
  async function uploadProductGalleryFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setGalleryUploading(true);
    setErrorMessage(null);
    const newIds: string[] = [];
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(fileList)) {
        const body = new FormData();
        body.set("file", file);
        const res = await fetch("/api/admin/flower-products/upload-image", {
          method: "POST",
          body,
        });
        const data = (await res.json()) as { error?: string; assetId?: string; url?: string };
        if (!res.ok || !data.assetId) {
          setErrorMessage(data.error ?? "Image upload failed");
          return;
        }
        newIds.push(data.assetId);
        newUrls.push(data.url ?? "");
      }
      setProductForm((prev) => ({
        ...prev,
        galleryAssetIds: [...prev.galleryAssetIds, ...newIds],
        galleryPreviewUrls: [...prev.galleryPreviewUrls, ...newUrls],
      }));
      setStatusMessage(`Uploaded ${newIds.length} image${newIds.length === 1 ? "" : "s"}. Save offering to persist.`);
    } finally {
      setGalleryUploading(false);
    }
  }

  function removeGalleryImage(index: number) {
    setProductForm((prev) => ({
      ...prev,
      galleryAssetIds: prev.galleryAssetIds.filter((_, i) => i !== index),
      galleryPreviewUrls: prev.galleryPreviewUrls.filter((_, i) => i !== index),
    }));
  }

  function moveGalleryImage(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= productForm.galleryAssetIds.length) return;
    setProductForm((prev) => {
      const ids = [...prev.galleryAssetIds];
      const urls = [...prev.galleryPreviewUrls];
      [ids[index], ids[next]] = [ids[next], ids[index]];
      [urls[index], urls[next]] = [urls[next], urls[index]];
      return { ...prev, galleryAssetIds: ids, galleryPreviewUrls: urls };
    });
  }

  async function uploadMediaLibraryFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setMediaUploading(true);
    setErrorMessage(null);
    setMediaCopyFeedback(null);
    const added: { assetId: string; url: string }[] = [];
    try {
      for (const file of Array.from(fileList)) {
        const body = new FormData();
        body.set("file", file);
        const res = await fetch("/api/admin/flower-products/upload-image", {
          method: "POST",
          body,
        });
        const data = (await res.json()) as { error?: string; assetId?: string; url?: string };
        if (!res.ok || !data.assetId) {
          setErrorMessage(data.error ?? "Upload failed");
          return;
        }
        added.push({ assetId: data.assetId, url: data.url ?? "" });
      }
      setMediaAssets((prev) => [...added, ...prev]);
      setStatusMessage(`Uploaded ${added.length} asset${added.length === 1 ? "" : "s"} to library.`);
    } finally {
      setMediaUploading(false);
    }
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

  function loadProductIntoForm(product: FlowerProduct) {
    const tierIsKnown = tierOptions.some((item) => item === product.tier);
    const billingLabel = product.billingLabel ?? "Flower Service";
    const shopCategory: "flowers" | "pantry" =
      product.category === "pantry" ? "pantry" : "flowers";
    setProductForm({
      id: product._id,
      name: product.name,
      publicName: product.publicName ?? product.name,
      shortDescription: product.shortDescription ?? "",
      displayDescription: product.displayDescription ?? product.description ?? "",
      category: shopCategory,
      customCategory: "",
      tier: tierIsKnown ? (product.tier ?? "") : "custom",
      customTier: tierIsKnown ? "" : (product.tier ?? ""),
      price: dollarsFromCents(product.priceCents),
      active: product.active !== false,
      inStock: product.inStock !== false,
      quantity: typeof product.quantity === "number" ? String(product.quantity) : "",
      recurringItem: product.recurringItem !== false,
      shipsNationwide: product.shipsNationwide === true,
      imageUrl: product.imageUrl ?? "",
      galleryAssetIds: (product.gallery ?? [])
        .map((g) => g.assetId)
        .filter((id): id is string => Boolean(id)),
      galleryPreviewUrls: (product.gallery ?? []).map((g) => g.url ?? ""),
      vendorId: product.vendorId ?? "",
      billingLabel,
      overrideBillingLabel: billingLabel !== "Flower Service",
      taxCategory: product.taxCategory ?? "flower_service",
      sortOrder: String(product.sortOrder ?? 100),
      internalNotes: product.internalNotes ?? "",
      showDisplayDescription: Boolean(product.displayDescription ?? product.description),
    });
  }

  function editProduct(product: FlowerProduct) {
    loadProductIntoForm(product);
    if (section === "products") {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("edit", product._id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }

  useEffect(() => {
    if (section !== "products") return;
    const id = searchParams?.get("edit")?.trim();
    if (!id) return;
    const p = productRows.find((row) => row._id === id);
    if (p) loadProductIntoForm(p);
  }, [section, searchParams, productRows]);

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
    if (section === "products") {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.delete("edit");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }
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
    const tier =
      productForm.tier === "custom" && productForm.customTier
        ? productForm.customTier
        : productForm.tier;
    const shopCategory: "flowers" | "pantry" =
      productForm.category === "pantry" ? "pantry" : "flowers";
    return {
      id: productForm.id,
      name: productForm.name,
      publicName: productForm.publicName,
      shortDescription: productForm.shortDescription,
      displayDescription: productForm.displayDescription,
      category: shopCategory,
      tier,
      priceCents: centsFromDollars(productForm.price),
      active: productForm.active,
      inStock: productForm.inStock,
      quantity: productForm.quantity ? Number(productForm.quantity) : undefined,
      recurringItem: productForm.recurringItem,
      shipsNationwide: productForm.shipsNationwide,
      imageUrl: productForm.imageUrl,
      galleryAssetIds: productForm.galleryAssetIds,
      vendorId: productForm.vendorId,
      billingLabel: productForm.overrideBillingLabel ? productForm.billingLabel : "Flower Service",
      taxCategory: productForm.taxCategory,
      sortOrder: productForm.sortOrder ? Number(productForm.sortOrder) : 100,
      internalNotes: productForm.internalNotes,
    };
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateShopProductForm(productForm);
    if (validationError) {
      setErrorMessage(validationError);
      setStatusMessage(null);
      return;
    }
    const data = await postJson<FlowerProduct>("/api/admin/flower-products", {
      ...productPayload(),
    });
    if (data?.item) {
      setProductRows((current) => upsertById(current, data.item as FlowerProduct));
      loadProductIntoForm(data.item as FlowerProduct);
      if (section === "products") {
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        params.set("edit", (data.item as FlowerProduct)._id);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
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
    const record = data?.record ?? data?.salesRecord;
    if (record) {
      setSalesRows((current) => upsertById(current, record as FlowerSalesRecord));
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

  function openEventOrder(order: EventOrder) {
    const total = order.proposalTotalCents;
    const dep = order.depositAmountCents;
    const savedBal = order.balanceAmountCents;
    const computedBal =
      typeof total === "number" && typeof dep === "number" ? Math.max(0, total - dep) : undefined;
    const manualOverride =
      typeof savedBal === "number" &&
      typeof computedBal === "number" &&
      savedBal !== computedBal;

    setEventOrderForm({
      id: order._id,
      eventType: order.eventType || inferEventType(order),
      eventDate: order.eventDate || "",
      eventLocation: order.eventLocation || order.venue || "",
      proposalScope: order.proposalScope || "",
      proposalTotal: dollarsFromCents(order.proposalTotalCents),
      depositAmount: dollarsFromCents(order.depositAmountCents),
      balanceAmount: dollarsFromCents(order.balanceAmountCents),
      balanceDueDate: order.balanceDueDate || "",
      internalNotes: order.internalNotes || "",
      clientFacingNotes: order.clientFacingNotes || "",
      phone: order.phone || "",
      status: typeof order.status === "string" ? order.status : "new",
      balanceManualOverride: manualOverride,
      depositPaidManual: Boolean(order.depositPaid),
      balancePaidManual: Boolean(order.balancePaid),
      paidInFullManual: Boolean(order.paidInFull),
    });
    setEventOrderFieldErrors({});
    setEventOrderSectionError(null);
  }

  function toggleEventOrderExpanded(id: string) {
    setExpandedEventOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const computedBalanceCents = useMemo(() => {
    const total = centsFromDollars(eventOrderForm.proposalTotal);
    const dep = centsFromDollars(eventOrderForm.depositAmount);
    if (!eventOrderForm.proposalTotal.trim() && !eventOrderForm.depositAmount.trim()) return null;
    return Math.max(0, total - dep);
  }, [eventOrderForm.proposalTotal, eventOrderForm.depositAmount]);

  function syncBalanceFromTotals(next: Partial<EventOrderFormState>) {
    setEventOrderForm((f) => {
      const merged = { ...f, ...next };
      if (merged.balanceManualOverride) return merged;
      const total = centsFromDollars(merged.proposalTotal);
      const dep = centsFromDollars(merged.depositAmount);
      const computed = Math.max(0, total - dep);
      return { ...merged, balanceAmount: dollarsFromCents(computed) };
    });
  }

  async function saveEventOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEventOrderSectionError(null);
    setEventOrderSectionSuccess(null);
    setEventOrderFieldErrors({});

    if (!eventOrderForm.id) {
      setEventOrderSectionError("Select an event order from the list to edit.");
      return;
    }

    const errs: Record<string, string> = {};
    if (!eventOrderForm.eventDate.trim()) errs.eventDate = "Event date helps align the proposal and invoice due dates.";
    if (!eventOrderForm.proposalTotal.trim() || centsFromDollars(eventOrderForm.proposalTotal) <= 0) {
      errs.proposalTotal = "Enter a proposal total greater than zero.";
    }
    if (Object.keys(errs).length) {
      setEventOrderFieldErrors(errs);
      setEventOrderSectionError("Fix the highlighted fields before saving.");
      return;
    }

    const balancePayload = eventOrderForm.balanceManualOverride
      ? centsFromDollars(eventOrderForm.balanceAmount)
      : computedBalanceCents ?? centsFromDollars(eventOrderForm.balanceAmount);

    const data = await postJson<EventOrder>("/api/admin/event-orders", {
      id: eventOrderForm.id,
      phone: eventOrderForm.phone,
      eventType: eventOrderForm.eventType,
      eventDate: eventOrderForm.eventDate,
      eventLocation: eventOrderForm.eventLocation,
      proposalScope: eventOrderForm.proposalScope,
      proposalTotalCents: centsFromDollars(eventOrderForm.proposalTotal),
      depositAmountCents: centsFromDollars(eventOrderForm.depositAmount),
      balanceAmountCents: balancePayload,
      balanceDueDate: eventOrderForm.balanceDueDate,
      internalNotes: eventOrderForm.internalNotes,
      clientFacingNotes: eventOrderForm.clientFacingNotes,
      status: eventOrderForm.status,
      depositPaid: eventOrderForm.depositPaidManual,
      balancePaid: eventOrderForm.balancePaidManual,
      paidInFull: eventOrderForm.paidInFullManual,
    });
    if (data?.order) {
      const patch = data.order as EventOrder;
      const rowBefore = eventOrderRows.find((r) => r._id === patch._id);
      const merged = rowBefore ? { ...rowBefore, ...patch } : patch;
      setEventOrderRows((current) => upsertById(current, merged));
      openEventOrder(merged);
      setEventOrderSectionSuccess("Event order saved.");
    }
  }

  async function markProposalPdfSentManually() {
    if (!eventOrderForm.id) {
      setEventOrderSectionError("Select an order first.");
      return;
    }
    setBusyId(`mark-sent-${eventOrderForm.id}`);
    setEventOrderSectionError(null);
    setEventOrderSectionSuccess(null);
    try {
      const response = await fetch("/api/admin/event-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: eventOrderForm.id,
          proposalPdfSentManuallyAt: new Date().toISOString(),
        }),
      });
      const data = await readJson<EventOrder>(response);
      if (!response.ok) throw new Error(data.error ?? "Could not update");
      if (data.order) {
        const patch = data.order as EventOrder;
        const rowBefore = eventOrderRows.find((r) => r._id === patch._id);
        const merged = rowBefore ? { ...rowBefore, ...patch } : patch;
        setEventOrderRows((current) => upsertById(current, merged));
        openEventOrder(merged);
      }
      setEventOrderSectionSuccess("Marked proposal as sent manually.");
    } catch (e) {
      setEventOrderSectionError(e instanceof Error ? e.message : "Could not update");
    } finally {
      setBusyId(null);
    }
  }

  async function copyToClipboard(value: string, label: string, orderId?: string) {
    try {
      await navigator.clipboard.writeText(value);
      const key = orderId ? `${label}:${orderId}` : label;
      setCopiedText(key);
      setStatusMessage(`${label} copied.`);
      if (orderId) {
        setEventOrderSectionError(null);
        setEventOrderSectionSuccess(`${label} copied.`);
      }
      setTimeout(() => setCopiedText((c) => (c === key ? null : c)), 1200);
    } catch {
      setErrorMessage(`Could not copy ${label.toLowerCase()}`);
      if (orderId) setEventOrderSectionError(`Could not copy ${label.toLowerCase()}`);
    }
  }

  function fileNameFromContentDisposition(header: string | null) {
    if (!header) return null;
    const utf8 = /filename\*=UTF-8''([^;\n]+)/i.exec(header);
    if (utf8?.[1]) {
      try {
        return decodeURIComponent(utf8[1].trim());
      } catch {
        return utf8[1].trim();
      }
    }
    const quoted = /filename="([^"]+)"/i.exec(header);
    if (quoted?.[1]) return quoted[1];
    const plain = /filename=([^;\n]+)/i.exec(header);
    if (plain?.[1]) return plain[1].trim().replace(/^"|"$/g, "");
    return null;
  }

  async function generateProposalPdf(order: EventOrder) {
    setBusyId(`proposal-${order._id}`);
    setErrorMessage(null);
    setStatusMessage(null);
    setEventOrderSectionError(null);
    setEventOrderSectionSuccess(null);
    try {
      const response = await fetch(`/api/admin/event-orders/${order._id}/proposal-pdf`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await readJson(response);
        throw new Error(data.error ?? "Could not generate proposal PDF");
      }
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const fromHeader = fileNameFromContentDisposition(response.headers.get("Content-Disposition"));
      a.download = fromHeader ?? `ritualmaker-proposal-${order._id}.pdf`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setEventOrderRows((current) =>
        current.map((row) =>
          row._id === order._id
            ? {
                ...row,
                proposalPdfGeneratedAt: new Date().toISOString(),
              }
            : row,
        ),
      );
      setStatusMessage("Proposal PDF generated.");
      setEventOrderSectionSuccess("Proposal PDF downloaded. Send it manually when ready.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not generate proposal PDF");
      setEventOrderSectionError(
        error instanceof Error ? error.message : "Could not generate proposal PDF",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function createEventPaymentLink(order: EventOrder, paymentType: "deposit" | "balance") {
    setBusyId(`${paymentType}-link-${order._id}`);
    setErrorMessage(null);
    setStatusMessage(null);
    setEventOrderSectionError(null);
    setEventOrderSectionSuccess(null);
    try {
      const response = await fetch(`/api/admin/event-orders/${order._id}/create-payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentType }),
      });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(data.error ?? `Could not create ${paymentType} payment link`);
      }
      setEventOrderRows((current) =>
        current.map((row) =>
          row._id !== order._id
            ? row
            : paymentType === "deposit"
              ? { ...row, depositPaymentLinkId: data.paymentLinkId, depositPaymentLinkUrl: data.paymentLinkUrl }
              : { ...row, balancePaymentLinkId: data.paymentLinkId, balancePaymentLinkUrl: data.paymentLinkUrl },
        ),
      );
      setStatusMessage(`${paymentType === "deposit" ? "Deposit" : "Balance"} payment link created.`);
      setEventOrderSectionSuccess(
        `${paymentType === "deposit" ? "Deposit" : "Balance"} payment link is ready.`,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create payment link");
      setEventOrderSectionError(
        error instanceof Error ? error.message : "Could not create payment link",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function createEventInvoice(order: EventOrder) {
    setBusyId(`invoice-${order._id}`);
    setErrorMessage(null);
    setStatusMessage(null);
    setEventOrderSectionError(null);
    setEventOrderSectionSuccess(null);
    try {
      const response = await fetch(`/api/admin/event-orders/${order._id}/create-invoice`, {
        method: "POST",
      });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(data.error ?? "Could not create Stripe invoice");
      }
      setEventOrderRows((current) =>
        current.map((row) =>
          row._id === order._id
            ? {
                ...row,
                stripeInvoiceId: data.invoiceId,
                stripeInvoiceUrl: data.hostedInvoiceUrl,
                stripeInvoicePdfUrl: data.invoicePdfUrl,
                stripeInvoiceStatus: data.status,
              }
            : row,
        ),
      );
      setStatusMessage("Stripe invoice created.");
      setEventOrderSectionSuccess("Stripe invoice created. Copy or open the hosted link below.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not create Stripe invoice");
      setEventOrderSectionError(
        error instanceof Error ? error.message : "Could not create Stripe invoice",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteSalesRecord(recordId: string) {
    if (
      !window.confirm(
        "Delete this billing record permanently? This cannot be undone.",
      )
    ) {
      return;
    }
    setBusyId(`delete-sale-${recordId}`);
    setPaymentsSectionFeedback(null);
    try {
      const response = await fetch("/api/admin/sales-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId, delete: true }),
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error ?? "Could not delete record");
      setSalesRows((current) => current.filter((r) => r._id !== recordId));
      setPaymentsSectionFeedback({ kind: "success", message: "Billing record deleted." });
    } catch (e) {
      setPaymentsSectionFeedback({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not delete record",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {(statusMessage || errorMessage || cmsLoadError) && (
          <div
            className={`mb-8 rounded-lg border px-4 py-3 text-sm ${
              errorMessage || cmsLoadError
                ? "border-magenta/30 bg-bloom/10 text-magenta"
                : "border-moss/30 bg-moss/10 text-moss"
            }`}
            role={errorMessage || cmsLoadError ? "alert" : "status"}
          >
            {errorMessage ?? cmsLoadError ?? statusMessage}
        </div>
      )}

      {section === "dashboard" ? (
        <div className="flex flex-col gap-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active in-stock", activeInStock],
          ["Out recurring", outRecurring],
          ["Active vendor items", activeVendorItems],
          ["Recent records", visibleSales.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-widest text-ink/45">{label}</p>
            <p className="mt-2 font-display text-4xl font-light text-ink">{value}</p>
          </div>
        ))}
      </div>

      <AdminCard
        title="Quick stock — core bouquets"
        description="Fast price and availability for Glimmer, Blessing, and Abundance. Scroll horizontally on small screens."
      >
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[640px] text-left text-sm">
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
          {coreBouquetSlugs.map((slug) => {
            const product = findQuickStockProduct(visibleProducts, slug);
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
                    className={`w-24 ${adminInputClass} py-2`}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    id={`quick-quantity-${product._id}`}
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={product.quantity ?? ""}
                    className={`w-24 ${adminInputClass} py-2`}
                  />
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    disabled={busyId === product._id}
                    onClick={() => patchProduct(product._id, { inStock: product.inStock === false })}
                    className={`min-h-[44px] px-3 py-2 text-xs uppercase tracking-widest sm:min-h-0 ${statusClassName(product.inStock !== false)}`}
                  >
                    {product.inStock === false ? "Out" : "In"}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    disabled={busyId === product._id}
                    onClick={() => patchProduct(product._id, { active: product.active === false })}
                    className={`min-h-[44px] px-3 py-2 text-xs uppercase tracking-widest sm:min-h-0 ${statusClassName(product.active !== false)}`}
                  >
                    {product.active === false ? "Off" : "On"}
                  </button>
                </td>
                <td className="py-3 pl-3">
                  <button
                    type="button"
                    disabled={busyId === product._id}
                    onClick={() => quickSaveProduct(product)}
                    className={`${btnPrimary()} px-4 py-2.5`}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={slug} className="border-b border-ink/10">
                <td colSpan={6} className="py-3 text-sm text-ink/55">
                  <span className="capitalize">{slug}</span> not in quick stock (no matching slug or bouquet
                  name). Use <strong>Load {coreBouquetPresetLabel[slug]}</strong> then{" "}
                  <strong>Save offering</strong>, or seed the{" "}
                  <code className="text-xs">{slug}</code> slug in Sanity.
                </td>
              </tr>
            );
          })}
            </tbody>
          </table>
        </div>
      </AdminCard>

          <AdminCard
            title="Upcoming events (next 30 days)"
            description="From your event order pipeline."
          >
            {upcomingEventOrders.length ? (
              <ul className="divide-y divide-ink/10 text-sm">
                {upcomingEventOrders.map((o) => (
                  <li key={o._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span className="font-medium text-ink">{o.name || "Client"}</span>
                    <span className="text-ink/60">{o.eventDate}</span>
                    <Link href="/admin/events" className="text-xs uppercase tracking-widest text-ink/50 underline">
                      Open events
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/55">No dated events in the next 30 days.</p>
            )}
          </AdminCard>

          <AdminCard title="Recent checkout orders" description="Card payments from the site (Stripe webhook).">
            {visibleSales.filter((r) => r.checkoutSessionId).slice(0, 8).length ? (
              <ul className="divide-y divide-ink/10 text-sm">
                {visibleSales
                  .filter((r) => r.checkoutSessionId)
                  .slice(0, 8)
                  .map((r) => (
                    <li key={r._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <span className="font-medium text-ink">{r.itemName}</span>
                      <span className="text-ink/60">{formatUSD(r.amountCents)}</span>
                      <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-ink/50 underline">
                        Orders
                      </Link>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/55">No Stripe checkout records yet.</p>
            )}
          </AdminCard>

          <AdminCard title="Event payment summary" description="Deposit and balance pipeline (event orders).">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded border border-ink/10 bg-cream/50 p-3">
                <dt className="text-xs uppercase tracking-widest text-ink/45">Deposits paid</dt>
                <dd className="mt-1 font-display text-2xl font-light">{paymentSummary.depositPaid}</dd>
              </div>
              <div className="rounded border border-ink/10 bg-cream/50 p-3">
                <dt className="text-xs uppercase tracking-widest text-ink/45">Deposits due / linkable</dt>
                <dd className="mt-1 font-display text-2xl font-light">{paymentSummary.depositDue}</dd>
              </div>
              <div className="rounded border border-ink/10 bg-cream/50 p-3">
                <dt className="text-xs uppercase tracking-widest text-ink/45">Balances paid</dt>
                <dd className="mt-1 font-display text-2xl font-light">{paymentSummary.balancePaid}</dd>
              </div>
              <div className="rounded border border-ink/10 bg-cream/50 p-3">
                <dt className="text-xs uppercase tracking-widest text-ink/45">Balances due / linkable</dt>
                <dd className="mt-1 font-display text-2xl font-light">{paymentSummary.balanceDue}</dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard title="Quick actions" description="Jump to common tasks.">
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/products" className={btnPrimary()}>
                New product
              </Link>
              <Link href="/admin/events" className={btnPrimary()}>
                Event orders
              </Link>
              <Link href="/admin/media" className={btnSecondary()}>
                Upload images
              </Link>
            </div>
          </AdminCard>
        </div>
      ) : section === "products" ? (
      <AdminSection
        id="admin-inventory"
        title="Products"
        description="Browse by tab, edit on the right. Save is pinned at the bottom of the editor."
      >
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
      <section className="grid gap-6 lg:grid-cols-1 xl:grid-cols-[1.15fr_0.85fr]">
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

          <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Product category">
            {(
              [
                { id: "all" as const, label: "All" },
                { id: "flowers" as const, label: "Flowers" },
                { id: "pantry" as const, label: "Pantry" },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={productTab === id}
                onClick={() => setProductTab(id)}
                className={`border px-4 py-2 text-xs uppercase tracking-widest ${
                  productTab === id
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 bg-white text-ink/70 hover:border-ink/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-5 border border-ink/10 bg-cream/70 p-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-ink/55">
                <input
                  type="checkbox"
                  checked={
                    productsForTab.length > 0 &&
                    productsForTab.every((p) => selectedProductIds.includes(p._id))
                  }
                  onChange={(event) => {
                    const ids = productsForTab.map((p) => p._id);
                    if (event.target.checked) {
                      setSelectedProductIds((cur) => [...new Set([...cur, ...ids])]);
                    } else {
                      setSelectedProductIds((cur) => cur.filter((id) => !ids.includes(id)));
                    }
                  }}
                />
                Select visible
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
                label={batchPriceMode === "dollars" ? "Amount (USD)" : "Percent"}
                value={batchPriceValue}
                onChange={setBatchPriceValue}
                helper={
                  batchPriceMode === "dollars"
                    ? "Example: enter 2 for a two-dollar change per item."
                    : "Example: enter 10 for a ten percent change per item."
                }
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productsForTab.length ? (
              productsForTab.map((product) => {
                const catLabel = product.category === "pantry" ? "Pantry" : "Flowers";
                const issues = productAdminIssues(product);
                const thumbUrl = shopProductHeroImageUrl(product);
                const statusLabel =
                  product.active === false
                    ? "Draft"
                    : product.inStock === false
                      ? "Out of stock"
                      : "Active";
                return (
                  <article
                    key={product._id}
                    className="flex flex-col border border-ink/10 bg-cream/60 p-4"
                  >
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product._id)}
                        onChange={() => toggleSelectedProduct(product._id)}
                        aria-label={`Select ${product.name}`}
                        className="mt-1"
                      />
                      <div className="h-16 w-16 shrink-0 overflow-hidden border border-ink/15 bg-stone/30">
                        {thumbUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[8px] uppercase text-ink/35">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{product.publicName ?? product.name}</p>
                        <p className="mt-1 text-sm text-ink/65">{formatUSD(product.priceCents)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-ink/45">
                          {catLabel} · {statusLabel}
                        </p>
                        {issues.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {issues.map((issue) => (
                              <span
                                key={issue}
                                className="inline-block border border-amber-300/90 bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-ink/80"
                                title={productAdminIssueLabel(issue)}
                              >
                                {productAdminIssueLabel(issue)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-3">
                      <button type="button" onClick={() => editProduct(product)} className={btnSecondary()}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateProduct(product)}
                        className={btnUtility()}
                      >
                        Duplicate
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="sm:col-span-2 lg:col-span-3">
                <AdminEmptyState
                  title="No products in this tab"
                  description="Try another tab or add a new product."
                />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={saveProduct} className="relative border border-ink/10 bg-white p-4 pb-28 sm:p-5 sm:pb-32">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/40">
                {productForm.id ? "Edit product" : "New product"}
              </p>
              <h2 className="mt-1 font-display text-3xl font-light">Product editor</h2>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs text-ink/55">
              Presets fill the form below; you still choose <strong>Save offering</strong> to write to the catalog.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applySkuPreset("glimmer")}
                className={btnUtility()}
              >
                Load Glimmer
              </button>
              <button
                type="button"
                onClick={() => applySkuPreset("blessing")}
                className={btnUtility()}
              >
                Load Blessing
              </button>
              <button
                type="button"
                onClick={() => applySkuPreset("abundance")}
                className={btnUtility()}
              >
                Load Abundance
              </button>
              <button
                type="button"
                onClick={() => applySkuPreset("gardenOil")}
                className={btnUtility()}
              >
                Load Garden Oil
              </button>
              <button
                type="button"
                onClick={() => applySkuPreset("botanicalSugar")}
                className={btnUtility()}
              >
                Load Botanical Sugar
              </button>
              <button
                type="button"
                onClick={() => applySkuPreset("herbalTea")}
                className={btnUtility()}
              >
                Load Herbal Tea
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 border border-ink/10 bg-cream/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <ToggleSwitch
              label="Ships nationwide (US)"
              checked={productForm.shipsNationwide}
              onChange={(checked) =>
                setProductForm({ ...productForm, shipsNationwide: checked })
              }
            />
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Only products with <strong>Ships nationwide</strong> on appear on the public shop with
            address collection at checkout.
          </p>

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
                label="Price (USD)"
                type="number"
                min={0}
                step="0.01"
                value={productForm.price}
                onChange={(value) => setProductForm({ ...productForm, price: value })}
                helper="Retail price before tax, in dollars (e.g. 12 or 18.50)."
                required
              />
            </FormSection>

            <FormSection title="Availability">
              <TextInput
                label="Quantity (optional)"
                type="number"
                min={0}
                step="1"
                value={productForm.quantity}
                onChange={(value) => setProductForm({ ...productForm, quantity: value })}
                helper="Leave blank if you do not track a numeric count for this SKU."
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
                helper="Lower numbers appear first in admin lists and on the site where sort is used."
              />
              <div className="space-y-2">
                <p className={adminLabelClass}>Upload product images</p>
                <p className={`${adminHelperClass} mb-2`}>
                  First image is the main photo on the shop and in Stripe Checkout. JPEG, PNG, WebP, or GIF,
                  up to 8 MB each. Save offering after uploading to store the gallery in Sanity.
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  disabled={galleryUploading || Boolean(busyId)}
                  onChange={(e) => {
                    void uploadProductGalleryFiles(e.target.files);
                    e.target.value = "";
                  }}
                  className="block w-full max-w-md text-sm text-ink/80 file:mr-3 file:border file:border-ink/20 file:bg-white file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-widest"
                />
                {galleryUploading ? (
                  <p className="text-xs uppercase tracking-widest text-ink/45">Uploading…</p>
                ) : null}
                {productForm.galleryAssetIds.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-3">
                    {productForm.galleryAssetIds.map((assetId, index) => {
                      const preview = productForm.galleryPreviewUrls[index];
                      return (
                        <li
                          key={`${assetId}-${index}`}
                          className="relative w-24 shrink-0 border border-ink/15 bg-white"
                        >
                          {index === 0 ? (
                            <span className="absolute left-1 top-1 z-10 bg-ink px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-cream">
                              Main
                            </span>
                          ) : null}
                          <div className="aspect-square w-full overflow-hidden bg-stone/30">
                            {preview ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={preview} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center p-2 text-center text-[9px] uppercase tracking-widest text-ink/40">
                                Saved
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 border-t border-ink/10 p-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveGalleryImage(index, -1)}
                              className="flex-1 border border-ink/15 px-1 py-1 text-[10px] uppercase tracking-widest disabled:opacity-30"
                            >
                              Up
                            </button>
                            <button
                              type="button"
                              disabled={index >= productForm.galleryAssetIds.length - 1}
                              onClick={() => moveGalleryImage(index, 1)}
                              className="flex-1 border border-ink/15 px-1 py-1 text-[10px] uppercase tracking-widest disabled:opacity-30"
                            >
                              Down
                            </button>
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="w-full border border-ink/15 px-1 py-1 text-[10px] uppercase tracking-widest text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
              <TextInput
                label="Image URL (optional fallback)"
                value={productForm.imageUrl}
                onChange={(value) => setProductForm({ ...productForm, imageUrl: value })}
                helper="Used when no uploaded gallery images are saved, or as an extra legacy field."
              />
              <TextareaInput
                label="Internal notes"
                value={productForm.internalNotes}
                onChange={(value) => setProductForm({ ...productForm, internalNotes: value })}
              />
            </FormSection>
          </div>
          <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-ink/10 bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-5 sm:px-5">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={() => newProduct()} className={btnUtility()}>
                Clear form
              </button>
              <button
                type="submit"
                disabled={busyId === (productForm.id ?? "/api/admin/flower-products")}
                className="bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream disabled:bg-ink/30"
              >
                {busyId === (productForm.id ?? "/api/admin/flower-products")
                  ? "Saving..."
                  : "Save product"}
              </button>
            </div>
          </div>
        </form>
      </section>
      </div>
      </AdminSection>
      ) : section === "events" ? (
      <AdminSection
        id="admin-events"
        title="Events"
        description="Weddings, corporate, and custom orders. Expand to edit; generate PDFs and Stripe links from the action row."
      >
        {eventOrderSectionError ? (
          <SectionFeedback kind="error" message={eventOrderSectionError} />
        ) : null}
        {eventOrderSectionSuccess ? (
          <SectionFeedback kind="success" message={eventOrderSectionSuccess} />
        ) : null}

        {!isOwner ? (
          <AdminCard>
            <p className="text-sm text-ink/65">Event orders are visible to shop owners only.</p>
          </AdminCard>
        ) : visibleEventOrders.length ? (
          <div className="space-y-4">
            {visibleEventOrders.map((order) => {
              const expanded = expandedEventOrderIds.has(order._id);
              const selected = eventOrderForm.id === order._id;
              const depositLinkDisabled =
                Boolean(busyId) ||
                !order.email ||
                !order.depositAmountCents ||
                order.depositAmountCents <= 0;
              const balanceLinkDisabled =
                Boolean(busyId) ||
                !order.email ||
                !order.balanceAmountCents ||
                order.balanceAmountCents <= 0;
              const invoiceDisabled =
                Boolean(busyId) ||
                !order.email ||
                !order.proposalTotalCents ||
                order.proposalTotalCents <= 0;
              const badges = [
                { label: "Proposal PDF generated", on: Boolean(order.proposalPdfGeneratedAt) },
                { label: "Deposit link created", on: Boolean(order.depositPaymentLinkUrl) },
                { label: "Balance link created", on: Boolean(order.balancePaymentLinkUrl) },
                { label: "Stripe invoice created", on: Boolean(order.stripeInvoiceId) },
                { label: "Deposit paid", on: Boolean(order.depositPaid), variant: "success" as const },
                { label: "Balance paid", on: Boolean(order.balancePaid), variant: "success" as const },
                { label: "Paid in full", on: Boolean(order.paidInFull), variant: "success" as const },
              ];
              const proposalState = order.proposalPdfGeneratedAt
                ? order.proposalPdfSentManuallyAt
                  ? "Sent manually"
                  : "Generated"
                : "Not generated";
              return (
                <AdminCard key={order._id} className="!p-0 overflow-hidden">
                  <div className="border-b border-ink/10 bg-cream/50 px-4 py-4 sm:px-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-medium text-ink">
                          {order.name || "Unnamed client"}
                        </p>
                        <p className="mt-1 truncate text-sm text-ink/60">{order.email || "No email"}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6">
                          <div>
                            <span className={adminLabelClass}>Event date</span>
                            <p className="mt-1 font-medium text-ink">{order.eventDate || "—"}</p>
                          </div>
                          <div>
                            <span className={adminLabelClass}>Total</span>
                            <p className="mt-1 font-medium text-ink">
                              {typeof order.proposalTotalCents === "number"
                                ? formatUSD(order.proposalTotalCents)
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <span className={adminLabelClass}>Deposit</span>
                            <p className="mt-1 font-medium text-ink">
                              {typeof order.depositAmountCents === "number"
                                ? formatUSD(order.depositAmountCents)
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <span className={adminLabelClass}>Balance</span>
                            <p className="mt-1 font-medium text-ink">
                              {typeof order.balanceAmountCents === "number"
                                ? formatUSD(order.balanceAmountCents)
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <span className={adminLabelClass}>Pipeline</span>
                            <p className="mt-1 font-medium capitalize text-ink">
                              {order.status || "new"}
                            </p>
                          </div>
                          <div>
                            <span className={adminLabelClass}>Proposal PDF</span>
                            <p className="mt-1 font-medium text-ink">{proposalState}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <button
                          type="button"
                          onClick={() => {
                            toggleEventOrderExpanded(order._id);
                            openEventOrder(order);
                          }}
                          className={btnSecondary()}
                        >
                          {expanded ? "Collapse" : "Expand"} · {selected ? "Editing" : "Edit"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {badges.map((b) => (
                        <StatusBadge
                          key={b.label}
                          variant={b.on ? (b.variant ?? "info") : "neutral"}
                        >
                          {b.label}
                        </StatusBadge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 px-4 py-4 sm:px-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => void generateProposalPdf(order)}
                        disabled={Boolean(busyId)}
                        className={btnPrimary()}
                      >
                        {busyId === `proposal-${order._id}` ? "Generating…" : "Generate proposal PDF"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void createEventPaymentLink(order, "deposit")}
                        disabled={depositLinkDisabled || busyId === `deposit-link-${order._id}`}
                        title={
                          !order.email
                            ? "Add client email on the inquiry (Sanity) before creating a payment link."
                            : !order.depositAmountCents || order.depositAmountCents <= 0
                              ? "Set a deposit amount in the order editor and save first."
                              : undefined
                        }
                        className={btnPrimary()}
                      >
                        {busyId === `deposit-link-${order._id}`
                          ? "Creating…"
                          : "Create deposit payment link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void createEventPaymentLink(order, "balance")}
                        disabled={balanceLinkDisabled || busyId === `balance-link-${order._id}`}
                        title={
                          !order.email
                            ? "Add client email on the inquiry (Sanity) before creating a payment link."
                            : !order.balanceAmountCents || order.balanceAmountCents <= 0
                              ? "Set a balance amount in the order editor and save first."
                              : undefined
                        }
                        className={btnPrimary()}
                      >
                        {busyId === `balance-link-${order._id}`
                          ? "Creating…"
                          : "Create balance payment link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void createEventInvoice(order)}
                        disabled={invoiceDisabled || busyId === `invoice-${order._id}`}
                        title={
                          !order.email
                            ? "Add client email on the inquiry (Sanity) before creating an invoice."
                            : !order.proposalTotalCents || order.proposalTotalCents <= 0
                              ? "Set proposal total in the order editor and save first."
                              : undefined
                        }
                        className={btnPrimary()}
                      >
                        {busyId === `invoice-${order._id}` ? "Creating…" : "Create Stripe invoice"}
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {order.depositPaymentLinkUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(order.depositPaymentLinkUrl, "_blank", "noopener,noreferrer")
                            }
                            className={btnSecondary()}
                          >
                            Open deposit link
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void copyToClipboard(order.depositPaymentLinkUrl!, "Deposit link", order._id)
                            }
                            className={btnSecondary()}
                          >
                            {copiedText === `Deposit link:${order._id}` ? "Link copied" : "Copy deposit link"}
                          </button>
                        </>
                      ) : null}
                      {order.balancePaymentLinkUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(order.balancePaymentLinkUrl, "_blank", "noopener,noreferrer")
                            }
                            className={btnSecondary()}
                          >
                            Open balance link
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void copyToClipboard(order.balancePaymentLinkUrl!, "Balance link", order._id)
                            }
                            className={btnSecondary()}
                          >
                            {copiedText === `Balance link:${order._id}` ? "Link copied" : "Copy balance link"}
                          </button>
                        </>
                      ) : null}
                      {order.stripeInvoiceUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(order.stripeInvoiceUrl, "_blank", "noopener,noreferrer")
                            }
                            className={btnSecondary()}
                          >
                            Open invoice
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void copyToClipboard(order.stripeInvoiceUrl!, "Invoice URL", order._id)
                            }
                            className={btnSecondary()}
                          >
                            {copiedText === `Invoice URL:${order._id}` ? "Link copied" : "Copy invoice URL"}
                          </button>
                        </>
                      ) : null}
                      {order.stripeInvoicePdfUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(order.stripeInvoicePdfUrl, "_blank", "noopener,noreferrer")
                            }
                            className={btnSecondary()}
                          >
                            Open invoice PDF
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void copyToClipboard(order.stripeInvoicePdfUrl!, "Invoice PDF URL", order._id)
                            }
                            className={btnSecondary()}
                          >
                            {copiedText === `Invoice PDF URL:${order._id}` ? "Copied" : "Copy invoice PDF"}
                          </button>
                        </>
                      ) : null}
                    </div>
                    <p className="text-xs text-ink/50">
                      Invoice status:{" "}
                      <span className="font-medium text-ink">
                        {order.stripeInvoiceStatus || "—"}
                      </span>
                      {order.depositPaid ? " · Deposit paid" : ""}
                      {order.balancePaid ? " · Balance paid" : ""}
                    </p>
                  </div>

                  {expanded ? (
                    <div className="border-t border-ink/10 bg-white px-4 py-5 sm:px-6">
                      {selected ? (
                        <form onSubmit={saveEventOrder} className="space-y-8">
                          <AdminCard title="Client details" description="Name and email come from the inquiry form. Update phone here when needed.">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <ReadOnlyField label="Client name" value={order.name || "—"} />
                              <ReadOnlyField label="Email" value={order.email || "—"} />
                              <TextInput
                                label="Phone"
                                value={eventOrderForm.phone}
                                onChange={(v) => setEventOrderForm({ ...eventOrderForm, phone: v })}
                                helper="Saved with the order when you click Save event order."
                              />
                            </div>
                          </AdminCard>

                          <AdminCard title="Event details" description="What appears on proposals and invoices.">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <SelectInput
                                label="Event type"
                                value={eventOrderForm.eventType}
                                onChange={(value) =>
                                  setEventOrderForm({ ...eventOrderForm, eventType: value })
                                }
                                options={[
                                  { value: "Wedding", label: "Wedding" },
                                  { value: "Event", label: "Event" },
                                  { value: "Corporate", label: "Corporate" },
                                ]}
                              />
                              <TextInput
                                label={
                                  <>
                                    Event date <RequiredMark />
                                  </>
                                }
                                type="date"
                                value={eventOrderForm.eventDate}
                                onChange={(value) =>
                                  setEventOrderForm({ ...eventOrderForm, eventDate: value })
                                }
                                error={eventOrderFieldErrors.eventDate}
                              />
                              <div className="sm:col-span-2">
                                <TextInput
                                  label="Event location / venue"
                                  value={eventOrderForm.eventLocation}
                                  onChange={(value) =>
                                    setEventOrderForm({ ...eventOrderForm, eventLocation: value })
                                  }
                                  helper="City, venue name, or region — whatever you send to the client."
                                />
                              </div>
                            </div>
                          </AdminCard>

                          <AdminCard
                            title="Proposal details"
                            description="Scope and totals used for the downloadable PDF and Stripe invoice line."
                          >
                            <TextareaInput
                              label="Proposal notes / scope"
                              rows={5}
                              value={eventOrderForm.proposalScope}
                              onChange={(value) =>
                                setEventOrderForm({ ...eventOrderForm, proposalScope: value })
                              }
                              helper="This text can appear on the client PDF and invoice description."
                            />
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <TextInput
                                label={
                                  <>
                                    Proposal total (USD) <RequiredMark />
                                  </>
                                }
                                type="number"
                                min={0}
                                step="0.01"
                                value={eventOrderForm.proposalTotal}
                                onChange={(value) => syncBalanceFromTotals({ proposalTotal: value })}
                                error={eventOrderFieldErrors.proposalTotal}
                                helper="Full project total before tax (adjust in Stripe if you need tax)."
                              />
                            </div>
                          </AdminCard>

                          <AdminCard
                            title="Payment schedule"
                            description="Balance auto-fills as total minus deposit. Turn on override to enter a custom balance."
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <TextInput
                                label="Deposit amount (USD)"
                                type="number"
                                min={0}
                                step="0.01"
                                value={eventOrderForm.depositAmount}
                                onChange={(value) => syncBalanceFromTotals({ depositAmount: value })}
                              />
                              <TextInput
                                label="Balance due date"
                                type="date"
                                value={eventOrderForm.balanceDueDate}
                                onChange={(value) =>
                                  setEventOrderForm({ ...eventOrderForm, balanceDueDate: value })
                                }
                              />
                            </div>
                            <div className="mt-4 rounded-lg border border-ink/10 bg-cream/40 p-4">
                              <p className={adminLabelClass}>Payment summary</p>
                              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                <div className="flex justify-between gap-2 border-b border-ink/10 pb-2 sm:block sm:border-0 sm:pb-0">
                                  <dt className="text-ink/55">Proposal total</dt>
                                  <dd className="font-medium text-ink">
                                    {eventOrderForm.proposalTotal
                                      ? formatUSD(centsFromDollars(eventOrderForm.proposalTotal))
                                      : "—"}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-2 border-b border-ink/10 pb-2 sm:block sm:border-0 sm:pb-0">
                                  <dt className="text-ink/55">Deposit</dt>
                                  <dd className="font-medium text-ink">
                                    {eventOrderForm.depositAmount
                                      ? formatUSD(centsFromDollars(eventOrderForm.depositAmount))
                                      : "—"}
                                  </dd>
                                </div>
                                <div className="flex justify-between gap-2 sm:col-span-2">
                                  <dt className="text-ink/55">Balance {eventOrderForm.balanceManualOverride ? "(manual)" : "(calculated)"}</dt>
                                  <dd className="font-medium text-ink">
                                    {eventOrderForm.balanceAmount
                                      ? formatUSD(centsFromDollars(eventOrderForm.balanceAmount))
                                      : "—"}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                            <CheckboxInput
                              label="Override calculated balance (enter custom balance below)"
                              checked={eventOrderForm.balanceManualOverride}
                              onChange={(checked) =>
                                setEventOrderForm({ ...eventOrderForm, balanceManualOverride: checked })
                              }
                            />
                            <TextInput
                              label="Balance amount (USD)"
                              type="number"
                              min={0}
                              step="0.01"
                              value={eventOrderForm.balanceAmount}
                              onChange={(value) =>
                                setEventOrderForm({ ...eventOrderForm, balanceAmount: value })
                              }
                              disabled={!eventOrderForm.balanceManualOverride}
                              helper={
                                eventOrderForm.balanceManualOverride
                                  ? "Saved as-is when you save the order."
                                  : "Auto-calculated from total minus deposit."
                              }
                            />
                          </AdminCard>

                          <AdminCard
                            title="Stripe / invoice tools"
                            description="Create links and invoices from the action row above. Mark proposal sent when you email or text it yourself."
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                              <button
                                type="button"
                                onClick={() => void markProposalPdfSentManually()}
                                disabled={
                                  !eventOrderForm.id || busyId === `mark-sent-${eventOrderForm.id}`
                                }
                                className={btnSecondary()}
                              >
                                {busyId === `mark-sent-${eventOrderForm.id}`
                                  ? "Saving…"
                                  : "Mark proposal PDF sent manually"}
                              </button>
                            </div>
                            {order.proposalPdfSentManuallyAt ? (
                              <p className={adminHelperClass}>
                                Last marked sent:{" "}
                                {new Date(order.proposalPdfSentManuallyAt).toLocaleString()}
                              </p>
                            ) : null}
                          </AdminCard>

                          <AdminCard
                            title="Internal notes"
                            description="Never included on the client-facing proposal PDF."
                          >
                            <TextareaInput
                              label="Internal notes"
                              rows={4}
                              value={eventOrderForm.internalNotes}
                              onChange={(value) =>
                                setEventOrderForm({ ...eventOrderForm, internalNotes: value })
                              }
                            />
                          </AdminCard>

                          <AdminCard
                            title="Client-facing notes"
                            description="Optional extra lines for emails or future client surfaces (stored on the order)."
                          >
                            <TextareaInput
                              label="Client-facing notes"
                              rows={3}
                              value={eventOrderForm.clientFacingNotes}
                              onChange={(value) =>
                                setEventOrderForm({ ...eventOrderForm, clientFacingNotes: value })
                              }
                              helper="Not shown on the PDF yet unless you paste scope above; safe for your records."
                            />
                          </AdminCard>

                          <AdminCard
                            title="Status & admin actions"
                            description="Pipeline status and manual payment flags (use when Stripe webhooks are not enough)."
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <SelectInput
                                label="Inquiry status"
                                value={eventOrderForm.status}
                                onChange={(value) =>
                                  setEventOrderForm({ ...eventOrderForm, status: value })
                                }
                                options={eventOrderStatusOptions}
                              />
                            </div>
                            <div className="mt-4 space-y-3 rounded-lg border border-ink/10 bg-cream/30 p-4">
                              <p className="text-xs font-medium uppercase tracking-widest text-ink/50">
                                Mark paid (manual)
                              </p>
                              <CheckboxInput
                                label="Deposit paid"
                                checked={eventOrderForm.depositPaidManual}
                                onChange={(checked) =>
                                  setEventOrderForm({ ...eventOrderForm, depositPaidManual: checked })
                                }
                              />
                              <CheckboxInput
                                label="Balance paid"
                                checked={eventOrderForm.balancePaidManual}
                                onChange={(checked) =>
                                  setEventOrderForm({ ...eventOrderForm, balancePaidManual: checked })
                                }
                              />
                              <CheckboxInput
                                label="Paid in full"
                                checked={eventOrderForm.paidInFullManual}
                                onChange={(checked) =>
                                  setEventOrderForm({ ...eventOrderForm, paidInFullManual: checked })
                                }
                              />
                            </div>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                              <button
                                type="submit"
                                disabled={
                                  !eventOrderForm.id ||
                                  busyId === (eventOrderForm.id ?? "/api/admin/event-orders")
                                }
                                className={`${btnPrimary()} lg:sticky lg:bottom-4 lg:z-10 lg:shadow-md`}
                              >
                                {busyId === (eventOrderForm.id ?? "/api/admin/event-orders")
                                  ? "Saving…"
                                  : "Save event order"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Discard unsaved changes and reset the form for this order?",
                                    )
                                  ) {
                                    openEventOrder(order);
                                    setEventOrderSectionSuccess(null);
                                    setEventOrderSectionError(null);
                                  }
                                }}
                                className={btnUtility()}
                              >
                                Reset form
                              </button>
                            </div>
                          </AdminCard>
                        </form>
                      ) : (
                        <p className="text-sm text-ink/55">
                          Select <strong>Expand</strong> on this order, then choose it to load the editor.
                        </p>
                      )}
                    </div>
                  ) : null}
                </AdminCard>
              );
            })}
          </div>
        ) : (
          <AdminEmptyState
            title="No event orders yet"
            description="When clients submit the on-location or photography inquiry form, orders appear here. You can then generate a PDF, payment links, or a Stripe invoice."
          />
        )}
      </AdminSection>

      </AdminSection>
      ) : section === "orders" ? (
      <AdminSection
        id="admin-orders"
        title="Orders"
        description="Site checkout (Stripe). Weddings and custom quotes are under Events."
      >
        <div className="space-y-3">
          {visibleSales.filter((r) => r.checkoutSessionId).length ? (
            visibleSales
              .filter((r) => r.checkoutSessionId)
              .slice(0, 50)
              .map((record) => (
                <article
                  key={record._id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-white p-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ink/40">Order</p>
                    <p className="mt-1 font-mono text-xs text-ink/70">{record.checkoutSessionId}</p>
                    <p className="mt-2 font-medium">{record.itemName}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      {record.customerName || record.customerEmail || "Customer"} · {record.saleDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-light">{formatUSD(record.amountCents)}</p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-moss">Paid</p>
                  </div>
                </article>
              ))
          ) : (
            <AdminEmptyState
              title="No checkout orders yet"
              description="Completed Stripe checkouts create records here via webhook."
            />
          )}
        </div>
      </AdminSection>
      ) : section === "payments" ? (
      <AdminSection
        id="admin-payments"
        title="Payments"
        description="Stripe visibility for events and walk-up records. Use Events for editing inquiries."
      >
        {paymentsSectionFeedback ? (
          <SectionFeedback
            kind={paymentsSectionFeedback.kind}
            message={paymentsSectionFeedback.message}
          />
        ) : null}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminCard title="Deposits paid" className="!p-4">
            <p className="font-display text-3xl font-light">{paymentSummary.depositPaid}</p>
          </AdminCard>
          <AdminCard title="Deposits due / linkable" className="!p-4">
            <p className="font-display text-3xl font-light">{paymentSummary.depositDue}</p>
          </AdminCard>
          <AdminCard title="Balances paid" className="!p-4">
            <p className="font-display text-3xl font-light">{paymentSummary.balancePaid}</p>
          </AdminCard>
          <AdminCard title="Balances due / linkable" className="!p-4">
            <p className="font-display text-3xl font-light">{paymentSummary.balanceDue}</p>
          </AdminCard>
        </div>

        <p className="mb-4 text-sm text-ink/60">
          Open an order in <Link href="/admin/events" className="underline">Events</Link> to copy deposit,
          balance, or invoice links.
        </p>

        <AdminCard title="Recent billing records" description="Cash, Venmo, manual card — owner only delete.">
          <div className="mt-4 space-y-3">
            {visibleSales.length ? (
              visibleSales.slice(0, 20).map((record) => (
                <article key={record._id} className="border border-ink/10 bg-cream/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{record.itemName}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {record.customerName || record.customerEmail || "Walk-up"} ·{" "}
                        {record.vendorName ?? "Ritualmaker"}
                      </p>
                    </div>
                    <p className="font-display text-2xl font-light">{formatUSD(record.amountCents)}</p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-widest text-ink/40">
                    {record.saleDate} · {record.paymentMethod}
                  </p>
                  {typeof record.ritualBundleDiscountCents === "number" &&
                  record.ritualBundleDiscountCents > 0 ? (
                    <p className="mt-2 text-sm text-moss">
                      Bundle discount applied · -{formatUSD(record.ritualBundleDiscountCents)}
                    </p>
                  ) : null}
                  {isOwner ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => void deleteSalesRecord(record._id)}
                        disabled={busyId === `delete-sale-${record._id}`}
                        className={btnDestructive()}
                      >
                        {busyId === `delete-sale-${record._id}` ? "Deleting…" : "Delete record"}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <AdminEmptyState title="No records" description="Nothing logged yet." />
            )}
          </div>
        </AdminCard>
      </AdminSection>
      ) : section === "media" ? (
      <AdminSection
        id="admin-media"
        title="Media library"
        description="Upload assets to Sanity, copy URLs, then attach on Products. This session only — refresh clears the list."
      >
        {mediaCopyFeedback ? <SectionFeedback kind="success" message={mediaCopyFeedback} /> : null}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={mediaUploading}
          onChange={(e) => {
            void uploadMediaLibraryFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full max-w-lg text-sm file:mr-3 file:border file:border-ink/20 file:bg-white file:px-3 file:py-2 file:text-xs file:uppercase"
        />
        {mediaUploading ? (
          <p className="mt-2 text-xs uppercase tracking-widest text-ink/45">Uploading…</p>
        ) : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mediaAssets.map((a) => (
            <div key={a.assetId} className="border border-ink/10 bg-white p-3">
              <div className="aspect-square overflow-hidden bg-stone/30">
                {a.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center text-[10px] uppercase text-ink/40">No preview</div>
                )}
              </div>
              <button
                type="button"
                className={`${btnSecondary()} mt-2 w-full text-[10px]`}
                onClick={() => {
                  const text = a.url || a.assetId;
                  void navigator.clipboard.writeText(text).then(() => {
                    setMediaCopyFeedback("Copied URL to clipboard.");
                    setTimeout(() => setMediaCopyFeedback(null), 2500);
                  });
                }}
              >
                Copy URL
              </button>
            </div>
          ))}
        </div>
      </AdminSection>
      ) : section === "settings" ? (
      <AdminSection
        id="admin-settings"
        title="Settings"
        description="Vendors, manual sale logging, and shop bundle copy."
      >
        <AdminCard title="Bundle discount (customer-facing)" className="mb-8">
          <p className="text-sm text-ink/70">{RITUAL_BUNDLE_CUSTOMER_NOTE}</p>
          <p className="mt-2 text-xs text-ink/50">
            Amount is fixed in code ($3 / pantry unit with bouquet in cart). Change requires a deploy.
          </p>
        </AdminCard>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={saveSalesRecord} className="border border-ink/10 bg-white p-4 sm:p-6">
            <p className="text-xs uppercase tracking-widest text-ink/40">Record walk-up sale</p>
            <h2 className="mt-2 font-display text-2xl font-light">Manual payment</h2>
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

          <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={adminLabelClass}>Vendors</p>
                <h3 className="mt-2 font-display text-2xl font-light text-ink">Stripe Connect</h3>
              </div>
              <button type="button" onClick={() => setVendorForm(emptyVendorForm)} className={btnUtility()}>
                New vendor
              </button>
            </div>
            <form onSubmit={saveVendor} className="mt-6 space-y-4 border-b border-ink/10 pb-6">
              <TextInput
                label="Vendor name"
                value={vendorForm.name}
                onChange={(value) => setVendorForm({ ...vendorForm, name: value })}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
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
                onChange={(value) => setVendorForm({ ...vendorForm, payoutMethodNotes: value })}
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
              <button type="submit" className={btnPrimary()}>
                Save vendor
              </button>
            </form>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {visibleVendors.map((vendor) => (
                <article key={vendor._id} className="rounded-lg border border-ink/10 bg-cream/50 p-4">
                  <p className="font-medium text-ink">{vendor.name}</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {vendor.contactName || vendor.contactEmail || "No contact saved"}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-ink/45">
                    {vendor.active === false ? "Inactive" : "Active"}
                    {vendor.stripeOnboardingComplete ? " · Stripe ready" : ""}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button type="button" onClick={() => editVendor(vendor)} className={btnSecondary()}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openConnectLink(vendor._id)}
                      disabled={busyId === vendor._id || !vendor.contactEmail}
                      className={btnPrimary()}
                      title={vendor.contactEmail ? undefined : "Add vendor email before Stripe setup"}
                    >
                      Stripe setup
                    </button>
                    <button
                      type="button"
                      onClick={() => openDashboard(vendor._id)}
                      disabled={busyId === vendor._id || !vendor.stripeAccountId}
                      className={btnSecondary()}
                    >
                      Open Stripe dashboard
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <AdminCard
          title="Product presets"
          description="Load starter SKUs on the Products page (Glimmer, Blessing, Abundance, pantry)."
          className="mt-8"
        >
          <Link href="/admin/products" className="text-sm text-ink underline">
            Go to Products →
          </Link>
        </AdminCard>
      </AdminSection>
      ) : null}
    </>
  );
}

function RequiredMark() {
  return (
    <abbr title="Required" className="ml-0.5 text-magenta no-underline">
      *
    </abbr>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className={adminLabelClass}>{label}</span>
      <p className="mt-1.5 rounded-md border border-ink/10 bg-cream/40 px-3 py-2.5 text-sm text-ink/80">
        {value}
      </p>
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
  error,
  disabled,
  min,
  step,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  min?: number;
  step?: string;
}) {
  return (
    <label className="block">
      <span className={adminLabelClass}>{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`${adminInputClass} ${error ? "border-magenta/40 ring-1 ring-magenta/20" : ""} ${disabled ? "cursor-not-allowed bg-ink/5 opacity-70" : ""}`}
      />
      {helper ? <span className={adminHelperClass}>{helper}</span> : null}
      {error ? <span className="mt-1.5 block text-xs text-magenta">{error}</span> : null}
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
    <label className="block">
      <span className={adminLabelClass}>{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={`${adminInputClass} min-h-[120px] resize-y py-3`}
      />
      {helper ? <span className={adminHelperClass}>{helper}</span> : null}
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={adminLabelClass}>
        {label}
        {required ? <RequiredMark /> : null}
      </span>
      <select
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={`${adminInputClass} bg-white`}
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
