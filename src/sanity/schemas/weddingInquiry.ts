import { defineField, defineType } from "sanity";

export default defineType({
  name: "weddingInquiry",
  title: "Wedding Inquiry",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "formType",
      title: "Form",
      type: "string",
      options: {
        list: [
          { title: "On location (florals / Live Collage™)", value: "on-location" },
          { title: "Photography", value: "photography" },
        ],
        layout: "radio",
      },
      description: "Which intake form the client used. Older rows may be blank (legacy).",
    }),
    defineField({
      name: "services",
      title: "Services interested in",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Wedding / event florals", value: "florals" },
          { title: "Pop-up flower bar", value: "popup-flower-bar" },
          { title: "Restaurants / hotels", value: "restaurant-hotel" },
          { title: "Commercial / hospitality account", value: "commercial-account" },
          { title: "Ritualmaker Live Collage™", value: "live-collage" },
          { title: "General on-location inquiry", value: "general-on-location" },
          { title: "Ritualmaker Photography", value: "photography" },
        ],
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "photoInquiryKind",
      title: "Photography — inquiry type",
      type: "string",
      options: {
        list: [
          { title: "Field rental (portrait use)", value: "field-rental" },
          { title: "Sessions with me (farm or elsewhere)", value: "sessions-with-me" },
          {
            title: "Wedding, engagement, or on-location coverage",
            value: "wedding-engagement-on-location",
          },
        ],
        layout: "radio",
      },
      hidden: ({ parent }) => parent?.formType !== "photography",
    }),
    defineField({
      name: "eventType",
      title: "Event type",
      type: "string",
      options: {
        list: [
          { title: "Wedding", value: "Wedding" },
          { title: "Event", value: "Event" },
          { title: "Corporate", value: "Corporate" },
        ],
      },
    }),
    defineField({
      name: "eventDate",
      title: "Event date",
      type: "date",
    }),
    defineField({
      name: "venue",
      title: "Venue",
      type: "string",
    }),
    defineField({
      name: "guestCount",
      title: "Guest count",
      type: "number",
    }),
    defineField({
      name: "budgetBand",
      title: "Budget band",
      type: "string",
      options: {
        list: [
          { title: "Under $3k", value: "under-3k" },
          { title: "$3k-$6k", value: "3k-6k" },
          { title: "$6k-$10k", value: "6k-10k" },
          { title: "$10k+", value: "10k-plus" },
        ],
      },
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Replied", value: "replied" },
          { title: "Booked", value: "booked" },
          { title: "Declined", value: "declined" },
        ],
      },
      initialValue: "new",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "proposalScope",
      title: "Proposal scope",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "proposalTotalCents",
      title: "Proposal total (cents)",
      type: "number",
    }),
    defineField({
      name: "depositAmountCents",
      title: "Deposit amount (cents)",
      type: "number",
    }),
    defineField({
      name: "balanceAmountCents",
      title: "Balance amount (cents)",
      type: "number",
    }),
    defineField({
      name: "balanceDueDate",
      title: "Balance due date",
      type: "date",
    }),
    defineField({
      name: "proposalPdfGeneratedAt",
      title: "Proposal PDF generated at",
      type: "datetime",
    }),
    defineField({
      name: "proposalPdfFileName",
      title: "Proposal PDF file name",
      type: "string",
    }),
    defineField({
      name: "depositPaymentLinkId",
      title: "Deposit payment link ID",
      type: "string",
    }),
    defineField({
      name: "depositPaymentLinkUrl",
      title: "Deposit payment link URL",
      type: "url",
    }),
    defineField({
      name: "balancePaymentLinkId",
      title: "Balance payment link ID",
      type: "string",
    }),
    defineField({
      name: "balancePaymentLinkUrl",
      title: "Balance payment link URL",
      type: "url",
    }),
    defineField({
      name: "stripeInvoiceId",
      title: "Stripe invoice ID",
      type: "string",
    }),
    defineField({
      name: "stripeInvoiceUrl",
      title: "Stripe invoice URL",
      type: "url",
    }),
    defineField({
      name: "stripeInvoicePdfUrl",
      title: "Stripe invoice PDF URL",
      type: "url",
    }),
    defineField({
      name: "stripeInvoiceStatus",
      title: "Stripe invoice status",
      type: "string",
    }),
    defineField({
      name: "stripeInvoiceCreatedAt",
      title: "Stripe invoice created at",
      type: "datetime",
    }),
    defineField({
      name: "depositPaid",
      title: "Deposit paid",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "balancePaid",
      title: "Balance paid",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "paidInFull",
      title: "Paid in full",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "paymentStatusUpdatedAt",
      title: "Payment status updated at",
      type: "datetime",
    }),
    defineField({
      name: "internalNotes",
      title: "Internal notes",
      type: "text",
      rows: 4,
    }),
  ],
  orderings: [
    {
      title: "Newest",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      status: "status",
      formType: "formType",
    },
    prepare({ title, subtitle, status, formType }) {
      return {
        title,
        subtitle: [formType, subtitle, status ? status.toUpperCase() : ""]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
