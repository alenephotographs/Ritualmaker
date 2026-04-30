import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getApiVersion, getSanityDataset, getSanityProjectId } from "./env";

export const sanityClient = createClient({
  projectId: getSanityProjectId(),
  dataset: getSanityDataset(),
  apiVersion: getApiVersion(),
  /** Direct API (not the edge CDN) so published edits show on the site right after save. */
  useCdn: false,
  perspective: "published",
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: SanityImageSource) => builder.image(source);
