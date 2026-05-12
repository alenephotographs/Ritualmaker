import "server-only";

import { randomBytes } from "node:crypto";

import {
  applyClientDocumentPatch,
  parseClientDocumentPatchBody,
} from "@/lib/clientDocumentPayload";
import {
  computePaymentLinksStale,
} from "@/lib/clientDocumentPaymentState";
import {
  floralJsonToText,
  floralTextToJson,
  formatUsdFromCents,
} from "@/lib/clientDocumentMoney";
import { deriveProposalLifecycle } from "@/lib/proposalLifecycleLogic";
import { getServiceSupabase } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe";
import type {
  ClientDocumentPayload,
  ClientDocumentRecord,
  ClientDocumentStatus,
  ClientDocumentType,
  FloralScopeLine,
} from "@/lib/types/clientDocument";
import { parseProposalLifecycleStatus } from "@/lib/types/proposalLifecycle";
import type {
  Bouquet,
  FAQ,
  InventoryAudit,
  InventoryAuditHistoryEntry,
  PantryItem,
  SiteSettings,
  Vendor,
} from "@/lib/types/content";

type VendorRow = {
  id: string;
  name: string;
  slug: string;
  contact_name: string | null;
  contact_email: string | null;
  access_code: string | null;
  active: boolean | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean | null;
  stripe_details_submitted: boolean | null;
  stripe_charges_enabled: boolean | null;
  stripe_payouts_enabled: boolean | null;
  stripe_requirements_currently_due: string[] | null;
  stripe_requirements_past_due: string[] | null;
  stripe_requirements_disabled_reason: string | null;
  stripe_compliance_last_synced_at: string | null;
};

function mapVendor(r: VendorRow): Vendor {
  return {
    _id: r.id,
    name: r.name,
    slug: r.slug,
    contactName: r.contact_name ?? undefined,
    contactEmail: r.contact_email ?? undefined,
    accessCode: r.access_code ?? undefined,
    active: r.active ?? undefined,
    stripeAccountId: r.stripe_account_id ?? undefined,
    stripeOnboardingComplete: r.stripe_onboarding_complete ?? undefined,
    stripeDetailsSubmitted: r.stripe_details_submitted ?? undefined,
    stripeChargesEnabled: r.stripe_charges_enabled ?? undefined,
    stripePayoutsEnabled: r.stripe_payouts_enabled ?? undefined,
    stripeRequirementsCurrentlyDue: r.stripe_requirements_currently_due ?? undefined,
    stripeRequirementsPastDue: r.stripe_requirements_past_due ?? undefined,
    stripeRequirementsDisabledReason: r.stripe_requirements_disabled_reason ?? undefined,
    stripeComplianceLastSyncedAt: r.stripe_compliance_last_synced_at ?? undefined,
  };
}

type BouquetRow = {
  id: string;
  name: string;
  slug: string;
  farm: string;
  size: string;
  price_cents: number;
  shelf_location: string | null;
  description: string | null;
  highlights: string[] | null;
  image_url: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  available: boolean;
  inventory_audit: Record<string, unknown> | null;
  inventory_audit_history: unknown;
  vendor_id: string | null;
};

function asAudit(
  a: Record<string, unknown> | null,
): InventoryAudit | undefined {
  if (!a) return undefined;
  return {
    lastEditedAt: (a.lastEditedAt as string) || (a.last_edited_at as string),
    lastEditedByEmail: (a.lastEditedByEmail as string) || (a.last_edited_by_email as string),
    lastEditedByRole: (a.lastEditedByRole as string) || (a.last_edited_by_role as string),
    lastEditedByVendorId: (a.lastEditedByVendorId as string) || (a.last_edited_by_vendor_id as string),
  };
}

function asHistory(
  h: unknown,
): InventoryAuditHistoryEntry[] | undefined {
  if (!Array.isArray(h)) return undefined;
  return h.map((e) => {
    const o = e as Record<string, unknown>;
    return {
      _key: o._key as string | undefined,
      editedAt: (o.editedAt || o.edited_at) as string,
      editedByEmail: (o.editedByEmail || o.edited_by_email) as string,
      editedByRole: (o.editedByRole || o.edited_by_role) as string,
      editedByVendorId: (o.editedByVendorId || o.edited_by_vendor_id) as string,
      changeSummary: (o.changeSummary || o.change_summary) as string,
    };
  });
}

function mapBouquet(
  r: BouquetRow,
  v?: Pick<Vendor, "name" | "stripeAccountId" | "_id">,
): Bouquet {
  return {
    _id: r.id,
    name: r.name,
    slug: r.slug,
    farm: r.farm as Bouquet["farm"],
    size: r.size as Bouquet["size"],
    priceCents: r.price_cents,
    shelfLocation: r.shelf_location ?? undefined,
    description: r.description ?? undefined,
    highlights: r.highlights ?? undefined,
    available: r.available,
    imageUrl: r.image_url ?? undefined,
    stripeProductId: r.stripe_product_id ?? undefined,
    stripePriceId: r.stripe_price_id ?? undefined,
    vendorId: v?._id ?? r.vendor_id ?? undefined,
    vendorName: v?.name,
    vendorStripeAccountId: v?.stripeAccountId,
    inventoryAudit: asAudit(r.inventory_audit as Record<string, unknown> | null),
    inventoryAuditHistory: asHistory(r.inventory_audit_history),
  };
}

type PantryRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price_cents: number | null;
  shelf_location: string | null;
  image_url: string | null;
  coming_soon: boolean;
  available: boolean;
  ships_available: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  inventory_audit: Record<string, unknown> | null;
  inventory_audit_history: unknown;
  vendor_id: string | null;
};

function mapPantry(
  r: PantryRow,
  v?: Pick<Vendor, "name" | "stripeAccountId" | "_id">,
): PantryItem {
  return {
    _id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category as PantryItem["category"],
    description: r.description ?? undefined,
    priceCents: r.price_cents ?? undefined,
    shelfLocation: r.shelf_location ?? undefined,
    imageUrl: r.image_url ?? undefined,
    comingSoon: r.coming_soon,
    available: r.available,
    shipsAvailable: r.ships_available,
    stripeProductId: r.stripe_product_id ?? undefined,
    stripePriceId: r.stripe_price_id ?? undefined,
    vendorId: v?._id ?? r.vendor_id ?? undefined,
    vendorName: v?.name,
    vendorStripeAccountId: v?.stripeAccountId,
    inventoryAudit: asAudit(r.inventory_audit as Record<string, unknown> | null),
    inventoryAuditHistory: asHistory(r.inventory_audit_history),
  };
}

type SiteRow = {
  id: number;
  title: string;
  tagline: string;
  description: string | null;
  stand_status: string;
  stand_message: string | null;
  address: string | null;
  map_url: string | null;
  instagram_url: string | null;
  instagram_handle: string | null;
  email: string | null;
  google_review_url: string | null;
  google_profile_url: string | null;
  hero_image_url: string | null;
};

function mapSite(
  s: SiteRow,
  resolvedHero: string | null,
): SiteSettings {
  return {
    title: s.title,
    tagline: s.tagline,
    description: s.description ?? undefined,
    standStatus: s.stand_status as SiteSettings["standStatus"],
    standMessage: s.stand_message ?? undefined,
    address: s.address ?? undefined,
    mapUrl: s.map_url ?? undefined,
    instagramUrl: s.instagram_url ?? undefined,
    instagramHandle: s.instagram_handle ?? undefined,
    email: s.email ?? undefined,
    googleReviewUrl: s.google_review_url ?? undefined,
    googleProfileUrl: s.google_profile_url ?? undefined,
    heroImageUrlResolved: resolvedHero ?? s.hero_image_url ?? undefined,
  };
}

const vendorSelect = `
  id, name, slug, contact_name, contact_email, access_code, active,
  stripe_account_id, stripe_onboarding_complete, stripe_details_submitted,
  stripe_charges_enabled, stripe_payouts_enabled,
  stripe_requirements_currently_due, stripe_requirements_past_due,
  stripe_requirements_disabled_reason, stripe_compliance_last_synced_at
`;

const bouquetColumns = [
  "id", "name", "slug", "farm", "vendor_id", "size", "price_cents", "shelf_location",
  "description", "highlights", "image_url", "stripe_product_id", "stripe_price_id", "available",
  "inventory_audit", "inventory_audit_history", "display_order", "created_at",
].join(", ");

const pantryColumns = [
  "id", "name", "slug", "category", "vendor_id", "description", "price_cents", "shelf_location",
  "image_url", "coming_soon", "available", "ships_available", "stripe_product_id", "stripe_price_id",
  "inventory_audit", "inventory_audit_history", "display_order", "created_at",
].join(", ");

function vendorMapForBouquet(v: Vendor) {
  return {
    _id: v._id,
    name: v.name,
    stripeAccountId: v.stripeAccountId,
  };
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = getServiceSupabase();
  const { data: s, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !s) return null;
  const row = s as unknown as SiteRow;
  const { data: tulip } = await supabase
    .from("archive_photos")
    .select("image_url, external_url, caption, alt")
    .or("caption.ilike.%Tulip%,caption.ilike.%tulip%,alt.ilike.%Tulip%,alt.ilike.%tulip%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const fromArchive =
    (tulip?.image_url as string | null) || (tulip?.external_url as string | null) || null;
  const resolved =
    row.hero_image_url && row.hero_image_url.length > 0
      ? row.hero_image_url
      : fromArchive;
  return mapSite(row, resolved);
}

async function loadVendorsById(ids: (string | null)[]) {
  const clean = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (!clean.length) return new Map<string, Vendor>();
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("vendors")
    .select(vendorSelect)
    .in("id", clean);
  const map = new Map<string, Vendor>();
  for (const r of (data as unknown as VendorRow[] | null) ?? []) {
    map.set(r.id, mapVendor(r));
  }
  return map;
}

export async function getBouquets(): Promise<Bouquet[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("bouquets")
    .select(bouquetColumns)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  const rows = data as unknown as BouquetRow[];
  const vmap = await loadVendorsById(rows.map((r) => r.vendor_id));
  return rows.map((r) => {
    const v = r.vendor_id ? vmap.get(r.vendor_id) : undefined;
    return mapBouquet(r, v ? vendorMapForBouquet(v) : undefined);
  });
}

export async function getBouquetById(
  id: string,
): Promise<Bouquet | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("bouquets")
    .select(bouquetColumns)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const r = data as unknown as BouquetRow;
  const vmap = await loadVendorsById([r.vendor_id]);
  const v = r.vendor_id ? vmap.get(r.vendor_id) : undefined;
  return mapBouquet(r, v ? vendorMapForBouquet(v) : undefined);
}

export async function getPantryItems(): Promise<PantryItem[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("pantry_items")
    .select(pantryColumns)
    .order("coming_soon", { ascending: true })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  const rows = data as unknown as PantryRow[];
  const vmap = await loadVendorsById(rows.map((r) => r.vendor_id));
  return rows.map((r) => {
    const v = r.vendor_id ? vmap.get(r.vendor_id) : undefined;
    return mapPantry(r, v ? vendorMapForBouquet(v) : undefined);
  });
}

export async function getPantryItemById(
  id: string,
): Promise<PantryItem | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("pantry_items")
    .select(pantryColumns)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const r = data as unknown as PantryRow;
  const vmap = await loadVendorsById([r.vendor_id]);
  const v = r.vendor_id ? vmap.get(r.vendor_id) : undefined;
  return mapPantry(r, v ? vendorMapForBouquet(v) : undefined);
}

export async function getVendors(): Promise<Vendor[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .select(vendorSelect)
    .order("name", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as VendorRow[]).map(mapVendor);
}

export async function getVendorByIdForConnect(id: string): Promise<{
  _id: string;
  name: string;
  contactEmail?: string;
  stripeAccountId?: string;
} | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .select("id, name, contact_email, stripe_account_id")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const r = data as {
    id: string;
    name: string;
    contact_email: string | null;
    stripe_account_id: string | null;
  };
  return {
    _id: r.id,
    name: r.name,
    contactEmail: r.contact_email ?? undefined,
    stripeAccountId: r.stripe_account_id ?? undefined,
  };
}

export async function setVendorStripeAccountId(
  vendorId: string,
  stripeAccountId: string,
) {
  const supabase = getServiceSupabase();
  await supabase
    .from("vendors")
    .update({ stripe_account_id: stripeAccountId })
    .eq("id", vendorId);
}

export async function getFaqs(): Promise<FAQ[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, display_order")
    .order("display_order", { ascending: true });
  if (error || !data) return [];
  return data.map(
    (r: { id: string; question: string; answer: string }) => ({
      _id: r.id,
      question: r.question,
      answer: r.answer,
    }),
  );
}

export async function getVendorForSignIn(
  email: string,
  accessCode: string,
): Promise<Pick<Vendor, "_id" | "contactEmail"> | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .select("id, contact_email")
    .eq("active", true)
    .ilike("contact_email", email)
    .eq("access_code", accessCode)
    .maybeSingle();
  if (error || !data) return null;
  return { _id: data.id, contactEmail: data.contact_email };
}

export type WeddingInquiryInsert = {
  formType: "on-location" | "photography";
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  venue?: string;
  guestCount?: number;
  budgetBand?: string;
  notes?: string;
  services: string[];
  photoInquiryKind?: string;
};

export async function insertWeddingInquiry(
  p: WeddingInquiryInsert,
): Promise<string | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("wedding_inquiries")
    .insert({
      form_type: p.formType,
      name: p.name,
      email: p.email,
      phone: p.phone ?? null,
      event_date: p.eventDate ?? null,
      venue: p.venue ?? null,
      guest_count: p.guestCount ?? null,
      budget_band: p.budgetBand ?? null,
      notes: p.notes ?? null,
      services: p.services,
      photo_inquiry_kind: p.photoInquiryKind ?? null,
      status: "new",
    })
    .select("id")
    .maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export type UxEventInsert = {
  eventType: "cta_view" | "cta_click" | "checkout_completed";
  experiment?: string;
  variant?: string;
  itemType?: string;
  itemId?: string;
  checkoutSessionId?: string;
  amountTotal?: number;
  path?: string;
  userAgent?: string;
};

export async function insertUxEvent(p: UxEventInsert) {
  const supabase = getServiceSupabase();
  await supabase.from("ux_events").insert({
    event_type: p.eventType,
    experiment: p.experiment,
    variant: p.variant,
    item_type: p.itemType,
    item_id: p.itemId,
    checkout_session_id: p.checkoutSessionId,
    amount_total: p.amountTotal,
    path: p.path,
    user_agent: p.userAgent,
    event_at: new Date().toISOString(),
  });
}

export async function updateVendorFromStripeAccount(
  stripeAccountId: string,
  fields: {
    stripeOnboardingComplete: boolean;
    stripeDetailsSubmitted: boolean;
    stripeChargesEnabled: boolean;
    stripePayoutsEnabled: boolean;
    stripeRequirementsCurrentlyDue: string[];
    stripeRequirementsPastDue: string[];
    stripeRequirementsDisabledReason: string;
  },
) {
  const supabase = getServiceSupabase();
  const { data: row, error: findError } = await supabase
    .from("vendors")
    .select("id")
    .eq("stripe_account_id", stripeAccountId)
    .maybeSingle();
  if (findError || !row) return false;
  const { error } = await supabase
    .from("vendors")
    .update({
      stripe_onboarding_complete: fields.stripeOnboardingComplete,
      stripe_details_submitted: fields.stripeDetailsSubmitted,
      stripe_charges_enabled: fields.stripeChargesEnabled,
      stripe_payouts_enabled: fields.stripePayoutsEnabled,
      stripe_requirements_currently_due: fields.stripeRequirementsCurrentlyDue,
      stripe_requirements_past_due: fields.stripeRequirementsPastDue,
      stripe_requirements_disabled_reason: fields.stripeRequirementsDisabledReason,
      stripe_compliance_last_synced_at: new Date().toISOString(),
    })
    .eq("id", (row as { id: string }).id);
  return !error;
}

type AdminUpdateInput = {
  kind: "bouquet" | "pantryItem";
  id: string;
  available?: boolean;
  comingSoon?: boolean;
  vendorId?: string;
  userEmail: string;
  isOwner: boolean;
  userVendorId?: string;
};

export async function updateProductForAdmin(
  input: AdminUpdateInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getServiceSupabase();
  const table = input.kind === "bouquet" ? "bouquets" : "pantry_items";
  const { data: row, error: fetchError } = await supabase
    .from(table)
    .select("id, vendor_id, inventory_audit_history")
    .eq("id", input.id)
    .maybeSingle();
  if (fetchError || !row) {
    return { ok: false, message: "Product not found" };
  }
  const vendorId = (row as { vendor_id: string | null }).vendor_id;
  if (!input.isOwner) {
    if (!input.userVendorId || vendorId !== input.userVendorId) {
      return { ok: false, message: "Forbidden" };
    }
  }
  const now = new Date().toISOString();
  const changeParts: string[] = [];
  if (typeof input.available === "boolean") {
    changeParts.push(`available=${input.available ? "true" : "false"}`);
  }
  if (typeof input.comingSoon === "boolean" && input.kind === "pantryItem") {
    changeParts.push(`comingSoon=${input.comingSoon ? "true" : "false"}`);
  }
  if (input.vendorId && input.isOwner) {
    const { data: v } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", input.vendorId)
      .maybeSingle();
    if (!(v as { id: string } | null)?.id) {
      return { ok: false, message: "Invalid vendor" };
    }
    changeParts.push(`vendorReassigned=${input.vendorId}`);
  }
  if (!changeParts.length) {
    return { ok: false, message: "No updatable fields provided" };
  }

  const historyEntry: InventoryAuditHistoryEntry = {
    _key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    editedAt: now,
    editedByEmail: input.userEmail,
    editedByRole: input.isOwner ? "owner" : "vendor",
    editedByVendorId: input.userVendorId ?? "",
    changeSummary: changeParts.join(", "),
  };
  const rawHist = (row as { inventory_audit_history: unknown })
    .inventory_audit_history;
  const previous = Array.isArray(rawHist) ? (rawHist as object[]) : [];
  const nextHistory = [historyEntry, ...previous].slice(0, 10) as object[];

  const updatePayload: Record<string, unknown> = {
    inventory_audit: {
      lastEditedAt: now,
      lastEditedByEmail: input.userEmail,
      lastEditedByRole: input.isOwner ? "owner" : "vendor",
      lastEditedByVendorId: input.userVendorId ?? "",
    },
    inventory_audit_history: nextHistory,
  };
  if (typeof input.available === "boolean") {
    updatePayload.available = input.available;
  }
  if (typeof input.comingSoon === "boolean" && input.kind === "pantryItem") {
    updatePayload.coming_soon = input.comingSoon;
  }
  if (input.vendorId && input.isOwner) {
    updatePayload.vendor_id = input.vendorId;
  }

  const { error } = await supabase
    .from(table)
    .update(updatePayload)
    .eq("id", input.id);
  if (error) {
    return { ok: false, message: "Could not update product" };
  }
  return { ok: true };
}

type ClientDocumentRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  event_type: string | null;
  event_date: string | null;
  location: string | null;
  status: string | null;
  payment_deposit_paid: boolean | null;
  payment_balance_paid: boolean | null;
  proposal_total_cents: number | null;
  deposit_amount_cents: number | null;
  balance_amount_cents: number | null;
  payment_due_date: string | null;
  internal_notes: string | null;
  raw_inquiry_json: unknown;
  intake_notes: string | null;
  floral_scope_text: string | null;
  package_title: string;
  package_subtitle: string | null;
  floral_scope: unknown;
  total_line: string;
  bridesmaid_ribbon_names: string | null;
  notes: string | null;
  day_of: string | null;
  deposit_line: string | null;
  deposit_link: string | null;
  balance_line: string | null;
  balance_link: string | null;
  document_type: ClientDocumentType;
  stripe_payment_link_deposit_id: string | null;
  stripe_payment_link_balance_id: string | null;
  last_payment_snapshot_total: number | null;
  last_payment_snapshot_deposit: number | null;
  last_payment_snapshot_balance: number | null;
  last_payment_snapshot_balance_due_date: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
  stripe_invoice_pdf_url: string | null;
  stripe_invoice_status: string | null;
  stripe_invoice_amount_cents: number | null;
  payment_links_stale: boolean | null;
  proposal_pdf_generated_at: string | null;
  proposal_public_token: string | null;
  proposal_link_disabled: boolean | null;
  proposal_lifecycle_status: string | null;
  proposal_first_viewed_at: string | null;
  proposal_last_viewed_at: string | null;
  proposal_view_count: number | null;
  proposal_approved_at: string | null;
  proposal_approved_name: string | null;
  proposal_approved_ip: string | null;
  deposit_paid_at: string | null;
  balance_paid_at: string | null;
  created_at: string;
  updated_at: string;
};

function parseFloralScope(raw: unknown): FloralScopeLine[] {
  if (!Array.isArray(raw)) return [];
  const out: FloralScopeLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const primary = typeof o.primary === "string" ? o.primary.trim() : "";
    if (!primary) continue;
    const detail =
      typeof o.detail === "string" && o.detail.trim() ? o.detail.trim() : undefined;
    out.push(detail ? { primary, detail } : { primary });
  }
  return out;
}

const STATUS_SET = new Set<string>([
  "lead",
  "proposal_sent",
  "booked",
  "complete",
  "declined",
]);

function mapStatus(s: string | null | undefined): ClientDocumentStatus {
  if (s && STATUS_SET.has(s)) {
    return s as ClientDocumentStatus;
  }
  return "lead";
}

function parseRawInquiry(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function resolveFloralForDb(input: ClientDocumentPayload): FloralScopeLine[] {
  if (input.floralScopeText?.trim()) {
    return floralTextToJson(input.floralScopeText);
  }
  return input.floralScope;
}

function resolveTotalLineForDb(input: ClientDocumentPayload): string {
  const manual = input.totalLine?.trim();
  if (manual) return manual;
  if (input.proposalTotalCents != null && input.proposalTotalCents > 0) {
    return `Total — ${formatUsdFromCents(input.proposalTotalCents)}`;
  }
  return "";
}

function resolveDepositLineForDb(
  input: ClientDocumentPayload,
): string | null {
  const manual = input.depositLine?.trim();
  if (manual) return manual;
  if (input.depositAmountCents != null && input.depositAmountCents > 0) {
    return `Deposit — ${formatUsdFromCents(input.depositAmountCents)}`;
  }
  return null;
}

function resolveBalanceLineForDb(
  input: ClientDocumentPayload,
): string | null {
  const manual = input.balanceLine?.trim();
  if (manual) return manual;
  const t = input.proposalTotalCents;
  const d = input.depositAmountCents;
  if (t != null && d != null && t > d) {
    return `Remaining balance — ${formatUsdFromCents(t - d)}`;
  }
  return null;
}

async function syncProposalLifecycleStatusForRecordId(
  id: string,
  doc: ClientDocumentRecord,
): Promise<void> {
  const next = deriveProposalLifecycle(doc);
  if (next === doc.proposalLifecycleStatus) return;
  const supabase = getServiceSupabase();
  await supabase
    .from("client_documents")
    .update({
      proposal_lifecycle_status: next,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

function mapClientDocument(r: ClientDocumentRow): ClientDocumentRecord {
  const floral = parseFloralScope(r.floral_scope);
  const storedText = r.floral_scope_text?.trim();
  const floralScopeText =
    storedText && storedText.length > 0
      ? storedText
      : floral.length
        ? floralJsonToText(floral)
        : undefined;
  const paymentLinksStale = computePaymentLinksStale({
    stripePaymentLinkDepositId: r.stripe_payment_link_deposit_id ?? undefined,
    lastPaymentSnapshotTotal: r.last_payment_snapshot_total,
    lastPaymentSnapshotDeposit: r.last_payment_snapshot_deposit,
    lastPaymentSnapshotBalance: r.last_payment_snapshot_balance,
    lastPaymentSnapshotBalanceDueDate:
      r.last_payment_snapshot_balance_due_date,
    proposalTotalCents: r.proposal_total_cents,
    depositAmountCents: r.deposit_amount_cents,
    paymentDueDate: r.payment_due_date ?? undefined,
  });
  return {
    id: r.id,
    clientName: r.client_name ?? undefined,
    clientEmail: r.client_email ?? undefined,
    clientPhone: r.client_phone ?? undefined,
    eventType: r.event_type ?? undefined,
    eventDate: r.event_date ?? undefined,
    location: r.location ?? undefined,
    status: mapStatus(r.status),
    paymentDepositPaid: r.payment_deposit_paid ?? false,
    paymentBalancePaid: r.payment_balance_paid ?? false,
    proposalTotalCents: r.proposal_total_cents,
    depositAmountCents: r.deposit_amount_cents,
    balanceAmountCents: r.balance_amount_cents ?? undefined,
    paymentDueDate: r.payment_due_date ?? undefined,
    internalNotes: r.internal_notes ?? undefined,
    rawInquiryJson: parseRawInquiry(r.raw_inquiry_json),
    intakeNotes: r.intake_notes ?? undefined,
    floralScopeText,
    packageTitle: r.package_title,
    packageSubtitle: r.package_subtitle ?? undefined,
    floralScope: floral,
    totalLine: r.total_line,
    bridesmaidRibbonNames: r.bridesmaid_ribbon_names ?? undefined,
    notes: r.notes ?? undefined,
    dayOf: r.day_of ?? undefined,
    depositLine: r.deposit_line ?? undefined,
    depositLink: r.deposit_link ?? undefined,
    balanceLine: r.balance_line ?? undefined,
    balanceLink: r.balance_link ?? undefined,
    stripePaymentLinkDepositId: r.stripe_payment_link_deposit_id ?? undefined,
    stripePaymentLinkBalanceId: r.stripe_payment_link_balance_id ?? undefined,
    lastPaymentSnapshotTotal: r.last_payment_snapshot_total,
    lastPaymentSnapshotDeposit: r.last_payment_snapshot_deposit,
    lastPaymentSnapshotBalance: r.last_payment_snapshot_balance,
    lastPaymentSnapshotBalanceDueDate:
      r.last_payment_snapshot_balance_due_date,
    stripeInvoiceId: r.stripe_invoice_id ?? undefined,
    stripeInvoiceUrl: r.stripe_invoice_url ?? undefined,
    stripeInvoicePdfUrl: r.stripe_invoice_pdf_url ?? undefined,
    stripeInvoiceStatus: r.stripe_invoice_status ?? undefined,
    stripeInvoiceAmountCents: r.stripe_invoice_amount_cents,
    paymentLinksStale,
    proposalPdfGeneratedAt: r.proposal_pdf_generated_at ?? undefined,
    proposalPublicToken: r.proposal_public_token ?? undefined,
    proposalLinkDisabled: r.proposal_link_disabled ?? false,
    proposalLifecycleStatus: parseProposalLifecycleStatus(
      r.proposal_lifecycle_status,
    ),
    proposalFirstViewedAt: r.proposal_first_viewed_at ?? undefined,
    proposalLastViewedAt: r.proposal_last_viewed_at ?? undefined,
    proposalViewCount: r.proposal_view_count ?? 0,
    proposalApprovedAt: r.proposal_approved_at ?? undefined,
    proposalApprovedName: r.proposal_approved_name ?? undefined,
    proposalApprovedIp: r.proposal_approved_ip ?? undefined,
    depositPaidAt: r.deposit_paid_at ?? undefined,
    balancePaidAt: r.balance_paid_at ?? undefined,
    documentType: r.document_type,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listClientDocuments(): Promise<ClientDocumentRecord[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("client_documents")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[client_documents] list failed", error.message ?? error);
    return [];
  }
  if (!data) return [];
  return (data as unknown as ClientDocumentRow[]).map(mapClientDocument);
}

export async function getClientDocumentById(
  id: string,
): Promise<ClientDocumentRecord | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("client_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapClientDocument(data as unknown as ClientDocumentRow);
}

function mergeStripePaymentLinkIds(
  input: ClientDocumentPayload,
  existing: ClientDocumentRecord,
): ClientDocumentPayload {
  return {
    ...input,
    stripePaymentLinkDepositId:
      input.stripePaymentLinkDepositId ?? existing.stripePaymentLinkDepositId,
    stripePaymentLinkBalanceId:
      input.stripePaymentLinkBalanceId ?? existing.stripePaymentLinkBalanceId,
  };
}

async function persistClientDocument(
  id: string,
  merged: ClientDocumentPayload,
  existing: ClientDocumentRecord,
): Promise<ClientDocumentRecord | null> {
  const balanceAmount =
    merged.proposalTotalCents != null && merged.depositAmountCents != null
      ? Math.max(0, merged.proposalTotalCents - merged.depositAmountCents)
      : null;
  const depositPlId =
    merged.stripePaymentLinkDepositId ??
    existing.stripePaymentLinkDepositId ??
    null;
  const paymentLinksStale = computePaymentLinksStale({
    stripePaymentLinkDepositId: depositPlId ?? undefined,
    lastPaymentSnapshotTotal: existing.lastPaymentSnapshotTotal ?? null,
    lastPaymentSnapshotDeposit: existing.lastPaymentSnapshotDeposit ?? null,
    lastPaymentSnapshotBalance: existing.lastPaymentSnapshotBalance ?? null,
    lastPaymentSnapshotBalanceDueDate:
      existing.lastPaymentSnapshotBalanceDueDate ?? null,
    proposalTotalCents: merged.proposalTotalCents,
    depositAmountCents: merged.depositAmountCents,
    paymentDueDate: merged.paymentDueDate,
  });
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      client_name: merged.clientName ?? null,
      client_email: merged.clientEmail ?? null,
      client_phone: merged.clientPhone ?? null,
      event_type: merged.eventType ?? null,
      event_date: merged.eventDate ?? null,
      location: merged.location ?? null,
      status:
        merged.status && STATUS_SET.has(merged.status) ? merged.status : "lead",
      payment_deposit_paid: merged.paymentDepositPaid ?? false,
      payment_balance_paid: merged.paymentBalancePaid ?? false,
      proposal_total_cents: merged.proposalTotalCents ?? null,
      deposit_amount_cents: merged.depositAmountCents ?? null,
      balance_amount_cents: balanceAmount,
      payment_due_date: merged.paymentDueDate ?? null,
      internal_notes: merged.internalNotes?.trim() || null,
      raw_inquiry_json: merged.rawInquiryJson ?? {},
      intake_notes: merged.intakeNotes ?? null,
      floral_scope_text: merged.floralScopeText ?? null,
      package_title: merged.packageTitle,
      package_subtitle: merged.packageSubtitle ?? null,
      floral_scope: resolveFloralForDb(merged),
      total_line: resolveTotalLineForDb(merged),
      bridesmaid_ribbon_names: merged.bridesmaidRibbonNames ?? null,
      notes: merged.notes ?? null,
      day_of: merged.dayOf ?? null,
      deposit_line: resolveDepositLineForDb(merged),
      deposit_link: merged.depositLink ?? null,
      balance_line: resolveBalanceLineForDb(merged),
      balance_link: merged.balanceLink ?? null,
      stripe_payment_link_deposit_id:
        merged.stripePaymentLinkDepositId ?? null,
      stripe_payment_link_balance_id:
        merged.stripePaymentLinkBalanceId ?? null,
      document_type: merged.documentType,
      stripe_invoice_id: existing.stripeInvoiceId ?? null,
      stripe_invoice_url: existing.stripeInvoiceUrl ?? null,
      stripe_invoice_pdf_url: existing.stripeInvoicePdfUrl ?? null,
      stripe_invoice_status: existing.stripeInvoiceStatus ?? null,
      stripe_invoice_amount_cents: existing.stripeInvoiceAmountCents ?? null,
      last_payment_snapshot_total: existing.lastPaymentSnapshotTotal ?? null,
      last_payment_snapshot_deposit: existing.lastPaymentSnapshotDeposit ?? null,
      last_payment_snapshot_balance: existing.lastPaymentSnapshotBalance ?? null,
      last_payment_snapshot_balance_due_date:
        existing.lastPaymentSnapshotBalanceDueDate ?? null,
      proposal_pdf_generated_at: existing.proposalPdfGeneratedAt ?? null,
      proposal_public_token: existing.proposalPublicToken ?? null,
      proposal_link_disabled: existing.proposalLinkDisabled ?? false,
      proposal_lifecycle_status: existing.proposalLifecycleStatus,
      proposal_first_viewed_at: existing.proposalFirstViewedAt ?? null,
      proposal_last_viewed_at: existing.proposalLastViewedAt ?? null,
      proposal_view_count: existing.proposalViewCount ?? 0,
      proposal_approved_at: existing.proposalApprovedAt ?? null,
      proposal_approved_name: existing.proposalApprovedName ?? null,
      proposal_approved_ip: existing.proposalApprovedIp ?? null,
      payment_links_stale: paymentLinksStale,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  const mapped = mapClientDocument(data as unknown as ClientDocumentRow);
  await syncProposalLifecycleStatusForRecordId(id, mapped);
  return (await getClientDocumentById(id)) ?? mapped;
}

export async function insertClientDocument(
  input: ClientDocumentPayload,
): Promise<ClientDocumentRecord | null> {
  const supabase = getServiceSupabase();
  const balanceAmount =
    input.proposalTotalCents != null && input.depositAmountCents != null
      ? Math.max(0, input.proposalTotalCents - input.depositAmountCents)
      : null;
  const { data, error } = await supabase
    .from("client_documents")
    .insert({
      client_name: input.clientName ?? null,
      client_email: input.clientEmail ?? null,
      client_phone: input.clientPhone ?? null,
      event_type: input.eventType ?? null,
      event_date: input.eventDate ?? null,
      location: input.location ?? null,
      status: input.status && STATUS_SET.has(input.status) ? input.status : "lead",
      payment_deposit_paid: input.paymentDepositPaid ?? false,
      payment_balance_paid: input.paymentBalancePaid ?? false,
      proposal_total_cents: input.proposalTotalCents ?? null,
      deposit_amount_cents: input.depositAmountCents ?? null,
      balance_amount_cents: balanceAmount,
      payment_due_date: input.paymentDueDate ?? null,
      internal_notes: input.internalNotes ?? null,
      raw_inquiry_json: input.rawInquiryJson ?? {},
      intake_notes: input.intakeNotes ?? null,
      floral_scope_text: input.floralScopeText ?? null,
      package_title: input.packageTitle,
      package_subtitle: input.packageSubtitle ?? null,
      floral_scope: resolveFloralForDb(input),
      total_line: resolveTotalLineForDb(input),
      bridesmaid_ribbon_names: input.bridesmaidRibbonNames ?? null,
      notes: input.notes ?? null,
      day_of: input.dayOf ?? null,
      deposit_line: resolveDepositLineForDb(input),
      deposit_link: input.depositLink ?? null,
      balance_line: resolveBalanceLineForDb(input),
      balance_link: input.balanceLink ?? null,
      stripe_payment_link_deposit_id: input.stripePaymentLinkDepositId ?? null,
      stripe_payment_link_balance_id: input.stripePaymentLinkBalanceId ?? null,
      payment_links_stale: false,
      proposal_link_disabled: false,
      proposal_lifecycle_status: "draft",
      proposal_view_count: 0,
      document_type: input.documentType,
    })
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return mapClientDocument(data as unknown as ClientDocumentRow);
}

export async function updateClientDocument(
  id: string,
  input: ClientDocumentPayload,
): Promise<ClientDocumentRecord | null> {
  const existing = await getClientDocumentById(id);
  if (!existing) return null;
  const merged = mergeStripePaymentLinkIds(input, existing);
  return persistClientDocument(id, merged, existing);
}

export async function patchClientDocument(
  id: string,
  rawBody: unknown,
): Promise<ClientDocumentRecord | null> {
  const patch = parseClientDocumentPatchBody(rawBody);
  if (patch === null) return null;
  const existing = await getClientDocumentById(id);
  if (!existing) return null;
  if (Object.keys(patch).length === 0) return existing;
  const merged = applyClientDocumentPatch(existing, patch);
  return persistClientDocument(id, merged, existing);
}

const STRIPE_MIN_USD_CENTS = 50;

/** Apply Stripe Checkout completion to this proposal (idempotent). Validates amount vs current document. */
export async function markClientDocumentStripePayment(
  id: string,
  kind: "deposit" | "balance" | "full",
  opts?: { amountTotalCents?: number | null },
): Promise<boolean> {
  const doc = await getClientDocumentById(id);
  if (!doc) return false;
  if (kind === "deposit" && doc.paymentDepositPaid) return true;
  if (kind === "balance" && doc.paymentBalancePaid) return true;
  if (
    kind === "full" &&
    doc.paymentDepositPaid &&
    doc.paymentBalancePaid
  ) {
    return true;
  }
  const expected =
    kind === "deposit"
      ? doc.depositAmountCents ?? 0
      : kind === "balance"
        ? Math.max(
            0,
            (doc.proposalTotalCents ?? 0) - (doc.depositAmountCents ?? 0),
          )
        : doc.paymentDepositPaid
          ? Math.max(
              0,
              (doc.proposalTotalCents ?? 0) - (doc.depositAmountCents ?? 0),
            )
          : doc.proposalTotalCents ?? 0;
  if (
    opts?.amountTotalCents != null &&
    opts.amountTotalCents !== expected
  ) {
    console.error(
      "[client_documents] stripe amount mismatch",
      id,
      kind,
      opts.amountTotalCents,
      expected,
    );
    return false;
  }
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> =
    kind === "full"
      ? {
          payment_deposit_paid: true,
          payment_balance_paid: true,
          deposit_paid_at: doc.depositPaidAt ?? now,
          balance_paid_at: doc.balancePaidAt ?? now,
          updated_at: now,
        }
      : kind === "deposit"
        ? {
            payment_deposit_paid: true,
            deposit_paid_at: doc.depositPaidAt ?? now,
            updated_at: now,
          }
        : {
            payment_balance_paid: true,
            balance_paid_at: doc.balancePaidAt ?? now,
            updated_at: now,
          };
  const { error } = await supabase.from("client_documents").update(patch).eq("id", id);
  if (error) {
    console.error("[client_documents] mark stripe payment", error);
    return false;
  }
  const updated = await getClientDocumentById(id);
  if (updated) await syncProposalLifecycleStatusForRecordId(id, updated);
  return true;
}

/**
 * Poll Stripe for completed checkouts on this document’s Payment Links
 * (useful when webhooks are delayed or for backfill).
 */
export async function syncClientDocumentStripePaymentsFromApi(
  id: string,
): Promise<ClientDocumentRecord | null> {
  const doc = await getClientDocumentById(id);
  if (!doc) return null;

  const stripe = getStripe();
  let depositPaid = doc.paymentDepositPaid;
  let balancePaid = doc.paymentBalancePaid;
  let depositPaidAt = doc.depositPaidAt ?? null;
  let balancePaidAt = doc.balancePaidAt ?? null;

  async function linkHasPaidCheckout(
    paymentLinkId: string,
  ): Promise<number | null> {
    const sessions = await stripe.checkout.sessions.list({
      payment_link: paymentLinkId,
      limit: 20,
    });
    for (const s of sessions.data) {
      if (s.payment_status === "paid" && s.status === "complete") {
        return s.created * 1000;
      }
    }
    return null;
  }

  if (doc.stripePaymentLinkDepositId) {
    const ts = await linkHasPaidCheckout(doc.stripePaymentLinkDepositId);
    if (ts != null) {
      depositPaid = true;
      depositPaidAt = depositPaidAt ?? new Date(ts).toISOString();
    }
  }

  if (doc.stripePaymentLinkBalanceId) {
    const ts = await linkHasPaidCheckout(doc.stripePaymentLinkBalanceId);
    if (ts != null) {
      balancePaid = true;
      balancePaidAt = balancePaidAt ?? new Date(ts).toISOString();
    }
  }

  const totalC = doc.proposalTotalCents ?? 0;
  const depC = doc.depositAmountCents ?? 0;
  const balanceCents = Math.max(0, totalC - depC);
  if (balanceCents < STRIPE_MIN_USD_CENTS && totalC > 0 && depositPaid) {
    balancePaid = true;
    balancePaidAt = balancePaidAt ?? depositPaidAt ?? new Date().toISOString();
  }

  if (
    depositPaid === doc.paymentDepositPaid &&
    balancePaid === doc.paymentBalancePaid &&
    depositPaidAt === (doc.depositPaidAt ?? null) &&
    balancePaidAt === (doc.balancePaidAt ?? null)
  ) {
    return doc;
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      payment_deposit_paid: depositPaid,
      payment_balance_paid: balancePaid,
      deposit_paid_at: depositPaidAt,
      balance_paid_at: balancePaidAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return doc;
  const mapped = mapClientDocument(data as unknown as ClientDocumentRow);
  await syncProposalLifecycleStatusForRecordId(id, mapped);
  return (await getClientDocumentById(id)) ?? mapped;
}

export async function clearClientDocumentBalanceStripeLinkId(
  id: string,
): Promise<void> {
  const supabase = getServiceSupabase();
  await supabase
    .from("client_documents")
    .update({
      stripe_payment_link_balance_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function attachStripePaymentLinksToClientDocument(
  id: string,
  input: {
    depositLinkUrl: string;
    stripePaymentLinkDepositId: string;
    balanceLinkUrl?: string | null;
    stripePaymentLinkBalanceId?: string | null;
    snapshotTotalCents: number | null;
    snapshotDepositCents: number | null;
    snapshotBalanceCents: number | null;
    snapshotBalanceDueDate: string | null;
  },
): Promise<ClientDocumentRecord | null> {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    deposit_link: input.depositLinkUrl,
    stripe_payment_link_deposit_id: input.stripePaymentLinkDepositId,
    last_payment_snapshot_total: input.snapshotTotalCents,
    last_payment_snapshot_deposit: input.snapshotDepositCents,
    last_payment_snapshot_balance: input.snapshotBalanceCents,
    last_payment_snapshot_balance_due_date: input.snapshotBalanceDueDate,
    payment_links_stale: false,
    updated_at: now,
  };
  if (
    input.balanceLinkUrl != null &&
    input.stripePaymentLinkBalanceId != null
  ) {
    patch.balance_link = input.balanceLinkUrl;
    patch.stripe_payment_link_balance_id = input.stripePaymentLinkBalanceId;
  } else {
    patch.balance_link = null;
    patch.stripe_payment_link_balance_id = null;
  }
  const { data, error } = await supabase
    .from("client_documents")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return mapClientDocument(data as unknown as ClientDocumentRow);
}

export async function markClientDocumentPdfGenerated(
  id: string,
): Promise<void> {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  await supabase
    .from("client_documents")
    .update({
      proposal_pdf_generated_at: now,
      updated_at: now,
    })
    .eq("id", id);
}

export async function setClientDocumentStripeInvoice(
  id: string,
  input: {
    stripeInvoiceId: string;
    stripeInvoiceUrl: string;
    stripeInvoicePdfUrl?: string | null;
    stripeInvoiceStatus: string;
    stripeInvoiceAmountCents: number;
  },
): Promise<ClientDocumentRecord | null> {
  const existing = await getClientDocumentById(id);
  if (!existing) return null;
  const paymentLinksStale = computePaymentLinksStale({
    stripePaymentLinkDepositId: existing.stripePaymentLinkDepositId,
    lastPaymentSnapshotTotal: existing.lastPaymentSnapshotTotal ?? null,
    lastPaymentSnapshotDeposit: existing.lastPaymentSnapshotDeposit ?? null,
    lastPaymentSnapshotBalance: existing.lastPaymentSnapshotBalance ?? null,
    lastPaymentSnapshotBalanceDueDate:
      existing.lastPaymentSnapshotBalanceDueDate ?? null,
    proposalTotalCents: existing.proposalTotalCents,
    depositAmountCents: existing.depositAmountCents,
    paymentDueDate: existing.paymentDueDate,
  });
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      stripe_invoice_id: input.stripeInvoiceId,
      stripe_invoice_url: input.stripeInvoiceUrl,
      stripe_invoice_pdf_url: input.stripeInvoicePdfUrl ?? null,
      stripe_invoice_status: input.stripeInvoiceStatus,
      stripe_invoice_amount_cents: input.stripeInvoiceAmountCents,
      payment_links_stale: paymentLinksStale,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return mapClientDocument(data as unknown as ClientDocumentRow);
}

export async function clearClientDocumentStripeInvoice(
  id: string,
): Promise<ClientDocumentRecord | null> {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      stripe_invoice_id: null,
      stripe_invoice_url: null,
      stripe_invoice_pdf_url: null,
      stripe_invoice_status: null,
      stripe_invoice_amount_cents: null,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return mapClientDocument(data as unknown as ClientDocumentRow);
}

export async function setClientDocumentStripeInvoiceStatus(
  id: string,
  status: string,
): Promise<void> {
  const supabase = getServiceSupabase();
  await supabase
    .from("client_documents")
    .update({
      stripe_invoice_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function getClientDocumentByPublicToken(
  token: string,
): Promise<ClientDocumentRecord | null> {
  const t = token?.trim();
  if (!t || t.length < 16) return null;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("client_documents")
    .select("*")
    .eq("proposal_public_token", t)
    .eq("proposal_link_disabled", false)
    .maybeSingle();
  if (error || !data) return null;
  return mapClientDocument(data as unknown as ClientDocumentRow);
}

export async function incrementProposalViewByToken(
  token: string,
): Promise<ClientDocumentRecord | null> {
  const doc = await getClientDocumentByPublicToken(token);
  if (!doc) return null;
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const nextCount = (doc.proposalViewCount ?? 0) + 1;
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      proposal_view_count: nextCount,
      proposal_first_viewed_at: doc.proposalFirstViewedAt ?? now,
      proposal_last_viewed_at: now,
      updated_at: now,
    })
    .eq("id", doc.id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  const mapped = mapClientDocument(data as unknown as ClientDocumentRow);
  await syncProposalLifecycleStatusForRecordId(doc.id, mapped);
  return (await getClientDocumentById(doc.id)) ?? mapped;
}

export async function approveProposalByToken(
  token: string,
  fullName: string,
  ip?: string | null,
): Promise<ClientDocumentRecord | null> {
  const doc = await getClientDocumentByPublicToken(token);
  if (!doc) return null;
  if (doc.proposalApprovedAt) return doc;
  const name = fullName.trim();
  if (name.length < 2) return null;
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      proposal_approved_at: now,
      proposal_approved_name: name,
      proposal_approved_ip: ip?.trim() || null,
      updated_at: now,
    })
    .eq("id", doc.id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  const mapped = mapClientDocument(data as unknown as ClientDocumentRow);
  await syncProposalLifecycleStatusForRecordId(doc.id, mapped);
  return (await getClientDocumentById(doc.id)) ?? mapped;
}

export async function rotateProposalPublicTokenForAdmin(
  id: string,
): Promise<ClientDocumentRecord | null> {
  const existing = await getClientDocumentById(id);
  if (!existing) return null;
  const token = randomBytes(32).toString("hex");
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      proposal_public_token: token,
      proposal_link_disabled: false,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  const mapped = mapClientDocument(data as unknown as ClientDocumentRow);
  await syncProposalLifecycleStatusForRecordId(id, mapped);
  return (await getClientDocumentById(id)) ?? mapped;
}

export async function setProposalLinkDisabledForAdmin(
  id: string,
  disabled: boolean,
): Promise<ClientDocumentRecord | null> {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    proposal_link_disabled: disabled,
    updated_at: now,
  };
  if (!disabled) {
    const cur = await getClientDocumentById(id);
    if (cur?.proposalPublicToken) {
      patch.proposal_lifecycle_status = "sent";
    } else {
      patch.proposal_lifecycle_status = "draft";
    }
  }
  const { data, error } = await supabase
    .from("client_documents")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  const mapped = mapClientDocument(data as unknown as ClientDocumentRow);
  await syncProposalLifecycleStatusForRecordId(id, mapped);
  return (await getClientDocumentById(id)) ?? mapped;
}

/** Owner-only: mark approved without client flow (e.g. signed offline). */
export async function adminMarkProposalApproved(
  id: string,
  name: string,
): Promise<ClientDocumentRecord | null> {
  const existing = await getClientDocumentById(id);
  if (!existing) return null;
  const n = name.trim() || "Client (manual)";
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      proposal_approved_at: now,
      proposal_approved_name: n,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  const mapped = mapClientDocument(data as unknown as ClientDocumentRow);
  await syncProposalLifecycleStatusForRecordId(id, mapped);
  return (await getClientDocumentById(id)) ?? mapped;
}

export async function adminSetProposalLifecycleStatus(
  id: string,
  status: import("@/lib/types/proposalLifecycle").ProposalLifecycleStatus,
): Promise<ClientDocumentRecord | null> {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("client_documents")
    .update({
      proposal_lifecycle_status: status,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return mapClientDocument(data as unknown as ClientDocumentRow);
}
