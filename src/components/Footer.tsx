import Link from "next/link";
import { sanityClient } from "@/sanity/client";
import { siteSettingsQuery } from "@/sanity/queries";
import type { SiteSettings } from "@/sanity/types";
import { Wordmark, brandCategoryClassName } from "@/components/Logo";

export async function Footer() {
  const s = await sanityClient
    .fetch<SiteSettings | null>(siteSettingsQuery)
    .catch(() => null);

  return (
    <footer className="border-t border-ink/10 bg-stone/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" className="inline-block" aria-label="Ritualmaker, home">
            <Wordmark className="text-2xl text-ink lg:text-3xl" />
          </Link>
          <p className="mt-4 text-sm text-ink/60">
            {s?.tagline ?? "Fresh flowers in the neighborhood, 24/7."}
          </p>
          {s?.address && (
            <p className="mt-4 text-sm text-ink/50">{s.address}</p>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:text-ink">
                All bouquets
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-ink">
                How to buy
              </Link>
            </li>
            <li>
              <Link href="/pantry" className="hover:text-ink">
                Pantry
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">
            Connect
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {s?.instagramUrl && (
              <li>
                <a
                  href={s.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    s.instagramHandle
                      ? `Instagram ${s.instagramHandle}`
                      : "Instagram"
                  }
                  className="hover:text-ink"
                >
                  Instagram{s.instagramHandle ? ` ${s.instagramHandle}` : ""}
                </a>
              </li>
            )}
            {s?.email && (
              <li>
                <a href={`mailto:${s.email}`} className="hover:text-ink">
                  {s.email}
                </a>
              </li>
            )}
            {s?.mapUrl && (
              <li>
                <a
                  href={s.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink"
                >
                  Find the stand
                </a>
              </li>
            )}
            {s?.googleReviewUrl && (
              <li>
                <a
                  href={s.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink"
                >
                  Leave a Google review
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">Ritualmaker</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/#shop" className="hover:text-ink">
                Ritualmaker Flowers
              </Link>
            </li>
            <li>
              <Link href="/photography" className="hover:text-ink">
                Ritualmaker Photography
              </Link>
            </li>
            <li>
              <Link href="/pantry" className="hover:text-ink">
                Ritualmaker Pantry
              </Link>
            </li>
            <li>
              <Link href="/on-location" className="hover:text-ink">
                On location
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10 bg-cream/70">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <p className="text-[10px] uppercase tracking-widest text-ink/40">
            Ritualmaker family
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-ink/80">
            <Link href="/#shop" className={`${brandCategoryClassName} inline-block`}>
              Flowers
            </Link>
            <Link href="/photography" className={`${brandCategoryClassName} inline-block`}>
              Photos
            </Link>
            <Link href="/pantry" className={`${brandCategoryClassName} inline-block`}>
              Pantry
            </Link>
            <Link
              href="/on-location"
              className={`${brandCategoryClassName} inline-block`}
              aria-label="Ritualmaker on location — weddings, pop-up flower bars, commercial accounts, and Live Collage"
            >
              On site
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-ink/10 py-6 text-center text-xs text-ink/40">
        © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
