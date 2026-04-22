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
      <p className="text-xs uppercase tracking-widest text-ink/40">Visit the stand</p>
      <p className="mt-2 font-display text-2xl font-light text-ink/90 sm:text-3xl">
        {links.addressLine}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">
        Get directions, see photos and hours on the Google listing, and leave a review after you
        visit. For work that travels to you, use the{" "}
        <Link
          href="/on-location#inquiry"
          className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
        >
          on location inquiry form
        </Link>
        .
      </p>
      <ul className="mt-5 space-y-2.5 text-sm text-ink/80">
        <li>
          <a
            href={links.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink/60"
          >
            Open in Google Maps
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
              Google Business Profile
            </a>
            <span className="ml-1.5 text-ink/45">(hours, updates, and messages)</span>
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
              Leave a Google review
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
            <span className="ml-1.5 text-ink/45">(general email)</span>
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
