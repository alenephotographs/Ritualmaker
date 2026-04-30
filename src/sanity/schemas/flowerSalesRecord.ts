import { defineField, defineType } from "sanity";

export default defineType({
  name: "flowerSalesRecord",
  title: "Flower Sales Record",
  type: "document",
  fields: [
    defineField({
      name: "customerName",
      title: "Customer name",
      type: "string",
    }),
    defineField({
      name: "customerEmail",
      title: "Customer email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "itemName",
      title: "Item / service name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "amountCents",
      title: "Amount (USD cents)",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "saleDate",
      title: "Date",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "checkoutSessionId",
      title: "Stripe checkout session ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "paymentIntentId",
      title: "Stripe payment intent ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "itemType",
      title: "Item type",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "itemId",
      title: "Item ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "stripeCustomerId",
      title: "Stripe customer ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment method",
      type: "string",
      options: {
        list: [
          { title: "Cash", value: "cash" },
          { title: "Venmo", value: "venmo" },
          { title: "Card", value: "card" },
          { title: "Invoice", value: "invoice" },
          { title: "Other", value: "other" },
        ],
      },
      initialValue: "card",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "vendor",
      title: "Vendor",
      type: "reference",
      to: [{ type: "vendor" }],
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "taxCategory",
      title: "Tax category / billing type",
      type: "string",
      initialValue: "flower service",
      description: 'Defaults to "flower service" for sole-proprietor billing records.',
    }),
    defineField({
      name: "billingType",
      title: "Billing type (legacy)",
      type: "string",
    }),
    defineField({
      name: "billingLabel",
      title: "Billing label",
      type: "string",
    }),
    defineField({
      name: "ritualBundleDiscountCents",
      title: "Bundle discount (USD cents)",
      type: "number",
      description: "Total Ritual Bundle discount from Stripe checkout (bouquet + pantry cart).",
    }),
    defineField({
      name: "ritualBundleDiscountApplied",
      title: "Bundle discount applied",
      type: "string",
      description: 'Set to "yes" when checkout metadata recorded a bundle discount.',
    }),
    defineField({
      name: "createdByEmail",
      title: "Created by email",
      type: "string",
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Newest",
      name: "saleDateDesc",
      by: [{ field: "saleDate", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      itemName: "itemName",
      amountCents: "amountCents",
      paymentMethod: "paymentMethod",
      saleDate: "saleDate",
    },
    prepare({ itemName, amountCents, paymentMethod, saleDate }) {
      const amount =
        typeof amountCents === "number"
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(amountCents / 100)
          : "";
      return {
        title: itemName ?? "Flower sales record",
        subtitle: [amount, paymentMethod, saleDate].filter(Boolean).join(" · "),
      };
    },
  },
});
