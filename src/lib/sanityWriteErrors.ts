/**
 * Sanity Content Lake returns opaque messages for token/project mismatch.
 * Surface actionable guidance in admin API responses.
 */
export function formatSanityWriteError(error: unknown, fallback = "Could not save"): string {
  const message = error instanceof Error ? error.message : fallback;
  if (/session does not match project host/i.test(message)) {
    return (
      "Sanity rejected the write token for this project. Use a token from the same project as your data, or set SANITY_API_PROJECT_ID and SANITY_API_DATASET (server-only) to match SANITY_API_WRITE_TOKEN, and keep NEXT_PUBLIC_SANITY_* in sync with where the app reads from."
    );
  }
  return message || fallback;
}
