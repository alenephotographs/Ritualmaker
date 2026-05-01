"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string }[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="flex w-full max-w-full flex-wrap justify-start gap-1 rounded-lg border border-ink/10 bg-white p-1.5 shadow-sm lg:justify-end"
    >
      {LINKS.map(({ href, label }) => {
        const active =
          pathname === href || (href === "/admin/dashboard" && pathname === "/admin");
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-md px-3 py-2 text-[10px] font-medium uppercase tracking-widest transition ${
              active ? "bg-ink text-cream" : "text-ink/65 hover:bg-cream/80 hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
