import { defineField, defineType } from "sanity";

export default defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Customer name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 5,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      description: "e.g. Google, Instagram DM, Email",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
    }),
    defineField({
      name: "featured",
      title: "Featured on home page",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "quote", featured: "featured" },
    prepare({ title, subtitle, featured }) {
      return {
        title: featured ? `★ ${title}` : title,
        subtitle: subtitle?.slice(0, 80),
      };
    },
  },
});
