export function getApiVersion() {
  return process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-01";
}

/** Must satisfy Sanity client `projectId` / `dataset` character rules when building without real env. */
const BUILD_PLACEHOLDER_PROJECT = "build-placeholder";
const BUILD_PLACEHOLDER_DATASET = "build-placeholder";

function requiredPublic(name: "NEXT_PUBLIC_SANITY_PROJECT_ID" | "NEXT_PUBLIC_SANITY_DATASET", value: string | undefined) {
  const v = value?.trim();
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

/**
 * Set `ALLOW_BUILD_WITHOUT_SANITY=1` only for CI/skeleton builds that must compile without real CMS env.
 * Production deployments must never rely on this — pages will get empty CMS data and writes will fail.
 */
function allowBuildPlaceholder() {
  return process.env.ALLOW_BUILD_WITHOUT_SANITY === "1";
}

/** Used by the read client, Studio config, and CLI. */
export function getSanityProjectId() {
  const v = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  if (v) return v;
  if (allowBuildPlaceholder()) return BUILD_PLACEHOLDER_PROJECT;
  return requiredPublic("NEXT_PUBLIC_SANITY_PROJECT_ID", undefined);
}

export function getSanityDataset() {
  const v = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();
  if (v) return v;
  if (allowBuildPlaceholder()) return BUILD_PLACEHOLDER_DATASET;
  return requiredPublic("NEXT_PUBLIC_SANITY_DATASET", undefined);
}

function optionalTrimmed(value: string | undefined) {
  const v = value?.trim();
  return v || undefined;
}

/**
 * Token-backed clients must use the project + dataset the token was issued for.
 * If `SANITY_API_WRITE_TOKEN` is for a different project than `NEXT_PUBLIC_SANITY_*`,
 * set these server-only vars to match the token.
 */
export function getWriteProjectId() {
  return optionalTrimmed(process.env.SANITY_API_PROJECT_ID) ?? getSanityProjectId();
}

export function getWriteDataset() {
  return optionalTrimmed(process.env.SANITY_API_DATASET) ?? getSanityDataset();
}
