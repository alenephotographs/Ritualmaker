import { createClient } from "@sanity/client";
import { getApiVersion, getWriteDataset, getWriteProjectId } from "./env";

const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim();

export const sanityWriteClient = createClient({
  projectId: getWriteProjectId(),
  dataset: getWriteDataset(),
  apiVersion: getApiVersion(),
  useCdn: false,
  token: writeToken,
});

export function hasSanityWriteClient() {
  return Boolean(writeToken);
}
