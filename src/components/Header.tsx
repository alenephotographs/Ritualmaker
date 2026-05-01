import { sanityClient } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";
import { HeaderClient } from "@/components/HeaderClient";

export async function Header() {
  const settings = await sanityClient
    .fetch<SiteSettings | null>(siteSettingsQuery)
    .catch(() => null);
  const standClosed = settings?.standStatus === "closed";

  return <HeaderClient standClosed={standClosed} />;
}
