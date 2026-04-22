import { groq } from "next-sanity";

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  ...,
  "heroImageUrlResolved": coalesce(
    *[
      _type == "archivePhoto" &&
      defined(image) &&
      (
        caption match "*tulip*" ||
        caption match "*Tulip*" ||
        alt match "*tulip*" ||
        alt match "*Tulip*"
      )
    ] | order(_createdAt desc)[0].image.asset->url,
    heroImageUrl,
    heroImage.asset->url
  )
}`;

export const oneBouquetByIdQuery = groq`*[_type == "bouquet" && _id == $id][0]{
  _id, name, farm, size, priceCents, available,
  stripePriceId, stripeProductId,
  "vendorId": vendor->_id,
  "vendorName": vendor->name,
  "vendorStripeAccountId": vendor->stripeAccountId,
  "imageUrl": coalesce(externalImageUrl, image.asset->url)
}`;

export const bouquetsQuery = groq`*[_type == "bouquet"] | order(displayOrder asc, _createdAt asc){
  _id,
  name,
  "slug": slug.current,
  farm,
  "vendorId": vendor->_id,
  "vendorName": vendor->name,
  "vendorStripeAccountId": vendor->stripeAccountId,
  size,
  priceCents,
  shelfLocation,
  description,
  highlights,
  available,
  inventoryAudit,
  "inventoryAuditHistory": inventoryAuditHistory[0...10],
  stripePriceId,
  stripeProductId,
  "imageUrl": coalesce(externalImageUrl, image.asset->url),
  image
}`;

export const pantryItemsQuery = groq`*[_type == "pantryItem"] | order(comingSoon asc, displayOrder asc, _createdAt asc){
  _id,
  name,
  "slug": slug.current,
  category,
  "vendorId": vendor->_id,
  "vendorName": vendor->name,
  "vendorStripeAccountId": vendor->stripeAccountId,
  description,
  priceCents,
  shelfLocation,
  comingSoon,
  available,
  shipsAvailable,
  inventoryAudit,
  "inventoryAuditHistory": inventoryAuditHistory[0...10],
  stripePriceId,
  stripeProductId,
  "imageUrl": coalesce(externalImageUrl, image.asset->url)
}`;

export const onePantryItemByIdQuery = groq`*[_type == "pantryItem" && _id == $id][0]{
  _id, name, category, priceCents, available, comingSoon, shipsAvailable,
  stripePriceId, stripeProductId,
  "vendorId": vendor->_id,
  "vendorName": vendor->name,
  "vendorStripeAccountId": vendor->stripeAccountId,
  "imageUrl": coalesce(externalImageUrl, image.asset->url)
}`;

export const vendorsQuery = groq`*[_type == "vendor"] | order(name asc){
  _id,
  name,
  "slug": slug.current,
  contactName,
  contactEmail,
  accessCode,
  active,
  stripeAccountId,
  stripeOnboardingComplete,
  stripeDetailsSubmitted,
  stripeChargesEnabled,
  stripePayoutsEnabled,
  stripeRequirementsCurrentlyDue,
  stripeRequirementsPastDue,
  stripeRequirementsDisabledReason,
  stripeComplianceLastSyncedAt
}`;

export const featuredReviewsQuery = groq`*[_type == "review" && featured == true] | order(displayOrder asc){
  _id, name, quote, source, date
}`;

export const allReviewsQuery = groq`*[_type == "review"] | order(displayOrder asc, date desc){
  _id, name, quote, source, date
}`;

export const faqsQuery = groq`*[_type == "faq"] | order(displayOrder asc){
  _id, question, answer
}`;

export const galleryQuery = groq`*[_type == "archivePhoto"] | order(displayOrder asc, capturedAt desc){
  _id,
  caption,
  kind,
  alt,
  externalUrl,
  "imageUrl": image.asset->url,
  image,
  capturedAt,
  featured
}`;

export const featuredGalleryQuery = groq`*[_type == "archivePhoto" && featured == true] | order(displayOrder asc, capturedAt desc)[0...8]{
  _id,
  caption,
  kind,
  alt,
  externalUrl,
  "imageUrl": image.asset->url,
  image
}`;
