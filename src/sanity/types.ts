export type Farm = "ritualmaker" | "wonderland-ridge";
export type Size = "large" | "small";

export interface InventoryAudit {
  lastEditedAt?: string;
  lastEditedByEmail?: string;
  lastEditedByRole?: string;
  lastEditedByVendorId?: string;
}

export interface InventoryAuditHistoryEntry {
  _key?: string;
  editedAt?: string;
  editedByEmail?: string;
  editedByRole?: string;
  editedByVendorId?: string;
  changeSummary?: string;
}

export interface Bouquet {
  _id: string;
  name: string;
  slug: string;
  farm: Farm;
  vendorId?: string;
  vendorName?: string;
  vendorStripeAccountId?: string;
  size: Size;
  priceCents: number;
  shelfLocation?: string;
  description?: string;
  highlights?: string[];
  available: boolean;
  inventoryAudit?: InventoryAudit;
  inventoryAuditHistory?: InventoryAuditHistoryEntry[];
  stripePriceId?: string;
  stripeProductId?: string;
  imageUrl?: string;
}

export type PantryCategory = "oil" | "salt" | "sugar" | "eggs" | "other";

export interface PantryItem {
  _id: string;
  name: string;
  slug: string;
  category: PantryCategory;
  vendorId?: string;
  vendorName?: string;
  vendorStripeAccountId?: string;
  description?: string;
  priceCents?: number;
  shelfLocation?: string;
  comingSoon?: boolean;
  available?: boolean;
  /** When true, show local delivery language on the item card. */
  shipsAvailable?: boolean;
  inventoryAudit?: InventoryAudit;
  inventoryAuditHistory?: InventoryAuditHistoryEntry[];
  stripePriceId?: string;
  stripeProductId?: string;
  imageUrl?: string;
}

export type FlowerProductCategory =
  | "bouquet"
  | "pantry"
  | "bundle"
  | "wedding_event"
  | "vendor_item"
  | "other";

export type FlowerProductTier = "small" | "standard" | "premium" | "bundle" | "custom";

export interface FlowerProduct {
  _id: string;
  updatedAt?: string;
  name: string;
  slug?: string;
  publicName?: string;
  description?: string;
  shortDescription?: string;
  displayDescription?: string;
  category: FlowerProductCategory;
  tier?: string;
  priceCents: number;
  active?: boolean;
  inStock?: boolean;
  quantity?: number;
  recurringItem?: boolean;
  imageUrl?: string;
  vendorId?: string;
  vendorName?: string;
  vendorStripeAccountId?: string;
  billingLabel?: string;
  taxCategory?: string;
  internalNotes?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
  inventoryAudit?: InventoryAudit;
  inventoryAuditHistory?: InventoryAuditHistoryEntry[];
}

export interface Vendor {
  _id: string;
  name: string;
  slug: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  accessCode?: string;
  active?: boolean;
  payoutMethodNotes?: string;
  commissionOrWholesaleNotes?: string;
  internalNotes?: string;
  stripeAccountId?: string;
  stripeOnboardingComplete?: boolean;
  stripeDetailsSubmitted?: boolean;
  stripeChargesEnabled?: boolean;
  stripePayoutsEnabled?: boolean;
  stripeRequirementsCurrentlyDue?: string[];
  stripeRequirementsPastDue?: string[];
  stripeRequirementsDisabledReason?: string;
  stripeComplianceLastSyncedAt?: string;
}

export type FlowerPaymentMethod = "cash" | "venmo" | "card" | "invoice" | "other";

export interface FlowerSalesRecord {
  _id: string;
  customerName?: string;
  customerEmail?: string;
  itemName: string;
  amountCents: number;
  saleDate: string;
  paymentMethod: FlowerPaymentMethod;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  itemType?: string;
  itemId?: string;
  productCategory?: string;
  vendorId?: string;
  vendorName?: string;
  notes?: string;
  taxCategory?: string;
  billingType?: string;
  billingLabel?: string;
  createdByEmail?: string;
}

export type EventOrderStatus = "new" | "replied" | "booked" | "declined";

export interface EventOrder {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  name?: string;
  email?: string;
  formType?: "on-location" | "photography";
  services?: string[];
  eventType?: string;
  eventDate?: string;
  eventLocation?: string;
  venue?: string;
  guestCount?: number;
  notes?: string;
  status?: EventOrderStatus | string;
  proposalScope?: string;
  proposalTotalCents?: number;
  depositAmountCents?: number;
  balanceAmountCents?: number;
  balanceDueDate?: string;
  proposalPdfGeneratedAt?: string;
  proposalPdfFileName?: string;
  depositPaymentLinkId?: string;
  depositPaymentLinkUrl?: string;
  balancePaymentLinkId?: string;
  balancePaymentLinkUrl?: string;
  stripeInvoiceId?: string;
  stripeInvoiceUrl?: string;
  stripeInvoicePdfUrl?: string;
  stripeInvoiceStatus?: string;
  stripeInvoiceCreatedAt?: string;
  depositPaid?: boolean;
  balancePaid?: boolean;
  paidInFull?: boolean;
  paymentStatusUpdatedAt?: string;
  internalNotes?: string;
}

export interface Review {
  _id: string;
  name: string;
  quote: string;
  source?: string;
  date?: string;
}

export interface PortableTextBlock {
  _type: string;
  _key: string;
  children?: { _type: string; text?: string; marks?: string[] }[];
  style?: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: PortableTextBlock[];
}

export interface ArchivePhoto {
  _id: string;
  caption?: string;
  kind: "image" | "video";
  alt?: string;
  externalUrl?: string;
  imageUrl?: string;
  capturedAt?: string;
  featured?: boolean;
}

export interface SiteSettings {
  title: string;
  tagline: string;
  description?: string;
  standStatus: "open" | "restocking" | "closed";
  standMessage?: string;
  address?: string;
  mapUrl?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  email?: string;
  googleReviewUrl?: string;
  googleProfileUrl?: string;
  heroImageUrlResolved?: string;
}
