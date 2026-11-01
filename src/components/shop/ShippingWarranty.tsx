"use client";

import { useRef } from "react";
import type { AnimatedIconHandle } from "@/components/icons/types";
import TruckElectricIcon from "@/components/icons/truck-electric-icon";
import ShieldCheck from "@/components/icons/shield-check";

/**
 * Shipping and warranty as two quiet horizontal notes: a small icon, a
 * micro-caps label and the merchant's own copy, separated by hairlines.
 */
export function ShippingWarranty({
  shippingInfo,
  warrantyInfo,
}: {
  shippingInfo?: string | null;
  warrantyInfo?: string | null;
}) {
  const truckRef = useRef<AnimatedIconHandle>(null);
  const shieldRef = useRef<AnimatedIconHandle>(null);

  if (!shippingInfo && !warrantyInfo) return null;

  return (
    <section className="ms-pdp__section" aria-label="Shipping and warranty">
      <div className="wrap">
        <div className="ms-pdp__assure">
          {shippingInfo && (
            <div
              className="ms-pdp__assure-row"
              onMouseEnter={() => truckRef.current?.startAnimation()}
              onMouseLeave={() => truckRef.current?.stopAnimation()}
            >
              <span className="ms-pdp__assure-icon" aria-hidden="true">
                <TruckElectricIcon ref={truckRef} size={17} strokeWidth={1.6} />
              </span>
              <div className="ms-pdp__assure-body">
                <h2 className="ms-pdp__assure-title">Shipping</h2>
                <p className="ms-pdp__assure-text">{shippingInfo}</p>
              </div>
            </div>
          )}
          {warrantyInfo && (
            <div
              className="ms-pdp__assure-row"
              onMouseEnter={() => shieldRef.current?.startAnimation()}
              onMouseLeave={() => shieldRef.current?.stopAnimation()}
            >
              <span className="ms-pdp__assure-icon" aria-hidden="true">
                <ShieldCheck ref={shieldRef} size={17} strokeWidth={1.6} />
              </span>
              <div className="ms-pdp__assure-body">
                <h2 className="ms-pdp__assure-title">Warranty</h2>
                <p className="ms-pdp__assure-text">{warrantyInfo}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
