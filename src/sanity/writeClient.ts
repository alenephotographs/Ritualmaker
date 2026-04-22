import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "./env";

const writeToken = process.env.SANITY_API_WRITE_TOKEN;

export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: writeToken,
});

export function hasSanityWriteClient() {
  return Boolean(writeToken);
}
