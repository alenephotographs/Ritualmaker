"use client";

import type { ReactNode } from "react";
import { ShopCartProvider } from "@/components/shop/ShopCartContext";

export function ClientProviders({ children }: { children: ReactNode }) {
  return <ShopCartProvider>{children}</ShopCartProvider>;
}
