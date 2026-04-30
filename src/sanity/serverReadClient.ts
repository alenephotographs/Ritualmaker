import { createClient } from "next-sanity";
import { getApiVersion, getSanityDataset, getSanityProjectId } from "./env";

/**
 * Server-only reads without the API CDN so admin lists match writes immediately after save/refresh.
 * Public pages should keep using `sanityClient` (CDN) for edge caching.
 */
export const sanityServerReadClient = createClient({
  projectId: getSanityProjectId(),
  dataset: getSanityDataset(),
  apiVersion: getApiVersion(),
  useCdn: false,
  perspective: "published",
});
