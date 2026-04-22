import type { SiteSettings } from "@/sanity/types";

/** Shown in copy when Sanity address is empty */
export const STAND_ADDRESS_LINE = "38 Miller Hill Road, Hudson Valley, NY";

/** Google Maps search for the stand — used when `mapUrl` is not set in site settings */
export const DEFAULT_STAND_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  STAND_ADDRESS_LINE,
)}`;

export type ResolvedContactLinks = {
  addressLine: string;
  mapsUrl: string;
  googleProfileUrl: string | undefined;
  googleReviewUrl: string | undefined;
  email: string | undefined;
  instagramUrl: string | undefined;
  instagramHandle: string | undefined;
};

export function resolveContactLinks(
  s: SiteSettings | null | undefined,
): ResolvedContactLinks {
  const addressLine = s?.address?.trim() || STAND_ADDRESS_LINE;
  const fromCms = s?.mapUrl?.trim();
  return {
    addressLine,
    mapsUrl: fromCms && fromCms.length > 0 ? fromCms : DEFAULT_STAND_MAPS_URL,
    googleProfileUrl: s?.googleProfileUrl?.trim() || undefined,
    googleReviewUrl: s?.googleReviewUrl?.trim() || undefined,
    email: s?.email?.trim() || undefined,
    instagramUrl: s?.instagramUrl?.trim() || undefined,
    instagramHandle: s?.instagramHandle?.trim() || undefined,
  };
}
