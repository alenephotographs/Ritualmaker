import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/farm-stand`, lastModified: now, priority: 0.9 },
    { url: `${base}/photography`, lastModified: now, priority: 0.8 },
    { url: `${base}/on-location`, lastModified: now, priority: 0.8 },
  ];
}
