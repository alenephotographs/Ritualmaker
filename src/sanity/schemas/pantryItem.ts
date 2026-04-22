import { defineField, defineType } from "sanity";
import { externalMedia } from "../previewMedia";

export default defineType({
  name: "pantryItem",
  title: "Pantry / Goods",
  type: "document",
  description:
    "Non-bouquet goods at the stand: oils, salts, sugars, eggs, etc. Set 'Coming soon' to show a teaser without a buy button.",
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
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Oil", value: "oil" },
          { title: "Salt", value: "salt" },
          { title: "Sugar", value: "sugar" },
          { title: "Eggs", value: "eggs" },
          { title: "Other", value: "other" },
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "priceCents",
      title: "Price (USD cents)",
      type: "number",
      description: "Leave blank for coming-soon items without a price yet.",
    }),
    defineField({
      name: "shelfLocation",
      title: "Shelf location at the stand",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Image (uploaded)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "externalImageUrl",
      title: "External image URL",
      type: "string",
      description:
        "Takes priority over the upload above. Use a full URL or a /photos/foo.jpg path.",
    }),
    defineField({
      name: "comingSoon",
      title: "Coming soon",
      type: "boolean",
      initialValue: false,
      description:
        "Show as a teaser. The buy button is hidden and a 'Coming soon' badge is displayed.",
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
      name: "stripeProductId",
      title: "Stripe Product ID",
      type: "string",
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
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
      category: "category",
      vendorName: "vendor.name",
      comingSoon: "comingSoon",
      available: "available",
      image: "image",
      externalImageUrl: "externalImageUrl",
    },
    prepare({
      name,
      category,
      vendorName,
      comingSoon,
      available,
      image,
      externalImageUrl,
    }) {
      const tags = [
        category,
        vendorName ?? "",
        comingSoon ? "COMING SOON" : available ? "" : "OUT OF STOCK",
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        title: name,
        subtitle: tags,
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
