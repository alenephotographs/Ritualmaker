import { defineField, defineType } from "sanity";

/** Fallback Maps search; code uses the same in `lib/siteContact` when this field is empty */
const defaultMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("38 Miller Hill Road, Hudson Valley, NY")}`;

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
      initialValue: "38 Miller Hill Road, Hudson Valley, NY",
    }),
    defineField({
      name: "mapUrl",
      title: "Google Maps URL (directions to the stand)",
      type: "url",
      initialValue: defaultMapsUrl,
      description:
        "Paste “Share” from Google Maps for the stand, or the Business Profile maps link. If empty, the site uses a search for 38 Miller Hill Road.",
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
      description: "“Write a review” or review link for your business listing.",
    }),
    defineField({
      name: "googleProfileUrl",
      title: "Google Business Profile URL",
      type: "url",
      description:
        "Your public Google Business listing (e.g. from “Share” on Search or Business Profile). Shown in the footer, checkout, and inquiry page.",
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
