import Link from "next/link";
import { sanityClient } from "@/sanity/client";
import { resolveContactLinks } from "@/lib/siteContact";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";

export const metadata = {
  title: "Thank you",
  robots: { index: false },
};

export default async function SuccessPage() {
  const s = await sanityClient.fetch<SiteSettings | null>(siteSettingsQuery).catch(() => null);
  const c = resolveContactLinks(s);
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-moss">
        Paid
      </p>
      <h1 className="mt-4 font-display text-5xl font-light lg:text-6xl">
        You&apos;re all set
      </h1>
      <p className="mt-6 max-w-md text-base text-ink/65">
        Pick up at the stand, 38 Miller Hill Road. Wrong shelf or empty? Grab a match
        and DM us on Instagram.
      </p>
      <div className="mt-6 w-full max-w-md border border-moss/25 bg-moss/10 px-4 py-4 text-left">
        <p className="text-xs uppercase tracking-widest text-moss">Pickup</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
          <li>1. Stand at 38 Miller Hill Road</li>
          <li>2. Your bouquet, labeled shelf</li>
          <li>3. Shelf bare? Take the closest match + message us</li>
        </ul>
        <p className="mt-3 text-xs uppercase tracking-widest text-ink/40">Links</p>
        <ul className="mt-1.5 space-y-1 text-sm text-ink/75">
          <li>
            <a
              href={c.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-ink/25 underline-offset-2 hover:decoration-ink/50"
            >
              Maps
            </a>
          </li>
          {c.googleProfileUrl ? (
            <li>
              <a
                href={c.googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/25 underline-offset-2 hover:decoration-ink/50"
              >
                Google
              </a>{" "}
              <span className="text-ink/45">hours &amp; photos</span>
            </li>
          ) : null}
          {c.googleReviewUrl ? (
            <li>
              <a
                href={c.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/25 underline-offset-2 hover:decoration-ink/50"
              >
                Leave a review
              </a>
            </li>
          ) : null}
        </ul>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={c.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex border border-ink/20 bg-white px-5 py-3 text-xs uppercase tracking-widest text-ink/85 hover:border-ink/40"
        >
          Open Maps
        </a>
        <Link
          href="/"
          className="inline-flex bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal"
        >
          Back home
        </Link>
        <Link
          href="/farm-stand"
          className="inline-flex border border-ink/20 px-5 py-3 text-xs uppercase tracking-widest text-ink/85 hover:bg-ink hover:text-cream"
        >
          Order again
        </Link>
      </div>
    </div>
  );
}
