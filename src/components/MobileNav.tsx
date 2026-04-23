"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { Wordmark } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/farm-stand", name: "Farm stand" },
  { href: "/photography", name: "Photography" },
  { href: "/on-location", name: "On location" },
] as const;

type MobileNavProps = {
  standClosed: boolean;
};

export function MobileNav({ standClosed }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const cta = standClosed ? "Stand closed" : "Shop flowers";
  const ctaHref = "/farm-stand#flowers";

  return (
    <div className="flex items-center gap-2 md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center border border-ink/15 text-ink/80 transition-colors hover:bg-ink/5"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open menu"
      >
        <span className="sr-only">Open menu</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <Link
        href={ctaHref}
        className="bg-ink px-3 py-2.5 text-[10px] uppercase tracking-widest text-cream transition-colors hover:bg-charcoal sm:px-4"
      >
        {cta}
      </Link>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={close}
          />
          <div
            id={panelId}
            className="relative flex h-full w-full max-w-sm flex-col border-l border-ink/10 bg-cream shadow-2xl"
          >
            <div className="border-b border-ink/10 px-4 py-4">
              <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-ink/40">
                Menu
              </span>
              <button
                type="button"
                onClick={close}
                className="flex h-10 w-10 items-center justify-center text-ink/70 hover:bg-ink/5"
                aria-label="Close menu"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              </div>
              <div className="mt-3">
                <Wordmark className="h-8 w-auto" />
              </div>
            </div>
            <nav className="flex flex-1 flex-col gap-0 overflow-y-auto px-2 py-2" aria-label="Ritualmaker categories">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="border-b border-ink/5 px-3 py-3.5 text-left hover:bg-stone/30"
                >
                  <span className="block font-display text-2xl font-light leading-none tracking-tight text-ink/90">
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
