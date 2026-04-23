import Link from "next/link";
import type { ResolvedContactLinks } from "@/lib/siteContact";

type ContactOutreachBlockProps = {
  links: ResolvedContactLinks;
  id?: string;
};

/**
 * Location + Google links + email. Primary placement: farm stand page.
 */
export function ContactOutreachBlock({ links, id }: ContactOutreachBlockProps) {
  return (
    <div
      id={id}
      className="mb-10 border border-ink/10 bg-white p-6 lg:p-8"
    >
      <p className="text-xs uppercase tracking-widest text-ink/40">Visit</p>
      <p className="mt-2 font-display text-2xl font-light text-ink/90 sm:text-3xl">
        {links.addressLine}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">
        <Link
          href="/on-location#inquiry"
          className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
        >
          Event florals &amp; travel
        </Link>
        {" — separate from the stand."}
      </p>
      <ul className="mt-5 space-y-2.5 text-sm text-ink/80">
        <li>
          <a
            href={links.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
          >
            Maps
          </a>
        </li>
        {links.googleProfileUrl ? (
          <li>
            <a
              href={links.googleProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
            >
              Google
            </a>
            <span className="ml-1.5 text-ink/45">hours &amp; photos</span>
          </li>
        ) : null}
        {links.googleReviewUrl ? (
          <li>
            <a
              href={links.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
            >
              Review
            </a>
          </li>
        ) : null}
        {links.email ? (
          <li>
            <a
              href={`mailto:${links.email}`}
              className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
            >
              {links.email}
            </a>
          </li>
        ) : null}
        {links.instagramUrl ? (
          <li>
            <a
              href={links.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
            >
              Instagram
              {links.instagramHandle ? ` ${links.instagramHandle}` : ""}
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
