import { defineField, defineType } from "sanity";

export default defineType({
  name: "uxEvent",
  title: "UX Event",
  type: "document",
  fields: [
    defineField({
      name: "eventType",
      title: "Event type",
      type: "string",
      options: {
        list: [
          { title: "CTA view", value: "cta_view" },
          { title: "CTA click", value: "cta_click" },
          { title: "Checkout completed", value: "checkout_completed" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "experiment",
      title: "Experiment",
      type: "string",
    }),
    defineField({
      name: "variant",
      title: "Variant",
      type: "string",
    }),
    defineField({
      name: "itemType",
      title: "Item type",
      type: "string",
    }),
    defineField({
      name: "itemId",
      title: "Item ID",
      type: "string",
    }),
    defineField({
      name: "checkoutSessionId",
      title: "Checkout session ID",
      type: "string",
    }),
    defineField({
      name: "amountTotal",
      title: "Amount total (cents)",
      type: "number",
    }),
    defineField({
      name: "path",
      title: "Path",
      type: "string",
    }),
    defineField({
      name: "userAgent",
      title: "User agent",
      type: "string",
    }),
    defineField({
      name: "eventAt",
      title: "Event at",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest",
      name: "eventAtDesc",
      by: [{ field: "eventAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      type: "eventType",
      variant: "variant",
      path: "path",
      eventAt: "eventAt",
    },
    prepare({ type, variant, path, eventAt }) {
      const subtitle = [variant, path, eventAt].filter(Boolean).join(" · ");
      return {
        title: type ?? "ux event",
        subtitle,
      };
    },
  },
});
