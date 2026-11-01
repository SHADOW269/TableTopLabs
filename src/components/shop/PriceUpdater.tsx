"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/utils/money";

export function PriceUpdater({
  initial,
}: {
  initial: number;
}) {
  const [price, setPrice] = useState(initial);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ price?: number }>).detail;
      if (typeof detail?.price === "number") {
        setPrice(detail.price);
      }
    };
    window.addEventListener("ms-pdp-price", handler);
    return () => window.removeEventListener("ms-pdp-price", handler);
  }, []);

  return <span className="ms-pdp__price">{formatINR(price)}</span>;
}
