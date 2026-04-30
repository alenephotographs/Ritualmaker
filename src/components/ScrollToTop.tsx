"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Next client navigations do not always reset scroll. After a real path (or query)
 * change, scroll to the top so users do not land mid-page on a different route.
 * Hash-only updates on the same path are left to the browser.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, searchParams]);

  return null;
}
