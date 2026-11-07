"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";
import { formatINR } from "@/lib/utils/money";
import CartIcon from "@/components/icons/cart-icon";
import type { AnimatedIconHandle } from "@/components/icons/types";
import { QuantityStepper } from "@/components/shop/QuantityStepper";

type VariantProp = {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  stock: number;
  reservedQuantity: number;
  options?: Record<string, string> | null;
};

const labelize = (k: string) =>
  k.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* Option groups are derived entirely from variant.options JSON (e.g. {"case color": "Black"})
   so any product's configuration surfaces automatically. Empty → legacy dropdown mode. */
function buildGroups(variants: VariantProp[]) {
  if (
    !variants.length ||
    variants.some((v) => !v.options || Object.keys(v.options).length === 0)
  )
    return [];
  const order: string[] = [];
  const values = new Map<string, Set<string>>();
  for (const v of variants) {
    for (const [k, val] of Object.entries(v.options!)) {
      if (typeof val !== "string") continue;
      if (!values.has(k)) {
        values.set(k, new Set());
        order.push(k);
      }
      values.get(k)!.add(val);
    }
  }
  return order.map((k) => ({
    name: k,
    label: labelize(k),
    values: [...values.get(k)!],
  }));
}

export function AddToCart({
  productId,
  variants,
  baseAvailable,
  basePrice = 0,
  madeToOrder = false,
}: {
  productId: string;
  variants: VariantProp[];
  baseAvailable: number;
  /** The product's list price — the anchor for the per-option price deltas. */
  basePrice?: number;
  madeToOrder?: boolean;
}) {
  const router = useRouter();
  const groups = useMemo(() => buildGroups(variants), [variants]);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [buyNow, setBuyNow] = useState(false);
  const [state, action, pending] = useActionState(addToCart, null);
  const prevPendingRef = useRef(pending);
  const added = state?.ok === true && !pending;
  useEffect(() => {
    if (prevPendingRef.current && !pending && state?.ok) {
      window.dispatchEvent(new Event("kf-cart-changed"));
      window.dispatchEvent(
        new CustomEvent("kf-cart-added", {
          detail: { count: state.count ?? 0 },
        }),
      );
    }
    prevPendingRef.current = pending;
  }, [pending, state]);
  const cartIconRef = useRef<AnimatedIconHandle>(null);

  const matches = (v: VariantProp, picks: Record<string, string>) =>
    Object.entries(picks).every(([k, val]) => !val || v.options?.[k] === val);
  const complete =
    groups.length > 0 && groups.every((g) => selectedOptions[g.name]);
  const selected =
    groups.length > 0
      ? complete
        ? (variants.find((v) => matches(v, selectedOptions)) ?? null)
        : null
      : (variants.find((v) => v.id === variantId) ?? null);

  const available = selected
    ? Math.max(0, selected.stock - selected.reservedQuantity)
    : baseAvailable;
  const out = available <= 0;

  /* The unit price of the resolved variant — the list price when the variant
     carries no price of its own. */
  const unitPrice = selected ? (selected.price ?? basePrice) : basePrice;

  const makeAvailabilityText = () => {
    if (out) return "Out of stock";
    if (madeToOrder) return "Made to order — we build it after you order.";
    if (available <= 3) return `Only ${available} left in stock — order soon.`;
    return "In stock";
  };

  useEffect(() => {
    if (state?.ok && buyNow) router.push("/collection/checkout");
  }, [state, buyNow, router]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("ms-pdp-price", { detail: { price: unitPrice } }),
    );
  }, [unitPrice]);

  const valueEnabled = (group: string, value: string) =>
    variants.some(
      (v) =>
        v.options?.[group] === value &&
        Object.entries(selectedOptions).every(
          ([k, val]) => k === group || !val || v.options?.[k] === val,
        ),
    );

  /* The price a given option value would carry, relative to the list price.
     Used for display only; calculation remains unchanged. */
  const priceDeltaFor = (group: string, value: string): number | null => {
    const probe = { ...selectedOptions, [group]: value };
    const v = variants.find((x) => matches(x, probe));
    if (!v) return null;
    return (v.price ?? basePrice) - basePrice;
  };

  return (
    <form action={action} className="ms-pdp__form">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="variantId" value={selected?.id ?? ""} />
      <input type="hidden" name="quantity" value={qty} />

      {groups.length > 0 ? (
        <div className="ms-pdp__options">
          {groups.map((g) => {
            const legendId = `opt-group-${g.name}`;
            const current = selectedOptions[g.name];
            return (
              <div className="ms-pdp__group" key={g.name}>
                <span className="ms-pdp__group-legend" id={legendId}>
                  <span className="ms-pdp__group-name">{g.label}</span>
                  <span className="ms-pdp__group-value">
                    {current ?? "Select one"}
                  </span>
                </span>
                <div
                  className="ms-pdp__opts"
                  role="radiogroup"
                  aria-labelledby={legendId}
                >
                  {g.values.map((value) => {
                    const active = selectedOptions[g.name] === value;
                    const enabled = valueEnabled(g.name, value);
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={!enabled}
                        className="ms-pdp__opt"
                        onClick={() => {
                          const next = { ...selectedOptions, [g.name]: value };
                          setSelectedOptions(next);
                          setQty(1);
                        }}
                      >
                        <span className="ms-pdp__opt-name">{value}</span>
                        {enabled && priceDeltaFor(g.name, value) != null && priceDeltaFor(g.name, value)! > 0 && (
                          <span className="ms-pdp__opt-price">
                            +{formatINR(priceDeltaFor(g.name, value)!)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!complete && (
            <p className="ms-pdp__opt-note">
              Pick an option for every field to continue.
            </p>
          )}
        </div>
      ) : (
        variants.length > 0 && (
          /* Legacy products carry no option JSON — a single dimension, kept as
             a select so the existing variant choice is untouched. */
          <div className="ms-pdp__group">
            <span className="ms-pdp__group-legend" id="opt-group-variant">
              Variant
            </span>
            <select
              value={variantId}
              onChange={(e) => {
                setVariantId(e.target.value);
                setQty(1);
              }}
              className="ms-pdp__select"
              aria-labelledby="opt-group-variant"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )
      )}

      {/* ── Purchase ─────────────────────────────────────────────────────── */}
      <div className="ms-pdp__buyframe">
        <div className="ms-pdp__buy">
          <div className="ms-pdp__buy-row">
            <QuantityStepper value={qty} onChange={setQty} />
            <button
              type="submit"
              className={`ms-pdp__atc${added && !buyNow ? " is-added" : ""}`}
              disabled={
                pending ||
                out ||
                (groups.length > 0 && !complete) ||
                (added && !buyNow)
              }
              onClick={() => setBuyNow(false)}
              onMouseEnter={() => cartIconRef.current?.startAnimation()}
              onMouseLeave={() => cartIconRef.current?.stopAnimation()}
            >
              {!(added && !buyNow) && !out && (
                <CartIcon ref={cartIconRef} size={16} strokeWidth={1.8} />
              )}
              {out
                ? "Out of Stock"
                : added && !buyNow
                  ? "✓ Added"
                  : pending
                    ? "Adding…"
                    : "Add to Cart"}
            </button>
          </div>

          {!out && (
            <button
              type="submit"
              className="ms-pdp__buynow"
              disabled={pending || (groups.length > 0 && !complete)}
              onClick={() => setBuyNow(true)}
            >
              Buy Now
            </button>
          )}

          <p className="ms-pdp__avail" role="note">
            <span
              className={`ms-pdp__avail-dot${out ? " is-out" : ""}`}
              aria-hidden="true"
            />
            {makeAvailabilityText()}
          </p>

          {state?.error && (
            <p className="ms-pdp__err" role="alert">
              {state.error}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
