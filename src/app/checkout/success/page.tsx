import Link from "next/link";
import { getSiteSettings } from "@/lib/db";
import { resolveContactLinks } from "@/lib/siteContact";
import { getStripe } from "@/lib/stripe";
import { resolveSuccessCopy } from "@/lib/checkoutSuccessCopy";
import type { FulfillmentMode } from "@/lib/standAvailability";

export const metadata = {
  title: "Thank you",
  robots: { index: false },
};

type SuccessPageProps = {
  searchParams?: { session_id?: string };
};

function parseFulfillmentMode(value: string | undefined | null): FulfillmentMode {
  if (value === "shipped" || value === "pickup" || value === "mixed") return value;
  return "unknown";
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const s = await getSiteSettings().catch(() => null);
  const c = resolveContactLinks(s);

  let fulfillmentMode: FulfillmentMode = "unknown";
  const sessionId = searchParams?.session_id?.trim();
  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      fulfillmentMode = parseFulfillmentMode(session.metadata?.fulfillmentMode);
    } catch {
      fulfillmentMode = "unknown";
    }
  }

  const copy = resolveSuccessCopy(fulfillmentMode);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-moss">Paid</p>
      <h1 className="mt-4 font-display text-5xl font-light lg:text-6xl">You&apos;re all set</h1>
      <p className="mt-6 max-w-md text-base text-ink/65">{copy.lead}</p>
      <div className="mt-6 w-full max-w-md border border-moss/25 bg-moss/10 px-4 py-4 text-left">
        <p className="text-xs uppercase tracking-widest text-moss">{copy.detailTitle}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
          {copy.detailLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {copy.showStandLinks ? (
          <>
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
          </>
        ) : null}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {copy.showStandLinks ? (
          <a
            href={c.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex border border-ink/20 bg-white px-5 py-3 text-xs uppercase tracking-widest text-ink/85 hover:border-ink/40"
          >
            Open Maps
          </a>
        ) : null}
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
          {copy.showStandLinks ? "See stand inventory" : "Back to shop"}
        </Link>
      </div>
    </div>
  );
}
