"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ShopCartContextValue = {
  itemCount: number;
  setItemCount: (count: number) => void;
  requestScrollToCart: () => void;
  consumeScrollToCart: () => boolean;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function ShopCartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
  const [scrollPending, setScrollPending] = useState(false);

  const requestScrollToCart = useCallback(() => {
    setScrollPending(true);
  }, []);

  const consumeScrollToCart = useCallback(() => {
    if (!scrollPending) return false;
    setScrollPending(false);
    return true;
  }, [scrollPending]);

  const value = useMemo(
    () => ({
      itemCount,
      setItemCount,
      requestScrollToCart,
      consumeScrollToCart,
    }),
    [itemCount, requestScrollToCart, consumeScrollToCart],
  );

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart() {
  const ctx = useContext(ShopCartContext);
  if (!ctx) {
    throw new Error("useShopCart must be used within ShopCartProvider");
  }
  return ctx;
}
