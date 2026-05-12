import { defineField, defineType } from "sanity";
import { externalMedia } from "../previewMedia";

export default defineType({
  name: "bouquet",
  title: "Bouquet",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "farm",
      title: "Farm",
      type: "string",
      options: {
        list: [
          { title: "Ritualmaker Farm", value: "ritualmaker" },
          { title: "Wonderland Ridge Farm", value: "wonderland-ridge" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "vendor",
      title: "Vendor",
      type: "reference",
      to: [{ type: "vendor" }],
      description: "Who owns this listing and receives payout for this sale.",
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "Large ($30)", value: "large" },
          { title: "Small ($20)", value: "small" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "priceCents",
      title: "Price (USD cents)",
      type: "number",
      description: "e.g. 3000 for $30, 2000 for $20",
      validation: (r) => r.required().min(100),
    }),
    defineField({
      name: "shelfLocation",
      title: "Shelf location at the stand",
      type: "string",
      description: 'e.g. "Top shelf, left"',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [{ type: "string" }],
      description: "Short bullet points (e.g. Cut today, Grown on the farm, Lasts 10–12 days)",
    }),
    defineField({
      name: "image",
      title: "Image (uploaded)",
      type: "image",
      options: { hotspot: true },
      description:
        "Upload an image, or use the External image URL field below to point at an archive.boutique URL or local /photos/ path.",
    }),
    defineField({
      name: "externalImageUrl",
      title: "External image URL",
      type: "string",
      description:
        "Takes priority over the upload above. Use a full URL or a /photos/foo.jpg path.",
    }),
    defineField({
      name: "stripeProductId",
      title: "Stripe Product ID",
      type: "string",
      description: "Used by Checkout. Keep blank to use the live priceCents directly.",
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
    }),
    defineField({
      name: "available",
      title: "Currently available at the stand",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "inventoryAudit",
      title: "Inventory audit",
      type: "object",
      readOnly: true,
      fields: [
        defineField({
          name: "lastEditedAt",
          title: "Last edited at",
          type: "datetime",
        }),
        defineField({
          name: "lastEditedByEmail",
          title: "Last edited by email",
          type: "string",
        }),
        defineField({
          name: "lastEditedByRole",
          title: "Last edited by role",
          type: "string",
        }),
        defineField({
          name: "lastEditedByVendorId",
          title: "Last edited by vendor ID",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "inventoryAuditHistory",
      title: "Inventory audit history",
      type: "array",
      readOnly: true,
      of: [
        defineField({
          name: "entry",
          title: "Entry",
          type: "object",
          fields: [
            defineField({
              name: "editedAt",
              title: "Edited at",
              type: "datetime",
            }),
            defineField({
              name: "editedByEmail",
              title: "Edited by email",
              type: "string",
            }),
            defineField({
              name: "editedByRole",
              title: "Edited by role",
              type: "string",
            }),
            defineField({
              name: "editedByVendorId",
              title: "Edited by vendor ID",
              type: "string",
            }),
            defineField({
              name: "changeSummary",
              title: "Change summary",
              type: "string",
            }),
          ],
        }),
      ],
      description: "Most recent inventory edits, capped at 10 entries.",
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      initialValue: 100,
    }),
  ],
  preview: {
    select: {
      name: "name",
      farm: "farm",
      vendorName: "vendor.name",
      size: "size",
      available: "available",
      image: "image",
      externalImageUrl: "externalImageUrl",
    },
    prepare({ name, farm, vendorName, size, available, image, externalImageUrl }) {
      const owner = vendorName ?? farm ?? "";
      return {
        title: name,
        subtitle: `${owner} · ${size ?? ""} ${available ? "" : "· OUT OF STOCK"}`,
        media: externalMedia(externalImageUrl, image),
      };
    },
  },
  orderings: [
    {
      title: "Display order",
      name: "displayOrderAsc",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
});
