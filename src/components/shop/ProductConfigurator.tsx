"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";
import { formatINR } from "@/lib/utils/money";
import {
  defaultOptionId,
  optionControlKind,
  selectionModeOf,
  sumSelectedAddons,
  type OptionGroupLike,
} from "@/lib/catalog/product-options";
import CartIcon from "@/components/icons/cart-icon";
import type { AnimatedIconHandle } from "@/components/icons/types";

/**
 * Configurator for products with admin-defined option groups
 * (ProductOptionGroup / ProductOption). Price = base + Σ addons; the server
 * action recomputes it from live data on submit.
 *
 * SINGLE groups render as compact radio chips; the base option of every
 * required SINGLE group is auto-selected on mount so the product is immediately
 * purchasable. MULTIPLE groups render as checkbox chips — zero or more, at
 * least one when required — and never auto-select, so the customer's
 * accessories are their own choice.
 *
 * `selectionMode` is a property of each group (e.g. an "Accessories" group can
 * be MULTIPLE); nothing here keyed off a group name or product type.
 *
 * Presentation only: each group is a wrapping chip set under a
 * "CATEGORY — CURRENT SELECTION" label. Prices stay in the backend and the
 * live total; they are never shown beside individual options.
 */
export function ProductConfigurator({
  productId,
  groups,
  basePrice,
  baseAvailable,
  madeToOrder = false,
}: {
  productId: string;
  groups: OptionGroupLike[];
  basePrice: number;
  baseAvailable: number;
  madeToOrder?: boolean;
}) {
  const router = useRouter();
  const active = groups.filter((g) => g.enabled);
  const [picks, setPicks] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const g of active) {
      if (selectionModeOf(g) === "SINGLE" && g.required) {
        const def = defaultOptionId(g);
        init[g.id] = def ? [def] : [];
      } else {
        init[g.id] = [];
      }
    }
    return init;
  });
  const [qty, setQty] = useState(1);
  const [buyNow, setBuyNow] = useState(false);
  const [state, action, pending] = useActionState(addToCart, null);
  const cartIconRef = useRef<AnimatedIconHandle>(null);
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

  const complete = active.every(
    (g) => !g.required || (picks[g.id]?.length ?? 0) > 0,
  );
  const optionIds = active.flatMap((g) => picks[g.id] ?? []);
  const configuredPrice = basePrice + sumSelectedAddons(active, optionIds);
  const out = baseAvailable <= 0;

  const toggle = (g: OptionGroupLike, optionId: string) => {
    setPicks((p) => {
      const current = p[g.id] ?? [];
      if (selectionModeOf(g) === "MULTIPLE") {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...p, [g.id]: next };
      }
      return { ...p, [g.id]: [optionId] };
    });
    // Only SINGLE picks reset quantity — the pre-existing radio behaviour.
    if (selectionModeOf(g) === "SINGLE") setQty(1);
  };

  const makeAvailabilityText = () => {
    if (out) return "OUT OF STOCK";
    if (madeToOrder) return "MADE TO ORDER — BUILT AFTER ORDER";
    if (baseAvailable <= 3)
      return `ONLY ${baseAvailable} LEFT IN STOCK — ORDER SOON`;
    return "IN STOCK";
  };

  useEffect(() => {
    if (state?.ok && buyNow) router.push("/collection/checkout");
  }, [state, buyNow, router]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("ms-pdp-price", { detail: { price: configuredPrice } }),
    );
  }, [configuredPrice]);

  return (
    <form action={action} className="ms-pdp__form ms-pdp-form">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={qty} />
      <input type="hidden" name="optionIds" value={JSON.stringify(optionIds)} />

      <div className="ms-pdp__options">
        {active.map((g) => {
          const multi = optionControlKind(g) === "checkbox";
          const selected = picks[g.id] ?? [];
          const legendId = `opt-group-${g.id}`;
          const summary = selected
            .map(
              (id) =>
                g.options.find((o) => o.id === id && o.enabled)?.name ?? id,
            )
            .filter(Boolean)
            .join(", ");
          const showSummary = summary || (!multi && g.required);
          return (
            <div className="ms-pdp__group ms-pdp__group--pillglass" key={g.id}>
              <div className="ms-pdp__group-head" id={legendId}>
                <span className="ms-pdp__group-title">
                  {g.name.toUpperCase()} {showSummary ? `— ${summary}` : ""}
                </span>
              </div>
              <div
                className="ms-pdp__opts ms-pdp__opts--inline"
                role={multi ? "group" : "radiogroup"}
                aria-labelledby={legendId}
              >
                {g.options
                  .filter((o) => o.enabled)
                  .map((o) => {
                    const isSelected = selected.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        role={multi ? "checkbox" : "radio"}
                        aria-checked={isSelected}
                        className={`ms-pdp__pill${multi ? " ms-pdp__pill--multi" : ""}${isSelected ? " is-selected" : ""}`}
                        onClick={() => toggle(g, o.id)}
                      >
                        {!multi && (
                          <span className="ms-pdp__pill-indicator" aria-hidden="true">
                            {isSelected ? "●" : "○"}
                          </span>
                        )}
                        {multi && isSelected && (
                          <span className="ms-pdp__pill-indicator" aria-hidden="true">
                            ●
                          </span>
                        )}
                        <span className="ms-pdp__pill-name">{o.name}</span>
                        {o.priceAddon > 0 && (
                          <span className="ms-pdp__pill-price">
                            +{formatINR(o.priceAddon)}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Purchase ─────────────────────────────────────────────────────── */}
      <div className="ms-pdp__buyframe ms-pdp__buyframe--module">
        <div className="ms-pdp__buy">
          <div className="ms-pdp__buy-row">
            <div className="ms-pdp__buy-total-row">
              <span className="ms-pdp__buy-total-label">TOTAL</span>
              <span className="ms-pdp__buy-total-price">{formatINR(configuredPrice)}</span>
            </div>

            <div className="ms-pdp__buy-qty-wrap">
              <div className="ms-pdp__qty-compact">
                <button
                  type="button"
                  className="ms-pdp__qty-compact-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="ms-pdp__qty-compact-value">{qty}</span>
                <button
                  type="button"
                  className="ms-pdp__qty-compact-btn"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="ms-pdp__buy-divider" aria-hidden="true" />

          <div className="ms-pdp__buy-ctas">
            <button
              type="submit"
              className={`ms-pdp__atc-compact${added && !buyNow ? " is-added" : ""}`}
              disabled={pending || out || !complete || (added && !buyNow)}
              onClick={() => setBuyNow(false)}
              onMouseEnter={() => cartIconRef.current?.startAnimation()}
              onMouseLeave={() => cartIconRef.current?.stopAnimation()}
            >
              {!(added && !buyNow) && !out && (
                <CartIcon ref={cartIconRef} size={16} strokeWidth={1.8} />
              )}
              {out
                ? "OUT OF STOCK"
                : added && !buyNow
                  ? "✓ ADDED"
                  : pending
                    ? "ADDING…"
                    : "ADD TO CART"}
            </button>

            {!out && (
              <button
                type="submit"
                className="ms-pdp__buynow-compact"
                disabled={pending || !complete}
                onClick={() => setBuyNow(true)}
              >
                BUY NOW
              </button>
            )}
          </div>

          {madeToOrder && (
            <p className="ms-pdp__status" role="note">
              <span className="ms-pdp__status-dot" aria-hidden="true" />
              <span className="ms-pdp__status-text">MADE TO ORDER — BUILT AFTER ORDER</span>
            </p>
          )}

          {!madeToOrder && (
            <p className="ms-pdp__status" role="note">
              <span className="ms-pdp__status-dot" aria-hidden="true" />
              <span className="ms-pdp__status-text">{makeAvailabilityText()}</span>
            </p>
          )}

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
