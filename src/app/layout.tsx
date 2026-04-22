import type { Metadata, Viewport } from "next";
import { Oleo_Script, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { sanityClient } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";

const display = Oleo_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityClient
    .fetch<SiteSettings | null>(siteSettingsQuery)
    .catch(() => null);

  const title =
    settings?.title ?? "Ritualmaker — Flower stand, pantry, and on-site florals";
  const description =
    settings?.description ??
    "A seasonal cut flower stand on 38 Miller Hill Road in the Hudson Valley. Pick up a bouquet anytime — pay cash or pay online.";

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualmakerny.com",
    ),
    title: { default: title, template: "%s" },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Ritualmaker",
      images: [
        {
          url: "/photos/field-mixed-tulips-cluster.jpg",
          width: 1600,
          height: 1200,
          alt: "Seasonal flowers",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/photos/field-mixed-tulips-cluster.jpg"],
    },
    icons: {
      icon: [
        { url: "/favicon.png", type: "image/png", sizes: "32x32" },
        { url: "/brand/mark-1.png", type: "image/png", sizes: "256x256" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: ["/favicon.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F1" },
    { media: "(prefers-color-scheme: dark)", color: "#A7266D" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
