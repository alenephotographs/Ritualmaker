import Link from "next/link";

export const metadata = {
  title: "Thank you",
  robots: { index: false },
};

export default function SuccessPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-moss">
        Payment received
      </p>
      <h1 className="mt-4 font-display text-5xl font-light lg:text-6xl">
        Thank you for stopping by.
      </h1>
      <p className="mt-6 max-w-md text-base text-ink/65">
        Your bouquet is yours — grab it from the stand on Miller Hill Road. If
        the shelf you ordered from is empty, take an equivalent one or DM us on
        Instagram and we'll sort it out.
      </p>
      <div className="mt-6 w-full max-w-md border border-moss/25 bg-moss/10 px-4 py-4 text-left">
        <p className="text-xs uppercase tracking-widest text-moss">Pickup checklist</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink/70">
          <li>1) Go to the flower stand on Miller Hill Road.</li>
          <li>2) Pick up your bouquet from the matching shelf.</li>
          <li>3) If it is empty, take an equivalent bouquet and message us.</li>
        </ul>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal"
        >
          Back home
        </Link>
        <Link
          href="/shop"
          className="border border-ink/20 px-6 py-3 text-xs uppercase tracking-widest hover:bg-ink hover:text-cream"
        >
          Buy another
        </Link>
      </div>
    </div>
  );
}
