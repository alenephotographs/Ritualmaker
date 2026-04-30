import { defineField, defineType } from "sanity";

const productCategories = [
  { title: "Bouquet", value: "bouquet" },
  { title: "Pantry", value: "pantry" },
  { title: "Bundle", value: "bundle" },
  { title: "Wedding/event flowers", value: "wedding_event" },
  { title: "Vendor item", value: "vendor_item" },
  { title: "Other", value: "other" },
];

const productTiers = [
  { title: "Small", value: "small" },
  { title: "Standard", value: "standard" },
  { title: "Premium", value: "premium" },
];

export default defineType({
  name: "flowerProduct",
  title: "Flower Service Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publicName",
      title: "Public name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "displayDescription",
      title: "Display description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: productCategories },
      initialValue: "bouquet",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tier",
      title: "Tier",
      type: "string",
      options: { list: productTiers },
    }),
    defineField({
      name: "priceCents",
      title: "Price (USD cents)",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Inactive items stay saved but are hidden from the public store.",
    }),
    defineField({
      name: "inStock",
      title: "In stock",
      type: "boolean",
      initialValue: true,
      description: "Toggle off when this recurring item is not currently available.",
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "number",
      description: "Optional internal count.",
    }),
    defineField({
      name: "recurringItem",
      title: "Recurring item",
      type: "boolean",
      initialValue: true,
      description: "Use for offerings that come in and out of availability.",
    }),
    defineField({
      name: "imageUrl",
      title: "Image URL",
      type: "string",
      description: "Optional image URL or /photos/... path.",
    }),
    defineField({
      name: "vendor",
      title: "Vendor",
      type: "reference",
      to: [{ type: "vendor" }],
      description: "Optional outside vendor/consignment owner.",
    }),
    defineField({
      name: "billingLabel",
      title: "Billing label",
      type: "string",
      initialValue: "Flower Service",
      description: "Customer-facing Stripe label/category language.",
    }),
    defineField({
      name: "taxCategory",
      title: "Tax category",
      type: "string",
      initialValue: "flower_service",
    }),
    defineField({
      name: "internalNotes",
      title: "Internal notes",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "stripeProductId",
      title: "Stripe Product ID",
      type: "string",
      description: "Optional. Leave blank to use the current price directly.",
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
      description: "Optional. Leave blank to use the current price directly.",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      initialValue: 100,
    }),
    defineField({
      name: "metadata",
      title: "Metadata",
      type: "object",
      description: "Optional structured notes for future bundles.",
      fields: [
        defineField({
          name: "notes",
          title: "Notes",
          type: "text",
          rows: 2,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      category: "category",
      active: "active",
      inStock: "inStock",
      vendorName: "vendor.name",
    },
    prepare({ title, category, active, inStock, vendorName }) {
      const status = active === false ? "INACTIVE" : inStock === false ? "OUT" : "IN STOCK";
      return {
        title,
        subtitle: [category, vendorName, status].filter(Boolean).join(" · "),
      };
    },
  },
  orderings: [
    {
      title: "Display order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
});
