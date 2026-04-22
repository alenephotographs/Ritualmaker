import { defineField, defineType } from "sanity";
import { externalMedia } from "../previewMedia";

export default defineType({
  name: "archivePhoto",
  title: "Archive Photo / Video",
  type: "document",
  description:
    "Photos and videos from the field. Source images live on archive.boutique; you can also upload here directly.",
  fields: [
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "image",
    }),
    defineField({
      name: "externalUrl",
      title: "External URL (archive.boutique)",
      type: "url",
      description:
        "Direct URL to the image or video file on archive.boutique. Takes priority over uploaded image.",
    }),
    defineField({
      name: "image",
      title: "Or upload an image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ document }) => !!document?.externalUrl,
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "capturedAt",
      title: "Captured",
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
    select: {
      title: "caption",
      url: "externalUrl",
      kind: "kind",
      image: "image",
    },
    prepare({ title, url, kind, image }) {
      return {
        title: title || url || "(untitled)",
        subtitle: kind,
        media: externalMedia(url, image),
      };
    },
  },
});
