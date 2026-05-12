"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShopCart } from "@/components/shop/ShopCartContext";

const CART_HREF = "/farm-stand#cart";

function scrollToCartEl() {
  const el = document.getElementById("cart");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function HeaderFarmStandCart({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { itemCount } = useShopCart();
  const onFarmStand = pathname === "/farm-stand";

  return (
    <a
      href={CART_HREF}
      className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center border border-ink/15 text-ink/85 transition-colors hover:bg-ink/5 ${className}`}
      aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"}
      onClick={(e) => {
        if (onFarmStand) {
          e.preventDefault();
          scrollToCartEl();
        }
      }}
    >
      <span className="sr-only">View cart</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 7h15l-1.5 9h-12L6 7Zm0 0L5 3H2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.25" fill="currentColor" />
        <circle cx="17" cy="20" r="1.25" fill="currentColor" />
      </svg>
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-cream">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </a>
  );
}

/** Same cart affordance for narrow header; uses Link for non–farm-stand routes. */
export function HeaderFarmStandCartMobile({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { itemCount } = useShopCart();
  const onFarmStand = pathname === "/farm-stand";

  if (onFarmStand) {
    return <HeaderFarmStandCart className={className} />;
  }

  return (
    <Link
      href={CART_HREF}
      className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center border border-ink/15 text-ink/85 transition-colors hover:bg-ink/5 ${className}`}
      aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"}
    >
      <span className="sr-only">View cart on farm stand</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 7h15l-1.5 9h-12L6 7Zm0 0L5 3H2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.25" fill="currentColor" />
        <circle cx="17" cy="20" r="1.25" fill="currentColor" />
      </svg>
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-cream">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
