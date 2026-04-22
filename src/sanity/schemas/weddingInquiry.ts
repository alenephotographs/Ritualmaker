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
          { title: "Ritualmaker Live Collage™", value: "live-collage" },
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
