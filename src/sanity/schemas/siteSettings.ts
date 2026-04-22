import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Site title",
      type: "string",
      initialValue: "Ritualmaker Flowers",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      initialValue: "Fresh flowers in the neighborhood 24/7",
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "standStatus",
      title: "Stand status",
      type: "string",
      options: {
        list: [
          { title: "Open — bouquets available", value: "open" },
          { title: "Restocking soon", value: "restocking" },
          { title: "Closed for the season", value: "closed" },
        ],
        layout: "radio",
      },
      initialValue: "open",
    }),
    defineField({
      name: "standMessage",
      title: "Stand status message",
      type: "string",
      description: 'Optional short message, e.g. "Fresh batch on the stand now"',
    }),
    defineField({
      name: "address",
      title: "Address / Location",
      type: "string",
      initialValue: "Miller Hill Road, Hudson Valley, NY",
    }),
    defineField({
      name: "mapUrl",
      title: "Google Maps URL",
      type: "url",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      initialValue: "https://instagram.com/ritualmakerny",
    }),
    defineField({
      name: "instagramHandle",
      title: "Instagram handle",
      type: "string",
      initialValue: "@ritualmakerny",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      initialValue: "ritualmakerny@gmail.com",
    }),
    defineField({
      name: "googleReviewUrl",
      title: "Google review URL",
      type: "url",
    }),
    defineField({
      name: "googleProfileUrl",
      title: "Google business profile URL",
      type: "url",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroImageUrl",
      title: "Hero image external URL (optional)",
      type: "url",
      description: "Use an archive.boutique URL to override the upload above.",
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
