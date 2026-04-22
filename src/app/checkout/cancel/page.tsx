import Link from "next/link";

export const metadata = {
  title: "Checkout cancelled",
  robots: { index: false },
};

export default function CancelPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-magenta">
        No charge made
      </p>
      <h1 className="mt-4 font-display text-5xl font-light lg:text-6xl">
        Checkout cancelled.
      </h1>
      <p className="mt-6 max-w-md text-base text-ink/65">
        No worries — nothing was charged. Try again any time, or pay cash at the
        stand.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/shop#flowers"
          className="bg-ink px-6 py-3 text-xs uppercase tracking-widest text-cream hover:bg-charcoal"
        >
          Try checkout again
        </Link>
        <Link
          href="/shop"
          className="border border-ink/20 px-6 py-3 text-xs uppercase tracking-widest hover:bg-ink hover:text-cream"
        >
          Pay cash at stand
        </Link>
      </div>
    </div>
  );
}
