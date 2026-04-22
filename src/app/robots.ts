import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/", "/checkout/", "/admin", "/api/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
