/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "archive.boutique" },
      { protocol: "https", hostname: "*.archive.boutique" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/proposal/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    // Preserve any inbound links from the prior Webflow site here.
    return [
      {
        source: "/admin/documents",
        destination: "/admin/events",
        permanent: true,
      },
      {
        source: "/admin/documents/new",
        destination: "/admin/events/new",
        permanent: true,
      },
      {
        source: "/admin/documents/:id",
        destination: "/admin/events/:id",
        permanent: true,
      },
      { source: "/shop", destination: "/farm-stand", permanent: true },
      { source: "/pantry", destination: "/farm-stand#shop", permanent: true },
      { source: "/reviews", destination: "/", permanent: true },
      { source: "/faq", destination: "/#faq", permanent: true },
      { source: "/weddings", destination: "/on-location", permanent: true },
      { source: "/events", destination: "/on-location", permanent: true },
      { source: "/live", destination: "/on-location", permanent: true },
    ];
  },
};

export default nextConfig;
