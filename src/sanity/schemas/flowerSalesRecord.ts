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
