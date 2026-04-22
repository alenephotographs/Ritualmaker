/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "archive.boutique" },
      { protocol: "https", hostname: "*.archive.boutique" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
  async redirects() {
    // Preserve any inbound links from the prior Webflow site here.
    return [
      { source: "/reviews", destination: "/#reviews", permanent: true },
      { source: "/faq", destination: "/#faq", permanent: true },
      { source: "/weddings", destination: "/on-location", permanent: true },
      { source: "/events", destination: "/on-location", permanent: true },
      { source: "/live", destination: "/on-location", permanent: true },
    ];
  },
};

export default nextConfig;
