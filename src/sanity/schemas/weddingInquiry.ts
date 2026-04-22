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
      name: "services",
      title: "Services interested in",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Wedding florals", value: "florals" },
          { title: "Ritualmaker Live Collage™", value: "live-collage" },
          { title: "Ritualmaker Photography", value: "photography" },
        ],
      },
      validation: (rule) => rule.required().min(1),
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
    },
    prepare({ title, subtitle, status }) {
      return {
        title,
        subtitle: [subtitle, status ? status.toUpperCase() : ""].filter(Boolean).join(" · "),
      };
    },
  },
});
