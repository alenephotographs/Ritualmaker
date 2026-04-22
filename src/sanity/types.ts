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
  inventoryAudit?: InventoryAudit;
  inventoryAuditHistory?: InventoryAuditHistoryEntry[];
  stripePriceId?: string;
  stripeProductId?: string;
  imageUrl?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  slug: string;
  contactName?: string;
  contactEmail?: string;
  accessCode?: string;
  active?: boolean;
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
